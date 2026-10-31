import type { Span } from "./source";


/** Reserver words that are in use. Each one is its own token kind */
export const KEYWORDS = [
    "type",
    "enum",
    "tool",
    "agent",
    "workflow",
    "convert",
    "ephemeral",
    "let",
    "match",
    "else",
    "return",
    "parallel",
    "http",
    "true",
    "false"
] as const


/** Reserved for future  versions. The lexer emits kind `Reserved`; the 
 * parser rejects
*/
export const RESERVED_WORDS = [
    "impot",
    "export",
    "from",
    "fn",
    "for",
    "while",
    "in",
    "out",
    "mut",
    "const"
] as const 


export type KeywordKind=(typeof KEYWORDS)[number]

export type PunctKind =
  | "+"
  | "-"
  | "*"
  | "/"
  | "%"
  | "=="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">="
  | "&&"
  | "||"
  | "!"
  | "="
  | "=>"
  | "->"
  | "?"
  | "."
  | ","
  | ":"
  | "|"
  | "("
  | ")"
  | "{"
  | "}"
  | "["
  | "]"


export type TokenKind = 
    | KeywordKind 
    | PunctKind
    | "Indent"
    /** The lone identifier `_` : a wildcard in patterns */ 
    | "Underscore"
    | "Reserved"
    | "Duration" 
    /** A string with no interpolation */
    | "String"
    /** A string with at least one `{expr}` part. */
    | "TemplateString"
    /** Statement terminator inserted at significant line breaks 
     * Zero width. */
    | "TERM"
    | "EOF"


/** A piece of a string with interpolation.
 * Expressions are not tokenized by the lexer
 */
export type TemplatePart = 
    | {kind : "text"; value : string}
    /** `span` covers the expression source between the braces;
     * it with `lexInterpolation`
     */
    | {king : "expr"; span  : Span}


interface BaseToken {
    /** The extract source text of the token (empty for `TERM` and `EOF`) */
    text : string
    span : Span
}


export type Token =
    | (BaseToken & { kind: "Number"; value: number})
    /** `value` is in milliseconds */
    | (BaseToken & { kind: "Duration"; value: number})
    | (BaseToken & { kind: "String"; value: string})
    | (BaseToken & { kind: "TemplateString"; value: string})
    | (BaseToken & { kind : Exclude<TokenKind, "Number" | "Duration" | "String" | "TemplateString">})


