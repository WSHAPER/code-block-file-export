import CodeBlockFileExportPlugin from '../main';
import { Plugin } from 'obsidian';

describe('CodeBlockFileExportPlugin Language Mapping', () => {
  let plugin: CodeBlockFileExportPlugin;

  beforeEach(() => {
    plugin = new CodeBlockFileExportPlugin(null as any, null as any);
    
    // Set default settings
    plugin.settings = {
      defaultFileExtension: 'txt',
      customLanguageMappings: '{}'
    };
  });

  test('getLanguageFromCodeBlock returns default extension when no language is specified', () => {
    // Create a mock code block with no language class
    const codeBlock = document.createElement('code');
    
    // Test the method
    const result = plugin.getLanguageFromCodeBlock(codeBlock);
    
    // Should return the default file extension
    expect(result).toBe('txt');
  });

  test('getLanguageFromCodeBlock correctly identifies JavaScript', () => {
    // Create a mock code block with JavaScript language class
    const codeBlock = document.createElement('code');
    codeBlock.classList.add('language-javascript');
    
    // Test the method
    const result = plugin.getLanguageFromCodeBlock(codeBlock);
    
    // Should return the correct extension
    expect(result).toBe('js');
  });

  test('getLanguageFromCodeBlock correctly identifies Python', () => {
    // Create a mock code block with Python language class
    const codeBlock = document.createElement('code');
    codeBlock.classList.add('language-python');
    
    // Test the method
    const result = plugin.getLanguageFromCodeBlock(codeBlock);
    
    // Should return the correct extension
    expect(result).toBe('py');
  });

  test('getLanguageFromCodeBlock uses custom mappings when available', () => {
    // Create a mock code block
    const codeBlock = document.createElement('code');
    codeBlock.classList.add('language-custom');
    
    // Set custom mappings
    plugin.settings.customLanguageMappings = '{"custom": "xyz"}';
    
    // Test the method
    const result = plugin.getLanguageFromCodeBlock(codeBlock);
    
    // Should return the custom extension
    expect(result).toBe('xyz');
  });

  test('getLanguageFromCodeBlock falls back to language name when no mapping exists', () => {
    // Create a mock code block with an unknown language
    const codeBlock = document.createElement('code');
    codeBlock.classList.add('language-unknown');
    
    // Test the method
    const result = plugin.getLanguageFromCodeBlock(codeBlock);
    
    // Should return the language name itself
    expect(result).toBe('unknown');
  });
});
