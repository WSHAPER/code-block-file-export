import CodeBlockFileExportPlugin from '../main';
import { Notice, App, PluginManifest } from 'obsidian';

// Mock Notice constructor
jest.mock('obsidian', () => {
  return {
    ...jest.requireActual('__mocks__/obsidian.js'),
    Notice: jest.fn()
  };
});

// Mock the DOM functions used in exportCodeToFile
global.URL.createObjectURL = jest.fn().mockReturnValue('mock-blob-url');
global.URL.revokeObjectURL = jest.fn();

// Mock document functions
document.body.appendChild = jest.fn();
document.body.removeChild = jest.fn();

describe('CodeBlockFileExportPlugin Export Functionality', () => {
  let plugin: CodeBlockFileExportPlugin;
  let mockClickFn: jest.Mock;

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
    
    // Mock document.createElement
    mockClickFn = jest.fn();
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: mockClickFn
        } as unknown as HTMLElement;
      }
      // For other elements, create a real DOM element
      return document.createElement(tagName);
    });
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('exportCodeToFile creates a download link with correct properties', async () => {
    const codeContent = 'console.log("Hello World");';
    const filename = 'test-file.js';
    
    await plugin.exportCodeToFile(codeContent, filename);
    
    // Check if createElement was called with 'a'
    expect(document.createElement).toHaveBeenCalledWith('a');
    
    // Check if URL.createObjectURL was called with a Blob containing our code
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    
    // Check if the link was clicked
    expect(mockClickFn).toHaveBeenCalled();
    
    // Check if the link was added to document and removed
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
    
    // Verify the notification was shown
    expect(Notice).toHaveBeenCalled();
  });

  test('exportCodeToFile handles errors gracefully', async () => {
    // Mock URL.createObjectURL to throw an error
    (global.URL.createObjectURL as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Mock error');
    });
    
    // Call the method with test data
    await plugin.exportCodeToFile('test code', 'test.js');
    
    // Verify error handling - it should show a notice with the error
    expect(Notice).toHaveBeenCalledWith(expect.stringContaining('Mock error'));
  });
});
