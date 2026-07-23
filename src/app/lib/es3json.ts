/**
 * Phasmophobia's EasySave3 (ES3) format is "mostly JSON" but bends the spec
 * in two ways that JSON.parse can't handle:
 *
 *   1. Bare numeric dictionary keys, e.g.  {12:2}          instead of {"12":2}
 *   2. Dictionary keys that are themselves objects, e.g.
 *        "Items": {
 *          {"low":4096,"high":0}: {"guid": {...}, "materialOption": 0},
 *          ...
 *        }
 *      (this shows up for things like 64-bit item IDs, which ES3 splits
 *      into a low/high 32-bit pair when used as a dictionary key.)
 *
 * A plain `JSON.parse` throws on both, which is why uploading a real save
 * file (one that contains an object-keyed dictionary, e.g. `LocalPlayerOutfit`)
 * fails. This module parses ES3 text directly into plain JS objects/arrays,
 * and can serialize back to valid ES3 text.
 *
 * Object-typed keys are represented as an object key of the form
 * `OBJKEY_PREFIX + <compact JSON of the key object>` so they survive as a
 * normal JS object property (JS object keys must be strings) - parseES3/
 * dumpES3 know how to translate that back into ES3's native bare-object-key
 * form on the way out.
 */

export const OBJKEY_PREFIX = '\u0000ES3OBJKEY:'

export type ES3Value =
  | string
  | number
  | boolean
  | null
  | ES3Value[]
  | { [key: string]: ES3Value }

export class ES3JSONError extends Error {}

const WHITESPACE = new Set([' ', '\t', '\n', '\r'])

class Parser {
  private text: string
  private i = 0
  private n: number

  constructor(text: string) {
    this.text = text
    this.n = text.length
  }

  parse(): { [key: string]: ES3Value } {
    this.skipWs()
    const value = this.parseValue()
    this.skipWs()

    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      this.err('Root value must be an object')
    }
    if (this.i !== this.n) {
      this.err('Unexpected trailing data')
    }
    return value as { [key: string]: ES3Value }
  }

  private skipWs(): void {
    while (this.i < this.n && WHITESPACE.has(this.text[this.i])) this.i++
  }

  private peek(): string {
    return this.i < this.n ? this.text[this.i] : ''
  }

  private err(msg: string): never {
    const start = Math.max(0, this.i - 20)
    const end = Math.min(this.n, this.i + 20)
    const context = this.text.slice(start, end)
    throw new ES3JSONError(`${msg} at position ${this.i} (near: ...${context}...)`)
  }

  private parseValue(): ES3Value {
    const ch = this.peek()
    if (ch === '{') return this.parseObject()
    if (ch === '[') return this.parseArray()
    if (ch === '"') return this.parseString()
    if (ch === '-' || (ch >= '0' && ch <= '9')) return this.parseNumber()
    if (this.text.startsWith('true', this.i)) {
      this.i += 4
      return true
    }
    if (this.text.startsWith('false', this.i)) {
      this.i += 5
      return false
    }
    if (this.text.startsWith('null', this.i)) {
      this.i += 4
      return null
    }
    this.err(`Unexpected character ${JSON.stringify(ch)}`)
  }

  private parseObject(): { [key: string]: ES3Value } {
    this.i++ // consume '{'
    const obj: { [key: string]: ES3Value } = {}
    this.skipWs()
    if (this.peek() === '}') {
      this.i++
      return obj
    }
    for (;;) {
      this.skipWs()
      const key = this.parseKey()
      this.skipWs()
      if (this.peek() !== ':') this.err("Expected ':'")
      this.i++
      this.skipWs()
      obj[key] = this.parseValue()
      this.skipWs()
      const ch = this.peek()
      if (ch === ',') {
        this.i++
        continue
      }
      if (ch === '}') {
        this.i++
        break
      }
      this.err("Expected ',' or '}'")
    }
    return obj
  }

  private parseKey(): string {
    const ch = this.peek()
    if (ch === '"') return this.parseString()
    if (ch === '{') {
      // A dictionary key that is itself an object - not standard JSON, but
      // ES3 does this (e.g. split 64-bit IDs).
      const keyObj = this.parseObject()
      return OBJKEY_PREFIX + JSON.stringify(keyObj)
    }
    if (ch === '-' || (ch >= '0' && ch <= '9')) {
      const start = this.i
      this.consumeNumber()
      return this.text.slice(start, this.i)
    }
    this.err(`Unexpected key start ${JSON.stringify(ch)}`)
  }

  private parseNumber(): number {
    const start = this.i
    this.consumeNumber()
    const raw = this.text.slice(start, this.i)
    if (/[.eE]/.test(raw)) return parseFloat(raw)
    return parseInt(raw, 10)
  }

  private consumeNumber(): void {
    if (this.peek() === '-') this.i++
    if (!/[0-9]/.test(this.peek())) this.err('Malformed number')
    while (this.i < this.n && /[0-9]/.test(this.text[this.i])) this.i++
    if (this.peek() === '.') {
      this.i++
      if (!/[0-9]/.test(this.peek())) this.err('Malformed number')
      while (this.i < this.n && /[0-9]/.test(this.text[this.i])) this.i++
    }
    if (this.peek() === 'e' || this.peek() === 'E') {
      this.i++
      if (this.peek() === '+' || this.peek() === '-') this.i++
      if (!/[0-9]/.test(this.peek())) this.err('Malformed exponent')
      while (this.i < this.n && /[0-9]/.test(this.text[this.i])) this.i++
    }
  }

  private parseArray(): ES3Value[] {
    this.i++ // consume '['
    const arr: ES3Value[] = []
    this.skipWs()
    if (this.peek() === ']') {
      this.i++
      return arr
    }
    for (;;) {
      this.skipWs()
      arr.push(this.parseValue())
      this.skipWs()
      const ch = this.peek()
      if (ch === ',') {
        this.i++
        continue
      }
      if (ch === ']') {
        this.i++
        break
      }
      this.err("Expected ',' or ']'")
    }
    return arr
  }

  private parseString(): string {
    this.i++ // consume opening quote
    let out = ''
    while (this.i < this.n) {
      const ch = this.text[this.i]
      if (ch === '"') {
        this.i++
        return out
      }
      if (ch === '\\') {
        this.i++
        if (this.i >= this.n) this.err('Unterminated escape sequence')
        const esc = this.text[this.i]
        const simple: { [key: string]: string } = {
          '"': '"',
          '\\': '\\',
          '/': '/',
          b: '\b',
          f: '\f',
          n: '\n',
          r: '\r',
          t: '\t',
        }
        if (esc in simple) {
          out += simple[esc]
          this.i++
        } else if (esc === 'u') {
          const hex = this.text.slice(this.i + 1, this.i + 5)
          out += String.fromCharCode(parseInt(hex, 16))
          this.i += 5
        } else {
          out += esc
          this.i++
        }
      } else {
        out += ch
        this.i++
      }
    }
    this.err('Unterminated string')
  }
}

/** Parse ES3-flavored text into a plain JS object (dicts/arrays/etc). */
export function parseES3(text: string): { [key: string]: ES3Value } {
  return new Parser(text).parse()
}

function dumpKey(k: string, buf: string[], indent: number, level: number): void {
  if (k.startsWith(OBJKEY_PREFIX)) {
    const keyObj = JSON.parse(k.slice(OBJKEY_PREFIX.length))
    dumpValue(keyObj, buf, indent, level)
  } else if (/^-?\d+$/.test(k)) {
    buf.push(k)
  } else {
    buf.push(JSON.stringify(k))
  }
}

function dumpValue(value: unknown, buf: string[], indent: number, level: number): void {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const entries = Object.entries(value as { [key: string]: unknown })
    if (entries.length === 0) {
      buf.push('{}')
      return
    }
    const nl = indent ? '\n' : ''
    buf.push('{' + nl)
    entries.forEach(([k, v], idx) => {
      if (indent) buf.push(' '.repeat(indent * (level + 1)))
      dumpKey(k, buf, indent, level + 1)
      buf.push(indent ? ' : ' : ':')
      dumpValue(v, buf, indent, level + 1)
      if (idx !== entries.length - 1) buf.push(',')
      buf.push(nl)
    })
    if (indent) buf.push(' '.repeat(indent * level))
    buf.push('}')
  } else if (Array.isArray(value)) {
    if (value.length === 0) {
      buf.push('[]')
      return
    }
    const nl = indent ? '\n' : ''
    buf.push('[' + nl)
    value.forEach((v, idx) => {
      if (indent) buf.push(' '.repeat(indent * (level + 1)))
      dumpValue(v, buf, indent, level + 1)
      if (idx !== value.length - 1) buf.push(',')
      buf.push(nl)
    })
    if (indent) buf.push(' '.repeat(indent * level))
    buf.push(']')
  } else if (typeof value === 'string') {
    buf.push(JSON.stringify(value))
  } else if (typeof value === 'boolean') {
    buf.push(value ? 'true' : 'false')
  } else if (typeof value === 'number') {
    buf.push(String(value))
  } else if (value === null || value === undefined) {
    buf.push('null')
  } else {
    throw new ES3JSONError(`Cannot serialize value of type ${typeof value}`)
  }
}

/**
 * Serialize a plain JS object back into ES3-flavored text.
 *
 * Defaults to compact output (no extra whitespace) to match the format
 * Phasmophobia itself writes - pass indent > 0 for a human-readable version.
 */
export function dumpES3(obj: unknown, indent = 0): string {
  const buf: string[] = []
  dumpValue(obj, buf, indent, 0)
  return buf.join('')
}
