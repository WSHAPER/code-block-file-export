import CodeBlockFileExportPlugin from '../main';
import { App, PluginManifest } from 'obsidian';

describe('CodeBlockFileExportPlugin Filename Generation', () => {
  let plugin: CodeBlockFileExportPlugin;

  beforeEach(() => {
    // Create a mock App object with the minimum required properties
    const mockApp = {
      vault: {},
      workspace: {},
      metadataCache: {}
    } as unknown as App;
    
    // Create a valid plugin manifest
    const manifest: PluginManifest = {
      id: 'test-plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      minAppVersion: '0.15.0',
      description: 'Test plugin description',
      author: 'Test Author',
      authorUrl: 'https://test.com',
      isDesktopOnly: false
    };
    
    // Create plugin instance with mocked dependencies
    plugin = new CodeBlockFileExportPlugin(mockApp, manifest);
    
    // Add the loadData and saveData methods that our tests need
    (plugin as any).loadData = async () => ({});
    (plugin as any).saveData = async () => {};
  });

  test('createSuggestedFilename extracts function name correctly', () => {
    const codeContent = `function calculateTotal(items) {
      return items.reduce((sum, item) => sum + item.price, 0);
    }`;
    const language = 'js';
    
    const result = plugin.createSuggestedFilename(codeContent, language);
    
    expect(result).toBe('calculate-total.js');
  });

  test('createSuggestedFilename extracts class name correctly', () => {
    const codeContent = `class UserProfile {
      constructor(name, email) {
        this.name = name;
        this.email = email;
      }
    }`;
    const language = 'js';
    
    const result = plugin.createSuggestedFilename(codeContent, language);
    
    expect(result).toBe('user-profile.js');
  });

  test('createSuggestedFilename handles export statements', () => {
    const codeContent = `export function formatDate(date) {
      return date.toLocaleDateString();
    }`;
    const language = 'ts';
    
    const result = plugin.createSuggestedFilename(codeContent, language);
    
    expect(result).toBe('format-date.ts');
  });

  test('createSuggestedFilename uses default name when no function or class is found', () => {
    const codeContent = `const x = 1;
    const y = 2;
    console.log(x + y);`;
    const language = 'js';
    
    const result = plugin.createSuggestedFilename(codeContent, language);
    
    expect(result).toBe('code-block.js');
  });

  test('toKebabCase correctly converts camelCase', () => {
    expect(plugin.toKebabCase('myVariableName')).toBe('my-variable-name');
  });

  test('toKebabCase correctly converts PascalCase', () => {
    expect(plugin.toKebabCase('UserProfile')).toBe('user-profile');
  });

  test('toKebabCase correctly converts snake_case', () => {
    expect(plugin.toKebabCase('user_profile_data')).toBe('user-profile-data');
  });

  test('toKebabCase correctly converts space-separated words', () => {
    expect(plugin.toKebabCase('User Profile Data')).toBe('user-profile-data');
  });
});
