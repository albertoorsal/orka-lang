import type { SourceFile, Span } from "./source";

export type Severity = "error" | "warning";

export interface Diagnostic {
  code: string;
  severity: Severity;
  message: string;
  span: Span;
  label?: string | undefined;
  help?: string | undefined;
}

export function hasErrors(diagnostics: readonly Diagnostic[]): boolean {
  return diagnostics.some((d) => d.severity === "error");
}

const TAB_WIDTH = 4;

/**
 * Renders a diagnostic like the example in spec section 6:
 *
 *   error[E1004]: invalid escape sequence `\q`
 *    --> a.tel:1:11
 *     |
 *   1 | let s = "a\qb"
 *     |           ^^ unknown escape
 *     |
 *   help: valid escapes are ...
 *
 * Only the first line of a multi-line span is underlined.
 */
export function formatDiagnostic(d: Diagnostic, file: SourceFile): string {
  const { line, column } = file.position(d.span.start);
  const source = file.lineText(line);
  const lineStart = file.lineStarts[line - 1] ?? 0;

  // Tabs are expanded for display so the carets line up.
  let shown = "";
  let caretOffset = 0;
  for (let i = 0; i < source.length; i++) {
    if (i === column - 1) caretOffset = shown.length;
    shown +=
      source.charAt(i) === "\t" ? " ".repeat(TAB_WIDTH) : source.charAt(i);
  }
  if (column - 1 >= source.length) caretOffset = shown.length;

  const lastOnLine = Math.min(
    Math.max(d.span.end, d.span.start),
    lineStart + source.length,
  );
  let width = 0;
  for (let i = d.span.start; i < lastOnLine; i++) {
    width += file.text.charAt(i) === "\t" ? TAB_WIDTH : 1;
  }
  width = Math.max(1, width);

  const num = String(line);
  const pad = " ".repeat(num.length);
  const out = [
    `${d.severity}[${d.code}]: ${d.message}`,
    `${pad}--> ${file.name}:${line}:${column}`,
    `${pad} |`,
    `${num} | ${shown}`,
    `${pad} | ${" ".repeat(caretOffset)}${"^".repeat(width)}${d.label ? ` ${d.label}` : ""}`,
  ];
  if (d.help) {
    out.push(`${pad} |`, `help: ${d.help}`);
  }
  return out.join("\n");
}
