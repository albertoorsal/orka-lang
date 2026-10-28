import { describe, expect, it } from "vitest";
import { SourceFile, formatDiagnostic, hasErrors } from "../src/index";
import type { Diagnostic } from "../src/index";

function error(
  code: string,
  message: string,
  start: number,
  end: number,
  label?: string,
  help?: string,
): Diagnostic {
  return {
    code,
    severity: "error",
    message,
    span: { start, end },
    label,
    help,
  };
}

describe("formatDiagnostic (spec section 6)", () => {
  it("renders the snippet, carets, label and help", () => {
    const file = new SourceFile("a.tel", 'let s = "a\\qb"\n');
    const d = error(
      "E1004",
      "invalid escape sequence `\\q`",
      10,
      12,
      "unknown escape",
      'valid escapes are \\n \\t \\r \\" \\\\ \\{ \\}',
    );
    expect(formatDiagnostic(d, file)).toBe(
      [
        "error[E1004]: invalid escape sequence `\\q`",
        " --> a.tel:1:11",
        "  |",
        '1 | let s = "a\\qb"',
        "  |           ^^ unknown escape",
        "  |",
        'help: valid escapes are \\n \\t \\r \\" \\\\ \\{ \\}',
      ].join("\n"),
    );
  });

  it("omits the label and the help when there are none", () => {
    const file = new SourceFile("a.tel", "x = @\n");
    expect(
      formatDiagnostic(error("E1001", "unexpected character `@`", 4, 5), file),
    ).toBe(
      [
        "error[E1001]: unexpected character `@`",
        " --> a.tel:1:5",
        "  |",
        "1 | x = @",
        "  |     ^",
      ].join("\n"),
    );
  });

  it("widens the gutter for two-digit line numbers", () => {
    const file = new SourceFile("a.tel", `${"\n".repeat(9)}x = @\n`);
    const d = error("E1001", "unexpected character `@`", 13, 14);
    expect(formatDiagnostic(d, file).split("\n")).toEqual([
      "error[E1001]: unexpected character `@`",
      "  --> a.tel:10:5",
      "   |",
      "10 | x = @",
      "   |     ^",
    ]);
  });

  it("expands tabs so the carets line up", () => {
    const file = new SourceFile("a.tel", "\tx = @\n");
    const lines = formatDiagnostic(
      error("E1001", "unexpected character `@`", 5, 6),
      file,
    ).split("\n");
    expect(lines[3]).toBe("1 |     x = @");
    expect(lines[4]).toBe("  |         ^");
  });

  it("only underlines the first line of a multi-line span", () => {
    const file = new SourceFile("a.tel", "a /* never\nclosed\n");
    const d = error(
      "E1002",
      "unterminated block comment",
      2,
      17,
      "the comment starts here",
    );
    const out = formatDiagnostic(d, file);
    expect(out).toContain("  |   ^^^^^^^^ the comment starts here");
    expect(out).not.toContain("closed");
  });

  it("shows one caret for an empty span, even past the end of the line", () => {
    const file = new SourceFile("a.tel", "ab\n");
    const lines = formatDiagnostic(
      error("E1100", "expected something", 2, 2),
      file,
    ).split("\n");
    expect(lines[4]).toBe("  |   ^");
  });

  it("never prints carriage returns", () => {
    const file = new SourceFile("a.tel", "x = @\r\n");
    expect(
      formatDiagnostic(error("E1001", "unexpected character `@`", 4, 5), file),
    ).not.toContain("\r");
  });

  it("prints warnings with their severity", () => {
    const file = new SourceFile("a.tel", "x\n");
    const d: Diagnostic = {
      code: "W0003",
      severity: "warning",
      message: "unused variable",
      span: { start: 0, end: 1 },
    };
    expect(formatDiagnostic(d, file).split("\n")[0]).toBe(
      "warning[W0003]: unused variable",
    );
  });
});

describe("hasErrors", () => {
  it("is true only when an error is present", () => {
    const warning: Diagnostic = {
      code: "W0003",
      severity: "warning",
      message: "m",
      span: { start: 0, end: 0 },
    };
    expect(hasErrors([])).toBe(false);
    expect(hasErrors([warning])).toBe(false);
    expect(hasErrors([warning, error("E1001", "m", 0, 1)])).toBe(true);
  });
});
