import { describe, it, expect, afterEach } from "vitest";
import { createMockDocument, loadFixture, resetMocks } from "./helpers.js";
import formatDocument from "../commands/formatDocument.js";

describe("formatDocument", () => {
  afterEach(() => {
    resetMocks();
  });

  describe("basic formatting", () => {
    it("should format a basic document correctly", () => {
      const content = loadFixture("basic.mit");
      const document = createMockDocument(content);
      const edits = formatDocument(document);

      expect(edits).toHaveLength(1);
      const result = edits[0].newText;

      // Should preserve YAML
      expect(result).toContain("id: test-basic");
      // Should have title on new line
      expect(result).toContain("{title}\nA Basic Test Document");
      // Should have proper block structure
      expect(result).toMatch(/{#1} .*\n\n{#2}/);
      // Should preserve inline markup
      expect(result).toContain("_italic_");
      expect(result).toContain("*bold*");
    });
  });

  describe("whitespace normalization", () => {
    it("should normalize excessive whitespace and tabs", () => {
      const content = loadFixture("formatDocument/unformatted.mit");
      const document = createMockDocument(content);
      const edits = formatDocument(document);

      expect(edits).toHaveLength(1);
      const result = edits[0].newText;

      // Should remove extra spaces
      expect(result.replaceAll('    ""')).not.toMatch(/ {2,}/); // Multiple spaces (except before quotes)
      // Should remove tabs
      expect(result).not.toContain("\t");
      // Should normalize title
      expect(result).toContain("{title}\nUnformatted Title");
    });

    it("should preserve block structure with double newlines", () => {
      const content = loadFixture("basic.mit");
      const document = createMockDocument(content);
      const edits = formatDocument(document);

      expect(edits).toHaveLength(1);
      // Should have double newlines between blocks
      expect(edits[0].newText).toMatch(/{#1} .*\n\n{#2}/);
    });
  });

  describe("title and heading formatting", () => {
    it("should normalize heading spacing for all levels", () => {
      const content = loadFixture("formatDocument/headings.mit");
      const document = createMockDocument(content);
      const edits = formatDocument(document);

      expect(edits).toHaveLength(1);
      const result = edits[0].newText;

      // Should normalize all heading levels
      expect(result).toContain("£1 Level One £1");
      expect(result).toContain("£2 Level Two £2");
      expect(result).toContain("£3 Level Three £3");
      expect(result).toContain("£4 Level Four £4");
      expect(result).toContain("£5 Five £5");
      expect(result).toContain("£6 Level Six £6");
    });

    it("should add newline after headings", () => {
      const content = loadFixture("formatDocument/headings.mit");
      const document = createMockDocument(content);
      const edits = formatDocument(document);

      expect(edits).toHaveLength(1);
      // Headings should have newlines after them
      expect(edits[0].newText).toMatch(/£1 Level One £1\n/);
      expect(edits[0].newText).toMatch(/£2 Level Two £2\n/);
    });
  });

  describe("block quotation formatting", () => {
    it("should indent block quotes with 4 spaces", () => {
      const content = loadFixture("formatDocument/block-quotes.mit");
      const document = createMockDocument(content);
      const edits = formatDocument(document);

      expect(edits).toHaveLength(1);
      const result = edits[0].newText;

      // All block quotes should be indented
      expect(result).toContain('    ""');
    });

    it("should format line breaks within block quotes", () => {
      const content = loadFixture("formatDocument/block-quotes.mit");
      const document = createMockDocument(content);
      const edits = formatDocument(document);

      expect(edits).toHaveLength(1);
      const result = edits[0].newText;

      // Block quote should have indented line breaks
      expect(result).toMatch(
        /    ""block quotation with \/\/\n    line breaks \/\/\n    in the middle""/,
      );
    });

    it("should handle multiple block quotes in one paragraph", () => {
      const content = loadFixture("formatDocument/block-quotes.mit");
      const document = createMockDocument(content);
      const edits = formatDocument(document);

      expect(edits).toHaveLength(1);
      const result = edits[0].newText;

      // Should have multiple indented quotes
      expect(result).toContain('    ""First quote""');
      expect(result).toContain('    ""Second quote //');
    });

    it("should preserve markup within block quotes", () => {
      const content = loadFixture("formatDocument/block-quotes.mit");
      const document = createMockDocument(content);
      const edits = formatDocument(document);

      expect(edits).toHaveLength(1);
      const result = edits[0].newText;

      expect(result).toContain("_italic_");
      expect(result).toContain("*bold*");
      expect(result).toContain("$foreign$");
    });

    it("should handle unmatched opening quote", () => {
      const content = loadFixture("formatDocument/unmatched-quote.mit");
      const document = createMockDocument(content);
      const edits = formatDocument(document);

      expect(edits).toHaveLength(1);
      const result = edits[0].newText;

      // Should indent unmatched opening quote with 4 spaces
      expect(result).toContain(
        '{#1} This paragraph has an\n    ""unmatched opening quote that is never closed properly.',
      );
      // Should still format the next paragraph normally
      expect(result).toContain(
        "{#2} This is a normal paragraph without quotes.",
      );
    });
  });

  describe("line break formatting", () => {
    it("should format // line breaks with newlines", () => {
      const content = loadFixture("formatDocument/line-breaks.mit");
      const document = createMockDocument(content);
      const edits = formatDocument(document);

      expect(edits).toHaveLength(1);
      const result = edits[0].newText;

      // Line breaks should be on separate lines
      expect(result).toMatch(
        /This paragraph has \/\/\nmultiple \/\/\nline breaks \/\/\nthroughout/,
      );
    });

    it("should handle line breaks with inline markup", () => {
      const content = loadFixture("formatDocument/line-breaks.mit");
      const document = createMockDocument(content);
      const edits = formatDocument(document);

      expect(edits).toHaveLength(1);
      const result = edits[0].newText;

      // Should preserve markup across line breaks
      expect(result).toContain("_italic //");
      expect(result).toContain("*bold //");
    });
  });

  describe("complex formatting scenarios", () => {
    it("should handle combination of all features", () => {
      const content = loadFixture("formatDocument/complex.mit");
      const document = createMockDocument(content);
      const edits = formatDocument(document);

      expect(edits).toHaveLength(1);
      const result = edits[0].newText;

      // Should have normalized heading
      expect(result).toContain("£1 Heading £1");
      expect(result).toContain("£2 Spaced Heading £2");
      // Should have indented quotes with line breaks
      expect(result).toMatch(/    ""block quote \/\/\n    with breaks""/);
      // Should handle footnotes
      expect(result).toContain("{#n1}");
    });

    it("should preserve YAML frontmatter exactly", () => {
      const content = loadFixture("basic.mit");
      const document = createMockDocument(content);
      const edits = formatDocument(document);

      expect(edits).toHaveLength(1);
      expect(edits[0].newText).toMatch(
        /^---\nid: test-basic\ntitle: A Basic Test Document\nauthor: Test Author\n---\n/,
      );
    });

    it("should handle documents without YAML metadata", () => {
      const content = loadFixture("formatDocument/no-yaml.mit");
      const document = createMockDocument(content);
      const edits = formatDocument(document);

      expect(edits).toHaveLength(1);
      const result = edits[0].newText;

      // Should not have YAML frontmatter
      expect(result).not.toContain("---");
      // Should start with title
      expect(result).toMatch(/^{title}\n/);
      // Should format blocks correctly
      expect(result).toContain("{#1} This is a paragraph");
      expect(result).toContain("{#2} Another paragraph");
      expect(result).toContain("{#n1} A footnote");
    });

    it("should remove trailing whitespace from lines", () => {
      const content = loadFixture("formatDocument/unformatted.mit");
      const document = createMockDocument(content);
      const edits = formatDocument(document);

      expect(edits).toHaveLength(1);
      // Should not have trailing spaces before newlines
      expect(edits[0].newText).not.toMatch(/. +\n/);
    });

    it("should end document with single newline", () => {
      const content = loadFixture("basic.mit");
      const document = createMockDocument(content);
      const edits = formatDocument(document);

      expect(edits).toHaveLength(1);
      expect(edits[0].newText).toMatch(/\n$/);
      expect(edits[0].newText).not.toMatch(/\n\n$/);
    });
  });
});
