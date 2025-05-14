import { App, Plugin, PluginSettingTab, Setting, Notice } from 'obsidian';

interface CodeBlockFileExportSettings {
	defaultFileExtension: string;
	customLanguageMappings: string; // JSON string storing custom language to extension mappings
}

const DEFAULT_SETTINGS: CodeBlockFileExportSettings = {
	defaultFileExtension: 'txt',
	customLanguageMappings: '{}'
}

export default class CodeBlockFileExportPlugin extends Plugin {
	settings: CodeBlockFileExportSettings;

	async onload() {
		await this.loadSettings();

		// Add a settings tab
		this.addSettingTab(new CodeBlockFileExportSettingTab(this.app, this));

		// Register the post processor to add export buttons to code blocks
		this.registerMarkdownPostProcessor((element) => {
			// Find all code blocks
			const codeBlocks = element.querySelectorAll('pre > code');
			
			codeBlocks.forEach((codeBlock) => {
				const pre = codeBlock.parentElement;
				
				// Only proceed if we found a valid pre element
				if (!pre) return;
				
				// Get the language of the code block
				const language = this.getLanguageFromCodeBlock(codeBlock);
				
				// Create the export button
				const exportButton = this.createExportButton(codeBlock, language);
				
				// Add the button to the pre element
				pre.appendChild(exportButton);
			});
		});
	}

	// Map of language names to file extensions
	private readonly LANGUAGE_EXTENSIONS: Record<string, string> = {
		// JavaScript family
		'js': 'js',
		'javascript': 'js',
		'jsx': 'jsx',
		'ts': 'ts',
		'typescript': 'ts',
		'tsx': 'tsx',
		
		// Web languages
		'html': 'html',
		'xml': 'xml',
		'svg': 'svg',
		'css': 'css',
		'scss': 'scss',
		'sass': 'sass',
		'less': 'less',
		'json': 'json',
		
		// Server languages
		'php': 'php',
		'py': 'py',
		'python': 'py',
		'rb': 'rb',
		'ruby': 'rb',
		'java': 'java',
		'c': 'c',
		'cpp': 'cpp',
		'cs': 'cs',
		'csharp': 'cs',
		'go': 'go',
		'rust': 'rs',
		'swift': 'swift',
		'kotlin': 'kt',
		
		// Shell/scripting
		'bash': 'sh',
		'shell': 'sh',
		'sh': 'sh',
		'zsh': 'sh',
		'powershell': 'ps1',
		'ps': 'ps1',
		'ps1': 'ps1',
		'bat': 'bat',
		'cmd': 'bat',
		
		// Data/config formats
		'yaml': 'yaml',
		'yml': 'yml',
		'toml': 'toml',
		'ini': 'ini',
		'csv': 'csv',
		
		// Database
		'sql': 'sql',
		'mysql': 'sql',
		'pgsql': 'sql',
		'postgresql': 'sql',
		
		// Other
		'md': 'md',
		'markdown': 'md',
		'tex': 'tex',
		'latex': 'tex',
		'r': 'r',
		'matlab': 'm',
		'graphql': 'graphql',
		'gql': 'graphql',
		'dart': 'dart',
		'dockerfile': 'dockerfile',
	};

	/**
	 * Extract the language from a code block element and map it to appropriate file extension
	 */
	getLanguageFromCodeBlock(codeBlock: Element): string {
		// Check for language classes like "language-js" or "language-python"
		const classList = Array.from(codeBlock.classList);
		let language = this.settings.defaultFileExtension;
		
		// Extract language identifier from class
		for (const className of classList) {
			if (className.startsWith('language-')) {
				const langIdentifier = className.substring(9).toLowerCase(); // Remove 'language-' prefix and normalize
				
				// Try to get custom mappings
				let customMappings: Record<string, string> = {};
				try {
					customMappings = JSON.parse(this.settings.customLanguageMappings);
				} catch (e) {
					// If parsing fails, just use an empty object
					console.error('Error parsing custom language mappings:', e);
				}
				
				// Check if we have a custom mapping for this language
				if (customMappings[langIdentifier]) {
					language = customMappings[langIdentifier];
				}
				// Check if we have a built-in mapping for this language
				else if (this.LANGUAGE_EXTENSIONS[langIdentifier]) {
					language = this.LANGUAGE_EXTENSIONS[langIdentifier];
				} else {
					// If no mapping exists, use the language identifier as-is
					language = langIdentifier;
				}
				break;
			}
		}
		
		return language;
	}

	/**
	 * Create an export button for a code block
	 */
	createExportButton(codeBlock: Element, language: string): HTMLElement {
		const exportButton = document.createElement('button');
		exportButton.setAttribute('aria-label', 'Export to file');
		exportButton.classList.add('code-block-export-button');
		
		// Create icon container
		const iconContainer = document.createElement('div');
		iconContainer.classList.add('code-block-export-icon');
		
		// Add SVG to the container
		iconContainer.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 18H20V20H4V18Z" fill="currentColor"/>
            <path d="M12 4L12 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M8 10L12 15L16 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
		
		// Append icon to button
		exportButton.appendChild(iconContainer);
		
		exportButton.addEventListener('click', async (e) => {
			e.preventDefault();
			e.stopPropagation();
			
			// Get the code content
			const codeContent = codeBlock.textContent || '';
			
			// Create a default filename based on the first line or content
			const filename = this.createSuggestedFilename(codeContent, language);
			
			// Directly export the file without a modal
			await this.exportCodeToFile(codeContent, filename);
		});
		
		return exportButton;
	}

	/**
	 * Create a suggested filename based on the code content and language
	 */
	createSuggestedFilename(codeContent: string, language: string): string {
		// Try to extract a name from the first line (e.g., from a function or class definition)
		const firstLine = codeContent.trim().split('\n')[0].trim();
		let name = '';
		
		// Extract function or class name if available
		if (firstLine.startsWith('function') || firstLine.includes('function ')) {
			// Extract function name from e.g., "function myFunction()" or "export function myFunction()"
			const match = firstLine.match(/function\s+([a-zA-Z0-9_]+)/);
			if (match && match[1]) {
				name = match[1];
			}
		} else if (firstLine.startsWith('class') || firstLine.includes('class ')) {
			// Extract class name from e.g., "class MyClass {}" or "export class MyClass {}"
			const match = firstLine.match(/class\s+([a-zA-Z0-9_]+)/);
			if (match && match[1]) {
				name = match[1];
			}
		}
		
		// If we couldn't extract a name, use a default
		if (!name) {
			// Use a default name
			name = 'code-block';
		}
		
		// Convert to kebab-case for better compatibility (as per user preferences)
		name = this.toKebabCase(name);
		
		// Append the appropriate extension
		return `${name}.${language}`;
	}

	/**
	 * Convert a string to kebab-case
	 */
	toKebabCase(str: string): string {
		return str
			.replace(/([a-z])([A-Z])/g, '$1-$2')  // Convert camelCase to kebab
			.replace(/[\s_]+/g, '-')              // Convert spaces and underscores to hyphens
			.toLowerCase();                        // Convert to lowercase
	}

	/**
	 * Export the code content to a file using browser download functionality
	 */
	async exportCodeToFile(codeContent: string, filename: string): Promise<void> {
		try {
			// Create a Blob object to prepare for download
			const blob = new Blob([codeContent], { type: 'text/plain' });
			
			// Create a temporary download link
			const downloadLink = document.createElement('a');
			downloadLink.href = URL.createObjectURL(blob);
			downloadLink.download = filename;
			
			// Append to the document, click it, and remove it
			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);
			
			// Clean up the URL object
			setTimeout(() => {
				URL.revokeObjectURL(downloadLink.href);
			}, 100);
			
			// Notify the user
			new Notice(`Code exported as ${filename}`);
		} catch (error) {
			console.error('Failed to export code to file:', error);
			new Notice('Failed to export code to file: ' + (error as Error).message);
		}
	}

	onunload() {
		// Cleanup
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

/**
 * Settings tab for the plugin
 */
class CodeBlockFileExportSettingTab extends PluginSettingTab {
	plugin: CodeBlockFileExportPlugin;
	
	constructor(app: App, plugin: CodeBlockFileExportPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}
	
	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		
		containerEl.createEl('h2', { text: 'Code Block File Export Settings' });
		
		new Setting(containerEl)
			.setName('Default File Extension')
			.setDesc('Default file extension to use when language cannot be detected')
			.addText((text) =>
				text
					.setPlaceholder('txt')
					.setValue(this.plugin.settings.defaultFileExtension)
					.onChange(async (value) => {
						this.plugin.settings.defaultFileExtension = value;
						await this.plugin.saveSettings();
					})
			);
		
		new Setting(containerEl)
			.setName('Custom Language Mappings')
			.setDesc('Add custom mappings from language names to file extensions (JSON format)')
			.addTextArea((text) => {
				text
					.setPlaceholder('{"language": "extension", "custom": "ext"}')
					.setValue(this.plugin.settings.customLanguageMappings)
					.onChange(async (value) => {
						try {
							// Try to parse as JSON to validate
							JSON.parse(value);
							this.plugin.settings.customLanguageMappings = value;
							await this.plugin.saveSettings();
							text.inputEl.removeClass('is-invalid');
						} catch (e) {
							// If not valid JSON, add error class but don't save
							text.inputEl.addClass('is-invalid');
						}
					});
				
				text.inputEl.addClass('code-block-export-json-input');
				text.inputEl.rows = 6;
			});
		
		// Use CSS class instead of inline style
		containerEl.createEl('div', { 
			cls: 'setting-item-description code-block-export-info', 
			text: 'Code blocks will be exported using your browser\'s download functionality. Files will be saved to your default downloads location.' 
		});
	}
}
