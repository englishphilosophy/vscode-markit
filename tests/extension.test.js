import { describe, it, expect, beforeEach, vi } from "vitest";
import vscode from "vscode";
import { activate, deactivate } from "../extension.js";
import formatDocument from "../commands/formatDocument.js";
import addDefaultBlockIds from "../commands/addDefaultBlockIds.js";
import getRegexForBlockStarts from "../commands/getRegexForBlockStarts.js";
import insertNextBlockId from "../commands/insertNextBlockId.js";

// Mock the command modules
vi.mock("../commands/formatDocument.js", () => ({
  default: vi.fn(),
}));

vi.mock("../commands/addDefaultBlockIds.js", () => ({
  default: vi.fn(),
}));

vi.mock("../commands/getRegexForBlockStarts.js", () => ({
  default: vi.fn(),
}));

vi.mock("../commands/insertNextBlockId.js", () => ({
  default: vi.fn(),
}));

describe("extension", () => {
  let context;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Create a mock extension context
    context = {
      subscriptions: [],
      extensionPath: "/test/extension",
      globalState: {
        get: vi.fn(),
        update: vi.fn(),
      },
      workspaceState: {
        get: vi.fn(),
        update: vi.fn(),
      },
    };
  });

  describe("activate", () => {
    it("should register all commands", () => {
      activate(context);

      // Verify registerCommand was called for each command
      expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(4);

      // Verify specific commands were registered
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "markit.addDefaultBlockIds",
        addDefaultBlockIds,
      );

      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "markit.insertNextParagraphId",
        expect.any(Function),
      );

      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "markit.insertNextNoteId",
        expect.any(Function),
      );

      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "markit.getRegexForBlockStarts",
        getRegexForBlockStarts,
      );
    });

    it("should register document formatting provider for markit language", () => {
      activate(context);

      expect(
        vscode.languages.registerDocumentFormattingEditProvider,
      ).toHaveBeenCalledTimes(1);

      expect(
        vscode.languages.registerDocumentFormattingEditProvider,
      ).toHaveBeenCalledWith("markit", {
        provideDocumentFormattingEdits: expect.any(Function),
      });
    });

    it("should add all registrations to context.subscriptions", () => {
      activate(context);

      // Should have 5 subscriptions: 4 commands + 1 formatting provider
      expect(context.subscriptions).toHaveLength(5);
    });

    it("should call insertNextBlockId with 'paragraph' for insertNextParagraphId command", () => {
      activate(context);

      // Find the insertNextParagraphId command registration
      const insertParagraphCall = vscode.commands.registerCommand.mock.calls.find(
        (call) => call[0] === "markit.insertNextParagraphId",
      );

      expect(insertParagraphCall).toBeDefined();

      // Execute the registered handler
      const handler = insertParagraphCall[1];
      handler();

      // Verify insertNextBlockId was called with 'paragraph'
      expect(insertNextBlockId).toHaveBeenCalledWith("paragraph");
    });

    it("should call insertNextBlockId with 'footnote' for insertNextNoteId command", () => {
      activate(context);

      // Find the insertNextNoteId command registration
      const insertNoteCall = vscode.commands.registerCommand.mock.calls.find(
        (call) => call[0] === "markit.insertNextNoteId",
      );

      expect(insertNoteCall).toBeDefined();

      // Execute the registered handler
      const handler = insertNoteCall[1];
      handler();

      // Verify insertNextBlockId was called with 'footnote'
      expect(insertNextBlockId).toHaveBeenCalledWith("footnote");
    });

    it("should create formatting provider that calls formatDocument", () => {
      const mockDocument = { getText: vi.fn(() => "test content") };
      const mockEdits = [{ range: {}, newText: "formatted" }];
      formatDocument.mockReturnValue(mockEdits);

      activate(context);

      // Get the formatting provider
      const formattingProviderCall =
        vscode.languages.registerDocumentFormattingEditProvider.mock.calls[0];
      const provider = formattingProviderCall[1];

      // Call provideDocumentFormattingEdits
      const result = provider.provideDocumentFormattingEdits(mockDocument);

      // Verify formatDocument was called with the document
      expect(formatDocument).toHaveBeenCalledWith(mockDocument);
      expect(result).toBe(mockEdits);
    });
  });

  describe("deactivate", () => {
    it("should be a function", () => {
      expect(typeof deactivate).toBe("function");
    });

    it("should not throw when called", () => {
      expect(() => deactivate()).not.toThrow();
    });
  });
});
