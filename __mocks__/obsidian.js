// __mocks__/obsidian.js
// Mock the Obsidian API

const obsidian = {
  // Plugin base class
  Plugin: class Plugin {
    constructor() {
      this.app = {
        vault: {
          adapter: {
            basePath: '/mock/path'
          }
        }
      };
    }
    registerMarkdownPostProcessor() {}
    addSettingTab() {}
    loadData() { return Promise.resolve({}); }
    saveData() { return Promise.resolve(); }
  },

  // Setting tab class
  PluginSettingTab: class PluginSettingTab {
    constructor(app, plugin) {
      this.app = app;
      this.plugin = plugin;
      this.containerEl = {
        empty: jest.fn(),
        createEl: jest.fn(() => ({
          style: {}
        }))
      };
    }
    display() {}
  },

  // Setting component
  Setting: class Setting {
    constructor(containerEl) {
      this.containerEl = containerEl;
    }
    setName() { return this; }
    setDesc() { return this; }
    addText() { return this; }
    addTextArea() { return this; }
  },

  // Notice component
  Notice: class Notice {
    constructor(message) {
      this.message = message;
    }
  },

  // FileSystemAdapter
  FileSystemAdapter: class FileSystemAdapter {
    constructor() {}
  }
};

module.exports = obsidian;
