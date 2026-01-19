import { env, window } from "vscode";
import parseDocument from "./parseDocument.js";

// Get regex pattern for the union of all block starts (first 25 characters after ID)
export default async () => {
  const editor = window.activeTextEditor;
  if (!editor) return;

  const regexPattern = getRegexForBlockStarts(editor.document.getText());
  if (regexPattern) {
    await env.clipboard.writeText(regexPattern);
    window.showInformationMessage(
      "Regex pattern for block starts copied to clipboard",
    );
  } else {
    window.showInformationMessage("No paragraph or footnote blocks found");
  }
};

const getRegexForBlockStarts = (text) => {
  const { blocks } = parseDocument(text);
  const blockStarts = blocks
    .filter((block) => !block.startsWith("{title}")) // remove title block
    .map((block) => block.replace(/^\{[^}]*\}\s*/, "")) // strip IDs
    .map((block) => block.substring(0, 25).trim()) // take first 25 characters
    .map((start) => start.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")); // escape regex special chars
  return blockStarts.length > 0 ? blockStarts.join("|") : undefined;
};
