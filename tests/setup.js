import { vi } from "vitest";

// Mock the vscode module
vi.mock("vscode", () => {
  // Position class mock
  class Position {
    constructor(line, character) {
      this.line = line;
      this.character = character;
    }
  }

  // Range class mock
  class Range {
    constructor(startLine, startCharacter, endLine, endCharacter) {
      if (startLine instanceof Position) {
        this.start = startLine;
        this.end = startCharacter;
      } else {
        this.start = new Position(startLine, startCharacter);
        this.end = new Position(endLine, endCharacter);
      }
    }
  }

  // TextEdit class mock
  class TextEdit {
    constructor(range, newText) {
      this.range = range;
      this.newText = newText;
    }

    static insert(position, text) {
      return new TextEdit(new Range(position, position), text);
    }

    static replace(range, text) {
      return new TextEdit(range, text);
    }

    static delete(range) {
      return new TextEdit(range, "");
    }
  }

  // WorkspaceEdit class mock
  class WorkspaceEdit {
    constructor() {
      this._edits = new Map();
    }

    set(uri, edits) {
      this._edits.set(uri, edits);
    }

    replace(uri, range, newText) {
      if (!this._edits.has(uri)) {
        this._edits.set(uri, []);
      }
      this._edits.get(uri).push(TextEdit.replace(range, newText));
    }

    insert(uri, position, newText) {
      if (!this._edits.has(uri)) {
        this._edits.set(uri, []);
      }
      this._edits.get(uri).push(TextEdit.insert(position, newText));
    }

    delete(uri, range) {
      if (!this._edits.has(uri)) {
        this._edits.set(uri, []);
      }
      this._edits.get(uri).push(TextEdit.delete(range));
    }

    get(uri) {
      return this._edits.get(uri) || [];
    }
  }

  // SnippetString class mock
  class SnippetString {
    constructor(value) {
      this.value = value || "";
    }

    appendText(string) {
      this.value += string;
      return this;
    }

    appendPlaceholder(value) {
      this.value += `\${${value}}`;
      return this;
    }
  }

  const vscode = {
    Position,
    Range,
    TextEdit,
    WorkspaceEdit,
    SnippetString,

    window: {
      activeTextEditor: null,
      showInformationMessage: vi.fn(),
      showErrorMessage: vi.fn(),
      createTextEditorDecorationType: vi.fn(),
    },

    workspace: {
      applyEdit: vi.fn().mockResolvedValue(true),
      getConfiguration: vi.fn(() => ({
        get: vi.fn(),
        has: vi.fn(),
        update: vi.fn(),
      })),
    },

    env: {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
        readText: vi.fn().mockResolvedValue(""),
      },
    },

    commands: {
      registerCommand: vi.fn(),
      executeCommand: vi.fn(),
    },

    languages: {
      registerDocumentFormattingEditProvider: vi.fn(),
      registerDocumentRangeFormattingEditProvider: vi.fn(),
    },
  };

  return { ...vscode, default: vscode };
});
