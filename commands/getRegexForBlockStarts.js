import * as vscode from "vscode";

export default () => {
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

  // Split by two (or more) line breaks to get blocks
  const blocks = contentAfterYaml.split(/\n\n+/);

  const firstWordsSets = [];

  blocks.forEach((block) => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) return;

    // Check if this is a paragraph or note block (not title)
    const paragraphIdMatch = trimmedBlock.match(/^\{#n?([0-9.*]+)(\}|,)/);
    if (!paragraphIdMatch) return; // Skip if not a paragraph or note block

    // Extract the text after the block ID
    const blockIdEndMatch = trimmedBlock.match(/^\{[^}]*\}\s*/);
    if (!blockIdEndMatch) return;

    const textAfterBlockId = trimmedBlock.substring(blockIdEndMatch[0].length);
    
    // Extract first three words
    // Words are separated by spaces, handling multiple spaces and line breaks
    const words = textAfterBlockId.split(/\s+/).filter(word => word.length > 0);

    const numberOfWords = Math.min(words.length, 5);
    const firstWords = words.slice(0, numberOfWords).join(' ');
    firstWordsSets.push(firstWords);
  });

  if (firstWordsSets.length === 0) {
    vscode.window.showInformationMessage("No paragraph blocks with at least 3 words found");
    return;
  }

  // Create a regex pattern for the union of all word sets
  // Escape special regex characters in each word set
  const escapedSets = firstWordsSets.map(wordSet => {
    return wordSet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  });

  // Create the regex pattern as alternation
  const regexPattern = escapedSets.join('|');

  // Copy to clipboard
  vscode.env.clipboard.writeText(regexPattern).then(() => {
    vscode.window.showInformationMessage(
      `Regex pattern copied to clipboard (${firstWordsSets.length} paragraph block(s) processed)`
    );
  });
};
