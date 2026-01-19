# Markit VS Code Extension

## Project Overview

This is a VS Code language extension for Markit (`.mit` files), providing syntax highlighting, snippets, formatting, and some miscellaneous commands to help in the generation of Markit documents.

## Extension Structure

- `./extension.js`: Main entry point using ES modules. Registers commands and the document formatting provider.
- `/commands`: Code for commands implementing Markit-specific functionality.
- `/syntaxes/markit.tmLanguage.json`: TextMate grammar for syntax highlighting.
- `/language-configuration.json`: Auto-closing pairs for Markit's unique delimiters.

## Code Style

- Format code using Prettier with default settings.
- Use a functional programming style.
- Prefer `const` over `let`.
- Prefer immutable data structures and returning new copies instead of mutating existing data.
- Prefer arrow functions.
- Prefer small functions; break larger functions down into smaller ones as needed.
- Prefer self-documenting code (clear variable and function names, small functions) over comments.

## Markit Language Specification

Markit is a lightweight markup language similar in spirit to Markdown but with its own syntax and features. It is designed for use in digital humanities projects to preserve early modern printed texts, and provide every text and paragraph with a unique identifier.

### Basic Structure of a Markit Document

Markit documents start with some metadata in YAML format, surrounded by `---` lines (like in GitHub flavoured Markdown). The metadata _must_ include an `id` field with a unique identifier for the document. Any other data is permitted.

After the metadata, the document body consists of a series of _blocks_, separated by two line breaks. (Single line breaks are treated as spaces, as in Markdown.)

### Block Types and IDs

Each block starts with an ID. IDs are of three types:

1. `{title}`: For the title of the document. There should be only one title block per document, and it should be the first block. It is followed by a line break and then the title text.
2. `{#<identifier>}`: For paragraphs. The identifier is typically a number, and paragraphs are typically numbered sequentially, but there are some special cases where the identifier may include letters or a period (e.g., `{#12a}`, `{#12.5}`). Paragraphs all appear after the title.
3. `{#n<identifier>}`: For footnotes. The identifier is typically a number, and footnotes are typically numbered sequentially, but there are some special cases where the identifier may include letters or a period (e.g., `{#n3a}`, `{#n3.5}`). Footnotes appear after all paragraphs.

### Block Metadata

In addition to the YAML document metadata at the start of the file, each block may also have its own metadata. Block metadata included in the ID as key-value pairs separated by commas. For example: `{#12,title=Part II.,speaker=Philo}`.

### Inline Markup

Within blocks, Markit supports inline markup for text formatting and special characters.

Inline markup:

- `£1 Title £1`: Level 1 heading.
- `£2 Title £2`: Level 2 heading.
- `£3 Title £3`: Level 3 heading.
- `£4 Title £4`: Level 4 heading.
- `£5 Title £5`: Level 5 heading.
- `£6 Title £6`: Level 6 heading.
- `"inline quotation"`: Inline quotation marks.
- `""block quotation""`: Block quotation marks.
- `_italic_`: Italic text surrounded by underscores.
- `*bold*`: Bold text surrounded by asterisks.
- `$foreign text$`: Foreign language text surrounded by dollar signs.
- `$$greek text$$`: Greek text surrounded by double dollar signs. (Letters in the Roman alphabet surrounded by double dollar signs are compiled to their Greek equivalents.)
- `# margin comment #`: Margin comment surrounded by hash symbols (and spaces).
- `{++editorial insertion++}`: Editorial insertion surrounded by `{++` and `++}`.
- `{--editorial deletion--}`: Editorial deletion surrounded by `{--` and `--}`.
- `[n<identifier>]`: Footnote reference, where `<identifier>` matches a footnote ID.
- `[citation]`: Citation reference.

Special characters:

- `~`: Tilde for a non-breaking space.
- `~~`: Double tilde for a tab.
- `{-}`: En dash.
- `{--}`: Em dash.
- `{AE}`: Æ ligature.
- `{ae}`: æ ligature.
- `{OE}`: Œ ligature.
- `{oe}`: œ ligature.
- `\S`: Section sign.
- `|`: Vertical bar for a page break in the copy text.
- `//`: Double slash for a line break.
- `\`: Escape character to treat the next character literally.
