# Markit VS Code Extension

## Project Overview

This is a VS Code language extension for Markit (`.mit` files), providing syntax highlighting, snippets, formatting, and some miscellaneous commands to help in the generation of Markit documents.

## Extension Structure

- `./extension.js`: Main entry point using ES modules. Registers commands and the document formatting provider.
- `/commands`: Code for commands implementing Markit-specific functionality.
- `/syntaxes/markit.tmLanguage.json`: TextMate grammar for syntax highlighting.
- `/language-configuration.json`: Auto-closing pairs for Markit's unique delimiters.

## Markit Language Specification

Markit is a lightweight markup language similar in spirit to Markdown but with its own syntax and features. It is designed for use in digital humanities projects to preserve early modern printed texts, and provide every text and paragraph.
