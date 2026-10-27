/** a half open range of UTF-16 offsets into source file :[start, end). */
export interface Span {
  start: number;
  end: number;
}

export interface Position {
  line: number;
  column: number;
}

/** A source text plus a line index, so offsets can be turned into line/column. */
export class SourceFile {
  readonly lineStarts: readonly number[];

  constructor(
    readonly name: string,
    readonly text: string,
  ) {
    const starts = [0];
    for (let i = 0; i < text.length; i++) {
      if (text.charCodeAt(i) === 10) starts.push(i + 1);
    }
    this.lineStarts = starts;
  }

  get lineCount(): number {
    return this.lineStarts.length;
  }

  position(offset: number): Position {
    let lo = 0;
    let hi = this.lineStarts.length - 1;

    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;

      if ((this.lineStarts[mid] ?? 0) <= offset) lo = mid;
      else hi = mid - 1;
    }

    return {
      line: lo + 1,
      column: offset - (this.lineStarts[lo] ?? 0) + 1,
    };
  }

  /** The text of a 1-based line, without its line terminator (`\n` or `\r\n`). */
  lineText(line: number): string {
    const start = this.lineStarts[line - 1];

    if (start === undefined) return "";
    const next = this.lineStarts[line];
    let end = next === undefined ? this.text.length : next - 1;
    if (end > start && this.text.charCodeAt(end - 1) === 13) end--;
    return this.text.slice(start, end);
  }

  slice(span: Span): string {
    return this.text.slice(span.start, span.end);
  }
}
