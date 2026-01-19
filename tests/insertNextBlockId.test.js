import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setActiveEditor, resetMocks } from "./helpers.js";
import vscode from "vscode";
import insertNextBlockId from "../commands/insertNextBlockId.js";

describe("insertNextBlockId", () => {
  afterEach(() => {
    resetMocks();
  });

  describe("paragraph IDs", () => {
    it("should insert {#1} when no IDs exist and title is present", () => {
      setActiveEditor("insertNextBlockId/title-with-text.mit");
      insertNextBlockId("paragraph");

      expect(vscode.window.activeTextEditor.insertSnippet).toHaveBeenCalled();
      const snippet =
        vscode.window.activeTextEditor.insertSnippet.mock.calls[0][0];
      expect(snippet.value).toContain("{#");
      expect(snippet.value).toContain("1");
    });

    it("should insert {title} when no IDs exist and no title present", () => {
      setActiveEditor("insertNextBlockId/no-title.mit");
      insertNextBlockId("paragraph");

      const snippet =
        vscode.window.activeTextEditor.insertSnippet.mock.calls[0][0];
      expect(snippet.value).toBe("{title}\n");
    });

    it("should insert next sequential ID based on existing IDs", () => {
      setActiveEditor("insertNextBlockId/two-paragraphs.mit");
      insertNextBlockId("paragraph");

      const snippet =
        vscode.window.activeTextEditor.insertSnippet.mock.calls[0][0];
      expect(snippet.value).toContain("3");
    });

    it("should find highest ID even if non-sequential", () => {
      setActiveEditor("insertNextBlockId/non-sequential.mit");
      insertNextBlockId("paragraph");

      const snippet =
        vscode.window.activeTextEditor.insertSnippet.mock.calls[0][0];
      expect(snippet.value).toContain("6"); // Max is 5, so next is 6
    });
  });

  describe("footnote IDs", () => {
    it("should insert {#n1} when no footnote IDs exist", () => {
      setActiveEditor("basic.mit");
      insertNextBlockId("footnote");

      const snippet =
        vscode.window.activeTextEditor.insertSnippet.mock.calls[0][0];
      expect(snippet.value).toContain("{#n");
      expect(snippet.value).toContain("1");
    });

    it("should insert next sequential footnote ID", () => {
      setActiveEditor("insertNextBlockId/paragraph-with-footnote.mit");
      insertNextBlockId("footnote");

      const snippet =
        vscode.window.activeTextEditor.insertSnippet.mock.calls[0][0];
      expect(snippet.value).toContain("3");
    });

    it("should not confuse paragraph IDs with footnote IDs", () => {
      setActiveEditor("insertNextBlockId/mixed-paragraph-footnote.mit");
      insertNextBlockId("footnote");

      const snippet =
        vscode.window.activeTextEditor.insertSnippet.mock.calls[0][0];
      // Should be {#n2}, not affected by paragraph ID 5
      expect(snippet.value).toContain("{#n");
      expect(snippet.value).toContain("2");
    });
  });

  describe("snippet placeholders", () => {
    it("should create editable snippet placeholder for paragraph ID", () => {
      setActiveEditor("basic.mit");
      insertNextBlockId("paragraph");

      const snippet =
        vscode.window.activeTextEditor.insertSnippet.mock.calls[0][0];
      // Should have placeholder syntax ${1:...}
      expect(snippet.value).toMatch(/\$\{1:\d+\}/);
    });

    it("should create editable snippet placeholder for footnote ID", () => {
      setActiveEditor("basic.mit");
      insertNextBlockId("footnote");

      const snippet =
        vscode.window.activeTextEditor.insertSnippet.mock.calls[0][0];
      // Should have placeholder syntax ${1:...}
      expect(snippet.value).toMatch(/\$\{1:\d+\}/);
    });

    it("should not have placeholder for title", () => {
      setActiveEditor("insertNextBlockId/no-title.mit");
      insertNextBlockId("paragraph");

      const snippet =
        vscode.window.activeTextEditor.insertSnippet.mock.calls[0][0];
      expect(snippet.value).toBe("{title}\n");
      expect(snippet.value).not.toContain("$");
    });
  });

  it("should do nothing if no active editor", () => {
    vscode.window.activeTextEditor = null;

    insertNextBlockId("paragraph");

    // Should not throw, just return early
    expect(vscode.window.activeTextEditor).toBeNull();
  });
});
