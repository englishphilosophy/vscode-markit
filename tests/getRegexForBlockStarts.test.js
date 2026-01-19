import { describe, it, expect, afterEach } from "vitest";
import { setActiveEditor, resetMocks } from "./helpers.js";
import vscode from "vscode";
import getRegexForBlockStarts from "../commands/getRegexForBlockStarts.js";

describe("getRegexForBlockStarts", () => {
  afterEach(() => {
    resetMocks();
  });

  it("should generate regex from paragraph block starts", async () => {
    setActiveEditor("getRegexForBlockStarts/three-paragraphs.mit");
    await getRegexForBlockStarts();

    expect(vscode.env.clipboard.writeText).toHaveBeenCalled();
    const regex = vscode.env.clipboard.writeText.mock.calls[0][0];

    // Should contain starts of all paragraphs
    expect(regex).toContain("First paragraph starts");
    expect(regex).toContain("Second paragraph begins");
    expect(regex).toContain("Third one has another");
    // Should use pipe separator
    expect(regex).toContain("|");
  });

  it("should include both paragraphs and footnotes", async () => {
    setActiveEditor("getRegexForBlockStarts/simple-paragraph-footnote.mit");
    await getRegexForBlockStarts();

    const regex = vscode.env.clipboard.writeText.mock.calls[0][0];

    expect(regex).toContain("Paragraph text here");
    expect(regex).toContain("Footnote text here");
  });

  it("should limit to first 25 characters of each block", async () => {
    setActiveEditor("getRegexForBlockStarts/long-paragraph.mit");
    await getRegexForBlockStarts();

    const regex = vscode.env.clipboard.writeText.mock.calls[0][0];

    // Each block start should be limited to 25 chars
    expect(regex).toContain("This is a very long");
    expect(regex).not.toContain("truncated");
    // The trimmed block should be 25 chars or less
    const blocks = regex.split("|");
    expect(blocks.some((b) => b.includes("This is a very long"))).toBe(true);
  });

  it("should escape regex special characters", async () => {
    setActiveEditor("getRegexForBlockStarts/special-chars.mit");
    await getRegexForBlockStarts();

    const regex = vscode.env.clipboard.writeText.mock.calls[0][0];

    // Special chars should be escaped
    expect(regex).toContain("\\(");
    expect(regex).toContain("\\)");
    expect(regex).toContain("\\$");
    expect(regex).toContain("\\*");
  });

  it("should show info message when regex is copied", async () => {
    setActiveEditor("basic.mit");
    await getRegexForBlockStarts();

    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      "Regex pattern for block starts copied to clipboard",
    );
  });

  it("should show message when no blocks found", async () => {
    setActiveEditor("getRegexForBlockStarts/only-title.mit");
    await getRegexForBlockStarts();

    // Title blocks are filtered out, so no regex should be generated
    expect(vscode.env.clipboard.writeText).not.toHaveBeenCalled();
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      "No paragraph or footnote blocks found",
    );
  });

  it("should handle blocks with inline markup", async () => {
    setActiveEditor("getRegexForBlockStarts/inline-markup-text.mit");
    await getRegexForBlockStarts();

    const regex = vscode.env.clipboard.writeText.mock.calls[0][0];

    // Should preserve markup characters
    expect(regex).toContain("_italic_");
    expect(regex).toContain("\\*"); // asterisk escaped
  });

  it("should trim whitespace from block starts", async () => {
    setActiveEditor("getRegexForBlockStarts/whitespace-text.mit");
    await getRegexForBlockStarts();

    const regex = vscode.env.clipboard.writeText.mock.calls[0][0];

    // Should not have leading/trailing spaces
    expect(regex).not.toMatch(/^\s/);
    expect(regex).not.toMatch(/\s$/);
    expect(regex).toContain("Text with leading");
    expect(regex).toContain("Text with trailing");
  });

  it("should do nothing if no active editor", async () => {
    vscode.window.activeTextEditor = null;

    await getRegexForBlockStarts();

    expect(vscode.env.clipboard.writeText).not.toHaveBeenCalled();
  });
});
