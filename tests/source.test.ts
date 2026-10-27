import { describe, expect, it } from "vitest";
import { SourceFile } from "../src/index";

describe("SourceFile", () => {
  const file = new SourceFile("t", "ab\ncd\r\nef");

  it("counts lines", () => {
    expect(file.lineCount).toBe(3);
  });

  it("maps offsets to 1-based lines and columns", () => {
    expect(file.position(0)).toEqual({ line: 1, column: 1 });
    expect(file.position(2)).toEqual({ line: 1, column: 3 });
    expect(file.position(3)).toEqual({ line: 2, column: 1 });
    expect(file.position(7)).toEqual({ line: 3, column: 1 });
    expect(file.position(8)).toEqual({ line: 3, column: 2 });
  });

  it("returns line text without terminators", () => {
    expect(file.lineText(1)).toBe("ab");
    expect(file.lineText(2)).toBe("cd");
    expect(file.lineText(3)).toBe("ef");
    expect(file.lineText(4)).toBe("");
  });

  it("slices by span", () => {
    expect(file.slice({ start: 3, end: 5 })).toBe("cd");
  });

  it("handles an empty file", () => {
    const empty = new SourceFile("e", "");
    expect(empty.lineCount).toBe(1);
    expect(empty.position(0)).toEqual({ line: 1, column: 1 });
    expect(empty.lineText(1)).toBe("");
  });

  it("has a last, empty line after a final newline", () => {
    const text = new SourceFile("t", "a\n");
    expect(text.lineCount).toBe(2);
    expect(text.lineText(2)).toBe("");
  });
});
