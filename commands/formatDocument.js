import * as vscode from "vscode";

export default (document) => {
  // get all text from the document
  const text = document.getText();

  // look for YAML frontmatter and the rest of the text
  const yamlMatch = text.match(/^---\n[\s\S]*?\n---\n/);
  const yamlFrontmatter = yamlMatch ? yamlMatch[0] : "";
  const textToProcess = yamlMatch ? text.substring(yamlMatch[0].length) : text;

  // Extract blocks from the text after YAML frontmatter
  const blocks = textToProcess.replace(/\n{3,}/g, "\n\n").split(/\n\n/);

  // Format each block and reattach YAML frontmatter
  const formattedText = yamlFrontmatter + blocks.map(processedBlock).join("\n\n") + "\n";

  // Create a TextEdit replacing the entire document content
  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(text.length)
  );
  const textEdit = vscode.TextEdit.replace(fullRange, formattedText);

  // Return the array of TextEdits
  return [textEdit];
};

const processedBlock = (block) => {
  // Replace tabs with spaces
  let processed = block.replace(/\t/g, " ");

  // Collapse all line breaks to spaces (blocks should be on single line initially)
  processed = processed.replace(/\n/g, " ");

  // Collapse multiple spaces to single space
  processed = processed.replace(/  +/g, " ").trim();

  // Now format according to special rules
  let result = "";
  let pos = 0;

  // add line break after '{title}' ID
  processed = processed.replace(/^\{title\}\s/, "{title}\n");

  // add line breaks between all headings (e.g. '£1 Heading 1 £1', '£2 Heading 2 £2')
  processed = processed.replaceAll(
    /£([1-6])\s+(.*?)\s+£\1\s+/g,
    "£$1 $2 £$1\n"
  );

  // Find all block quotations: ""...""
  const quoteRegex = /""/g;
  const quotePositions = [];
  let match;

  while ((match = quoteRegex.exec(processed)) !== null) {
    quotePositions.push(match.index);
  }

  // Process text between quotation marks
  for (let i = 0; i < quotePositions.length; i += 2) {
    const quoteStart = quotePositions[i];
    const quoteEnd = quotePositions[i + 1];

    // Handle text before this quotation
    const beforeQuote = processed.substring(pos, quoteStart).trim();
    if (beforeQuote) {
      if (result) result += "\n";
      // Split by // and add line breaks
      const parts = beforeQuote.split("//").map((part) => part.trim());
      result += parts.join(" //\n");
    }

    // Handle the quotation itself (if we have a closing quote)
    if (quoteEnd !== undefined) {
      const quoteContent = processed.substring(quoteStart + 2, quoteEnd);

      if (result) result += "\n";

      // Split quote content by // and indent each line
      const quoteParts = quoteContent.split("//");
      const indentedParts = quoteParts.map((part) => part.trim());

      result += `    ""${indentedParts.join(" //\n    ")}""`;

      pos = quoteEnd + 2;
    } else {
      // Unmatched opening quote - treat as regular text
      const remaining = processed.substring(quoteStart).trim();
      if (remaining) {
        if (result) result += "\n";
        const parts = remaining.split("//").map((part) => part.trim());
        result += parts.join(" //\n");
      }
      pos = processed.length;
      break;
    }
  }

  // Handle any remaining text after the last quotation
  const afterQuote = processed.substring(pos).trim();
  if (afterQuote) {
    if (result) result += "\n";
    const parts = afterQuote.split("//").map((part) => part.trim());
    result += parts.join(" //\n");
  }

  // If no quotations were found, just handle // line breaks
  if (quotePositions.length === 0) {
    const parts = processed.split("//").map((part) => part.trim());
    result = parts.join(" //\n");
  }

  // Final cleanup: remove trailing whitespace from each line
  const lines = result.split("\n");
  const cleanedLines = lines.map((line) => line.replace(/\s+$/, ""));

  return cleanedLines.join("\n");
};
