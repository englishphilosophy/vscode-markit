import { vi } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import vscode from "vscode";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const loadFixture = (filename) => {
  const fixturePath = join(__dirname, "fixtures", filename);
  return readFileSync(fixturePath, "utf8");
};

export const createMockDocument = (content, languageId = "markit") => {
  const lines = content.split("\n");

  return {
    getText: vi.fn((range) => {
      if (!range) return content;
      // Return text within range
      const startLine = range.start.line;
      const endLine = range.end.line;
      const selectedLines = lines.slice(startLine, endLine + 1);
      if (selectedLines.length === 1) {
        return selectedLines[0].substring(
          range.start.character,
          range.end.character,
        );
      }
      selectedLines[0] = selectedLines[0].substring(range.start.character);
      selectedLines[selectedLines.length - 1] = selectedLines[
        selectedLines.length - 1
      ].substring(0, range.end.character);
      return selectedLines.join("\n");
    }),

    lineAt: vi.fn((lineNumber) => {
      const line = lines[lineNumber] || "";
      return {
        text: line,
        lineNumber,
        range: new vscode.Range(lineNumber, 0, lineNumber, line.length),
        firstNonWhitespaceCharacterIndex: line.search(/\S/),
        isEmptyOrWhitespace: line.trim().length === 0,
      };
    }),

    positionAt: vi.fn((offset) => {
      let currentOffset = 0;
      for (let i = 0; i < lines.length; i++) {
        const lineLength = lines[i].length + 1; // +1 for newline
        if (currentOffset + lineLength > offset) {
          return new vscode.Position(i, offset - currentOffset);
        }
        currentOffset += lineLength;
      }
      return new vscode.Position(
        lines.length - 1,
        lines[lines.length - 1].length,
      );
    }),

    offsetAt: vi.fn((position) => {
      let offset = 0;
      for (let i = 0; i < position.line; i++) {
        offset += lines[i].length + 1; // +1 for newline
      }
      return offset + position.character;
    }),

    uri: {
      fsPath: "/test/file.mit",
      scheme: "file",
      path: "/test/file.mit",
    },

    fileName: "/test/file.mit",
    languageId,
    version: 1,
    isDirty: false,
    isClosed: false,
    lineCount: lines.length,

    save: vi.fn().mockResolvedValue(true),
  };
};

export const createMockEditor = (document, options = {}) => {
  const cursorPosition = options.cursorPosition || new vscode.Position(0, 0);

  return {
    document,

    selection: new vscode.Range(cursorPosition, cursorPosition),

    selections: [new vscode.Range(cursorPosition, cursorPosition)],

    edit: vi.fn((callback) => {
      // Create a mock edit builder
      const editBuilder = {
        replace: vi.fn(),
        insert: vi.fn(),
        delete: vi.fn(),
      };
      callback(editBuilder);
      return Promise.resolve(true);
    }),

    insertSnippet: vi.fn().mockResolvedValue(true),

    setDecorations: vi.fn(),

    revealRange: vi.fn(),

    options: {
      tabSize: 2,
      insertSpaces: true,
    },
  };
};

export const setActiveEditor = (fixtureContent, options = {}) => {
  // Check if it's a fixture filename or raw content
  const content =
    fixtureContent.includes("\n") || !fixtureContent.endsWith(".mit")
      ? fixtureContent
      : loadFixture(fixtureContent);

  const document = createMockDocument(content);
  const editor = createMockEditor(document, options);

  vscode.window.activeTextEditor = editor;

  return editor;
};

export const resetMocks = () => {
  vscode.window.activeTextEditor = null;
  vi.clearAllMocks();
};
