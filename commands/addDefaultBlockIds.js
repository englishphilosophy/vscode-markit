import { TextEdit, window, workspace, WorkspaceEdit } from "vscode";
import parseDocument from "./parseDocument.js";

// Add default block IDs to all blocks that lack them
export default async () => {
  const editor = window.activeTextEditor;
  if (!editor) return;

  const edits = getEditsForAddingIds(editor.document);
  if (edits.length > 0) {
    const workspaceEdit = new WorkspaceEdit();
    workspaceEdit.set(editor.document.uri, edits);
    const success = await workspace.applyEdit(workspaceEdit);
    if (success) {
      window.showInformationMessage(`Added IDs to ${edits.length} block(s)`);
    } else {
      window.showErrorMessage("Failed to add block IDs");
    }
  } else {
    window.showInformationMessage("All blocks already have IDs");
  }
};

const getEditsForAddingIds = (document) => {
  const text = document.getText();
  const { yamlContent, blockContent, blocks } = parseDocument(text);
  const edits = [];
  let currentIndex = yamlContent.length;
  let nextNumericId = 0;
  let isFootnoteMode = false;

  blocks.forEach((block, index) => {
    const blockInfo = parseBlockId(block);

    if (blockInfo.hasId) {
      // don't edit existing IDs, but use them to determine subsequent IDs
      if (blockInfo.isFootnote) {
        isFootnoteMode = true;
      }
      if (blockInfo.numericId !== null) {
        nextNumericId = blockInfo.numericId + 1;
      } else if (index === 0) {
        // Title block found, next ID should be 1
        nextNumericId = 1;
      }
    } else {
      // otherwise add IDs and increment nextNumericId
      const idToInsert =
        index === 0
          ? "{title}\n"
          : `{#${isFootnoteMode ? "n" : ""}${nextNumericId}} `;
      const edit = TextEdit.insert(
        document.positionAt(currentIndex),
        idToInsert,
      );
      edits.push(edit);
      nextNumericId++;
    }

    // move currentIndex to start of next block
    const nextSeparatorMatch = blockContent
      .substring(currentIndex - yamlContent.length + block.length)
      .match(/^(\n\n+)/);
    const separatorLength = nextSeparatorMatch
      ? nextSeparatorMatch[0].length
      : 0;
    currentIndex += block.length + separatorLength;
  });

  return edits;
};

const parseBlockId = (block) => {
  const titleIdRegex = /^\{title\}\n/;
  const numericIdRegex = /^\{#(n?)(\d+)\}\s/;

  if (titleIdRegex.test(block)) {
    return { hasId: true, isFootnote: false, numericId: null };
  }

  const numericIdMatch = block.match(numericIdRegex);
  if (numericIdMatch) {
    return {
      hasId: true,
      isFootnote: numericIdMatch[1] === "n",
      numericId: parseInt(numericIdMatch[2], 10),
    };
  }

  return { hasId: false, isFootnote: false, numericId: null };
};
