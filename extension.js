import * as vscode from "vscode";
import formatDocument from "./commands/formatDocument.js";
import addDefaultBlockIds from "./commands/addDefaultBlockIds.js";
import getRegexForBlockStarts from "./commands/getRegexForBlockStarts.js";
import {
  insertNextParagraphId,
  insertNextFootnoteId,
} from "./commands/insertNextBlockId.js";

export const activate = (context) => {
  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "markit.addDefaultBlockIds",
      addDefaultBlockIds
    ),
    vscode.commands.registerCommand(
      "markit.insertNextParagraphId",
      insertNextParagraphId
    ),
    vscode.commands.registerCommand(
      "markit.insertNextNoteId",
      insertNextFootnoteId
    ),
    vscode.commands.registerCommand(
      "markit.getRegexForBlockStarts",
      getRegexForBlockStarts
    )
  );

  // Register document formatting provider
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider("markit", {
      provideDocumentFormattingEdits(document) {
        return formatDocument(document);
      },
    })
  );
};

export const deactivate = () => {};
