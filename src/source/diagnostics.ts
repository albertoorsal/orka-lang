import type {SourceFile, Span} from "./source.js"

export interface Diagnostic {
  phase: Phase;
  code: string; // E01xx lex, E02xx parse, E03xx check, E04xx runtime
  message: string;
  span: Span;
}


/**
 * error[E0301]: unknown name 'prnt'
 *  --> hello.orka:1:1
 *   |
 * 1 | prnt("typo")
 *   | ^^^^
 */
export function renderDiagnostic(src: SourceFile, d: Diagnostic): string {
    const { line, col } = src.location(d.span.start);
    const text = src.lineText(line);
    const gutter = " ".repeat(String(line).length);
    // Underline at least one char, and never past the end of this line.
    const width = Math.max(1, Math.min(d.span.end - d.span.start, text.length - (col - 1)));
    return [
        `error[${d.code}]: ${d.message}`,
        `${gutter}--> ${src.path}:${line}:${col}`,
        `${gutter} |`,
        `${line} | ${text}`,
        `${gutter} | ${" ".repeat(col - 1)}${"^".repeat(width)}`,
    ].join("\n");
}
