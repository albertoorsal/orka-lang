/** Half-open range of character offsets into the source text: [start, end). */
export interface Span {
    start: number;
    end: number;
}

export class SourceFile {
    /** Offset where each line begins. lineStarts[0] is always 0. */
    readonly lineStarts: number[] = [0];

    constructor(
        readonly path: string,
        readonly text: string,
    ) {
        for (let i = 0; i < text.length; i++) {
        if (text[i] === "\n") this.lineStarts.push(i + 1);
        }
    }

    /** 1-based line and column for an offset (binary search over lineStarts).
     * Binary search O(long n)
     */
    location(offset: number): { line: number; col: number } {
        let lo = 0;
        let hi = this.lineStarts.length - 1;
        while (lo < hi) {
            const mid = (lo + hi + 1) >> 1;
            if (this.lineStarts[mid]! <= offset) lo = mid;
            else hi = mid - 1;
        }
        return { line: lo + 1, col: offset - this.lineStarts[lo]! + 1 };
    }

    /** Text of a 1-based line, without its trailing newline. */
    lineText(line: number): string {
        const start = this.lineStarts[line - 1] ?? this.text.length;
        const next = this.lineStarts[line];
        const end = next === undefined ? this.text.length : next - 1;
        return this.text.slice(start, end).replace(/\r$/, "");
    }
}