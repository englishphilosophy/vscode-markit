import * as vscode from "vscode";
import formatDocument from "./commands/formatDocument.js";
import addDefaultBlockIds from "./commands/addDefaultBlockIds.js";
import getRegexForBlockStarts from "./commands/getRegexForBlockStarts.js";
import insertNextBlockId from "./commands/insertNextBlockId.js";

export const activate = (context) => {
  context.subscriptions.push(
    // Register commands
    vscode.commands.registerCommand(
      "markit.addDefaultBlockIds",
      addDefaultBlockIds,
    ),
    vscode.commands.registerCommand("markit.insertNextParagraphId", () =>
      insertNextBlockId("paragraph"),
    ),
    vscode.commands.registerCommand("markit.insertNextNoteId", () =>
      insertNextBlockId("footnote"),
    ),
    vscode.commands.registerCommand(
      "markit.getRegexForBlockStarts",
      getRegexForBlockStarts,
    ),
    // Register document formatting provider
    vscode.languages.registerDocumentFormattingEditProvider("markit", {
      provideDocumentFormattingEdits(document) {
        return formatDocument(document);
      },
    }),
  );
};

export const deactivate = () => {};
