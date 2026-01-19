import { window, SnippetString } from "vscode";

// Insert the next block ID (paragraph or footnote) at the current cursor position
export default (type) => {
  const editor = window.activeTextEditor;
  if (!editor) return;

  const text = editor.document.getText();
  const nextId = findNextId(text, type);
  const snippetString = getSnippetString(nextId, type);
  const snippet = new SnippetString(snippetString);
  editor.insertSnippet(snippet);
};

const findNextId = (text, type) => {
  const titleIdPresent = /\{title\}/.test(text);
  const numericIdRegex = type === "footnote" ? /\{#n(\d+)\}/g : /\{#(\d+)\}/g;
  const numericIdMatches = [...text.matchAll(numericIdRegex)];
  const numericIds = numericIdMatches.map((match) => parseInt(match[1], 10));
  return numericIds.length === 0
    ? titleIdPresent
      ? 1
      : 0
    : Math.max(...numericIds) + 1;
};

const getSnippetString = (nextId, type) =>
  nextId === 0
    ? `{title}\n`
    : type === "footnote"
      ? `{#n\${1:${nextId}}} `
      : `{#\${1:${nextId}}} `;
