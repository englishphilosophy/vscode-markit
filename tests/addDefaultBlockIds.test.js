import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setActiveEditor, resetMocks } from "./helpers.js";
import vscode from "vscode";
import addDefaultBlockIds from "../commands/addDefaultBlockIds.js";

describe("addDefaultBlockIds", () => {
  afterEach(() => {
    resetMocks();
  });

  it("should add IDs to all blocks when none exist", async () => {
    setActiveEditor("addDefaultBlockIds/missing-ids.mit");

    await addDefaultBlockIds();

    expect(vscode.workspace.applyEdit).toHaveBeenCalled();
    const workspaceEdit = vscode.workspace.applyEdit.mock.calls[0][0];
    const edits = workspaceEdit.get(
      vscode.window.activeTextEditor.document.uri,
    );

    // Should add IDs to 3 paragraphs + 1 footnote = 4 edits
    expect(edits).toHaveLength(4);
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      "Added IDs to 4 block(s)",
    );
  });

  it("should not add IDs when all blocks already have them", async () => {
    setActiveEditor("addDefaultBlockIds/existing-ids.mit");

    await addDefaultBlockIds();

    expect(vscode.workspace.applyEdit).not.toHaveBeenCalled();
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      "All blocks already have IDs",
    );
  });

  it("should add IDs only to blocks that need them", async () => {
    setActiveEditor("addDefaultBlockIds/partial-ids.mit");

    await addDefaultBlockIds();

    expect(vscode.workspace.applyEdit).toHaveBeenCalled();
    const workspaceEdit = vscode.workspace.applyEdit.mock.calls[0][0];
    const edits = workspaceEdit.get(
      vscode.window.activeTextEditor.document.uri,
    );

    // Should add IDs to 1 paragraph + 1 footnote = 2 edits
    expect(edits).toHaveLength(2);
  });

  it("should insert sequential numeric IDs for paragraphs", async () => {
    setActiveEditor("addDefaultBlockIds/missing-ids.mit");

    await addDefaultBlockIds();

    const workspaceEdit = vscode.workspace.applyEdit.mock.calls[0][0];
    const edits = workspaceEdit.get(
      vscode.window.activeTextEditor.document.uri,
    );

    // First 3 edits should be paragraphs with sequential IDs
    expect(edits[0].newText).toBe("{#1} ");
    expect(edits[1].newText).toBe("{#2} ");
    expect(edits[2].newText).toBe("{#3} ");
  });

  it("should use footnote notation (n) for footnotes after a footnote block appears", async () => {
    setActiveEditor("addDefaultBlockIds/with-first-footnote.mit");

    await addDefaultBlockIds();

    const workspaceEdit = vscode.workspace.applyEdit.mock.calls[0][0];
    const edits = workspaceEdit.get(
      vscode.window.activeTextEditor.document.uri,
    );

    // After encountering a footnote block, subsequent IDs should use 'n' prefix
    expect(edits).toHaveLength(1);
    expect(edits[0].newText).toBe("{#n2} ");
  });

  it("should continue numbering from existing IDs", async () => {
    setActiveEditor("addDefaultBlockIds/partial-ids.mit");

    await addDefaultBlockIds();

    const workspaceEdit = vscode.workspace.applyEdit.mock.calls[0][0];
    const edits = workspaceEdit.get(
      vscode.window.activeTextEditor.document.uri,
    );

    // Should have 2 edits: {#2} for missing paragraph and {#n2} for missing footnote
    expect(edits).toHaveLength(2);
    expect(edits[0].newText).toBe("{#2} ");
    expect(edits[1].newText).toBe("{#n2} ");
  });

  it("should show error message if edit fails", async () => {
    setActiveEditor("addDefaultBlockIds/missing-ids.mit");
    vscode.workspace.applyEdit.mockResolvedValue(false);

    await addDefaultBlockIds();

    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      "Failed to add block IDs",
    );
  });

  it("should do nothing if no active editor", async () => {
    vscode.window.activeTextEditor = null;

    await addDefaultBlockIds();

    expect(vscode.workspace.applyEdit).not.toHaveBeenCalled();
  });
});
