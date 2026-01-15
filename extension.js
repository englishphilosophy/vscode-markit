import * as vscode from "vscode";

export function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("markit.addDefaultBlockIds", () =>
      addDefaultBlockIds()
    ),
    vscode.commands.registerCommand("markit.insertNextParagraphId", () =>
      insertNextBlockId(false)
    ),
    vscode.commands.registerCommand("markit.insertNextNoteId", () =>
      insertNextBlockId(true)
    )
  );
}

export function deactivate() {}

const addDefaultBlockIds = () => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const document = editor.document;
  const text = document.getText();

  // Find the end of YAML frontmatter (second occurrence of ---)
  const yamlMatch = text.match(/^---\n[\s\S]*?\n---\n/);
  if (!yamlMatch) {
    vscode.window.showErrorMessage("Could not find YAML frontmatter");
    return;
  }

  const yamlEndIndex = yamlMatch[0].length;
  const contentAfterYaml = text.substring(yamlEndIndex);

  // Split by double line breaks to get blocks
  const blocks = contentAfterYaml.split(/\n\n+/);

  // Build the new content
  const edits = [];
  let currentIndex = yamlEndIndex;
  let nextNumericId = 1; // Track the next numeric ID to use
  let isFootnoteMode = false; // Track whether we're generating footnote IDs

  blocks.forEach((block, index) => {
    // Skip empty blocks
    if (!block.trim()) {
      currentIndex += block.length + 2; // +2 for the \n\n separator
      return;
    }

    // Check if block already has an ID
    const hasId = /^\{(title|#n?[a-z0-9.]+)(,[^=,}]+=[^,}]+)*\}/.test(
      block.trim()
    );

    if (hasId) {
      // Check if the existing ID is a numeric paragraph or note ID
      const numericIdMatch = block.trim().match(/^\{#(n?)(\d+)(\}|,)/);
      if (numericIdMatch) {
        const isFootnote = numericIdMatch[1] === 'n';
        const existingId = parseInt(numericIdMatch[2], 10);
        
        // If we encounter a footnote ID, switch to footnote mode
        if (isFootnote) {
          isFootnoteMode = true;
        }
        
        // Update nextNumericId to continue from this number
        nextNumericId = existingId + 1;
      }
    } else {
      // Add ID to this block
      const blockId = index === 0 ? "{title}" : `{#${isFootnoteMode ? 'n' : ''}${nextNumericId}}`;
      const blockStart = currentIndex;

      // Create edit to add ID at the start of the block
      edits.push(
        vscode.TextEdit.insert(
          document.positionAt(blockStart),
          blockId + (index === 0 ? "\n" : " ")
        )
      );
      
      // Increment for next block
      if (index !== 0) {
        nextNumericId++;
      }
    }

    // Move to next block (account for block length + separator)
    const nextSeparatorMatch = contentAfterYaml
      .substring(currentIndex - yamlEndIndex + block.length)
      .match(/^(\n\n+)/);
    const separatorLength = nextSeparatorMatch
      ? nextSeparatorMatch[0].length
      : 0;
    currentIndex += block.length + separatorLength;
  });

  // Apply all edits
  if (edits.length > 0) {
    const workspaceEdit = new vscode.WorkspaceEdit();
    workspaceEdit.set(document.uri, edits);
    vscode.workspace.applyEdit(workspaceEdit).then((success) => {
      if (success) {
        vscode.window.showInformationMessage(
          `Added IDs to ${edits.length} block(s)`
        );
      } else {
        vscode.window.showErrorMessage("Failed to add block IDs");
      }
    });
  } else {
    vscode.window.showInformationMessage("All blocks already have IDs");
  }
};

const insertNextBlockId = (isNote) => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const document = editor.document;
  const text = document.getText();

  // Find all paragraph IDs in the format {#123}
  const paragraphIdRegex = isNote ? /\{#n(\d+)\}/g : /\{#(\d+)\}/g;
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
  const snippetString = isNote ? `{#n\${1:${nextId}}} ` : `{#\${1:${nextId}}} `;
  const snippet = new vscode.SnippetString(snippetString);
  editor.insertSnippet(snippet);
};
