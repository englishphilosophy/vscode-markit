import { Range, TextEdit } from "vscode";
import parseDocument from "./parseDocument.js";

export default (document) => {
  const text = document.getText();
  const { yamlContent, blocks } = parseDocument(text);
  const formattedText = `${yamlContent}${blocks.map(formatBlock).join("\n\n")}\n`;
  const fullRange = new Range(
    document.positionAt(0),
    document.positionAt(text.length),
  );
  return [TextEdit.replace(fullRange, formattedText)];
};

const formatBlock = (block) => {
  let processed = normalizeWhitespace(block);
  processed = formatHeadingsAndTitle(processed);

  const quotePositions = findQuotationPositions(processed);
  const result = processQuotations(processed, quotePositions);

  const lines = result.split("\n");
  const cleanedLines = lines.map((line) => line.replace(/\s+$/, ""));

  return cleanedLines.join("\n");
};

const normalizeWhitespace = (text) => {
  return text
    .replace(/\t/g, " ")
    .replace(/\n/g, " ")
    .replace(/  +/g, " ")
    .trim();
};

const formatHeadingsAndTitle = (text) => {
  return text
    .replace(/^\{title\}\s/, "{title}\n")
    .replaceAll(/£([1-6])\s+(.*?)\s+£\1\s+/g, "£$1 $2 £$1\n");
};

const findQuotationPositions = (text) => {
  const quoteRegex = /""/g;
  const positions = [];
  let match;

  while ((match = quoteRegex.exec(text)) !== null) {
    positions.push(match.index);
  }

  return positions;
};

const processQuotations = (processed, quotePositions) => {
  if (quotePositions.length === 0) {
    return handleLineBreaks(processed);
  }

  let result = "";
  let pos = 0;

  for (let i = 0; i < quotePositions.length; i += 2) {
    const quoteStart = quotePositions[i];
    const quoteEnd = quotePositions[i + 1];

    // Handle text before quotation
    const beforeQuote = processed.substring(pos, quoteStart).trim();
    if (beforeQuote) {
      if (result) result += "\n";
      result += handleLineBreaks(beforeQuote);
    }

    // Handle the quotation itself
    if (quoteEnd !== undefined) {
      const quoteContent = processed.substring(quoteStart + 2, quoteEnd);

      if (result) result += "\n";

      const quoteParts = quoteContent.split("//");
      const indentedParts = quoteParts.map((part) => part.trim());

      result += `    ""${indentedParts.join(" //\n    ")}""`;
      pos = quoteEnd + 2;
    } else {
      // Unmatched opening quote
      const remaining = processed.substring(quoteStart).trim();
      if (remaining) {
        if (result) result += "\n";
        result += handleLineBreaks(remaining);
      }
      pos = processed.length;
      break;
    }
  }

  // Handle remaining text after last quotation
  const afterQuote = processed.substring(pos).trim();
  if (afterQuote) {
    if (result) result += "\n";
    result += handleLineBreaks(afterQuote);
  }

  return result;
};

const handleLineBreaks = (text) => {
  const parts = text.split("//").map((part) => part.trim());
  return parts.join(" //\n");
};
