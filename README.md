# Code Block File Export for Obsidian

This plugin adds an "Export to File" button to code blocks in Obsidian notes, allowing you to quickly save code snippets to files without having to manually copy and paste.

## Features

- Adds an export button to every code block in preview mode
- Suggests filenames based on function or class names in the code
- Uses the language of the code block for the file extension
- Smart language-to-extension mapping (e.g., "javascript" becomes ".js")
- Custom language mappings through JSON configuration
- Works on both desktop and mobile devices using browser download functionality

## How to Use

1. Hover over any code block in preview mode
2. Click the export button that appears next to the built-in copy button
3. The code will be exported to a file using your browser's download functionality

## Settings

- **Default File Extension**: The file extension to use when the language of a code block cannot be detected
- **Custom Language Mappings**: JSON configuration to define custom mappings from language names to file extensions

## Installation

### From Obsidian Community Plugins

1. Open Settings in Obsidian
2. Go to Community Plugins and turn off Safe Mode
3. Click Browse and search for "Code Block File Export"
4. Install the plugin and enable it

### Manual Installation

1. Download the latest release from the GitHub repository
2. Extract the files into your vault's `.obsidian/plugins/code-block-file-export` directory
3. Restart Obsidian
4. Enable the plugin in the Community Plugins settings

## Development

This plugin uses TypeScript to provide type checking and documentation.

### First-time setup

1. Clone this repository to your development environment
2. `npm install` to install dependencies
3. `npm run dev` to start compilation in watch mode

### Building

- `npm run build` to compile the plugin
- `npm run version` to bump the version number

### Testing

This plugin includes a comprehensive test suite using Jest:

- `npm test` to run the tests
- `npm run test:watch` to run tests in watch mode
- `npm run test:coverage` to generate a coverage report

Tests are automatically run on each push and pull request via GitHub Actions, ensuring code quality and preventing regressions.

### Release Process

This plugin uses GitHub Actions to automate the release process:

1. Create a new release notes file in the `releases` directory named `[version].md` (e.g., `1.0.1.md`)
   - Use the template in `releases/TEMPLATE.md` as a starting point
   - Document all changes, bug fixes, and new features in this file

2. Trigger the release workflow:
   - Go to Actions → Release Plugin → Run workflow
   - Enter the version number (matching your release notes file)
   - Add any additional notes if needed
   - Select "Force update" if you need to overwrite an existing release
   - Click "Run workflow"

3. The workflow will:
   - Update version numbers in manifest.json and versions.json
   - Build the plugin
   - Create a GitHub release with the content from your release notes file
   - Upload all necessary files as release assets
   - Commit the version changes back to the repository

All past and upcoming releases are documented in the `releases` directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
