import * as vscode from "vscode";

export const insertNextParagraphId = () => insertNextBlockId(false);

export const insertNextFootnoteId = () => insertNextBlockId(true);

const insertNextBlockId = (isFootnote) => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const document = editor.document;
  const text = document.getText();

  // Find all paragraph IDs in the format {#123}
  const paragraphIdRegex = isFootnote ? /\{#n(\d+)\}/g : /\{#(\d+)\}/g;
  const matches = [...text.matchAll(paragraphIdRegex)];

  // Find the highest ID number
  let maxId = 0;
  for (const match of matches) {
    const id = parseInt(match[1], 10);
    if (id > maxId) {
      maxId = id;
    }
  }

  const nextId = maxId + 1;

  // Insert the paragraph ID snippet with the calculated next ID
  const snippetString = isFootnote
    ? `{#n\${1:${nextId}}} `
    : `{#\${1:${nextId}}} `;
  const snippet = new vscode.SnippetString(snippetString);
  editor.insertSnippet(snippet);
};
