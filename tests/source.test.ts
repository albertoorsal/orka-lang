import { describe, expect, test } from "vitest";
import { SourceFile } from "../src/source/source.js";
import { renderDiagnostic } from "../src/source/diagnostics.js"; 


describe("SourceFile", () => {
  const src = new SourceFile("t.orka", "ab\ncd\r\n\nlast");

  test("lineStarts", () => expect(src.lineStarts).toEqual([0, 3, 7, 8]));

  test("location", () => {
    expect(src.location(0)).toEqual({ line: 1, col: 1 });
    expect(src.location(2)).toEqual({ line: 1, col: 3 }); // the '\n' itself
    expect(src.location(4)).toEqual({ line: 2, col: 2 });
    expect(src.location(7)).toEqual({ line: 3, col: 1 }); // empty line
    expect(src.location(11)).toEqual({ line: 4, col: 4 });
  });

  test("lineText strips \\r and \\n", () => {
    expect(src.lineText(2)).toBe("cd");
    expect(src.lineText(3)).toBe("");
    expect(src.lineText(4)).toBe("last");
  });
});

describe("renderDiagnostic", () => {
  test("zero-width span still gets one caret", () => {
    const src = new SourceFile("t.orka", 'print("a"\n');
    const out = renderDiagnostic(src, {
      phase: "parse", code: "E0202", message: "expected ')'", span: { start: 9, end: 10 },
    });
    expect(out.split("\n").at(-1)).toBe("  |          ^");
  });

  test("multi-line span is clamped to the first line", () => {
    const src = new SourceFile("t.orka", 'x("abc\ndef")');
    const out = renderDiagnostic(src, {
      phase: "lex", code: "E0102", message: "unterminated string", span: { start: 2, end: 12 },
    });
    expect(out.split("\n").at(-1)).toBe("  |   ^^^^");
  });
});