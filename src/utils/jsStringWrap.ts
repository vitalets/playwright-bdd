/**
 * Adopted version of https://github.com/joliss/js-string-escape
 * - added support of backticks
 * - added 'quotes' option to indicate which quotes to escape
 * - wrap result string with provided quotes
 *
 * Considered alternative is https://github.com/mathiasbynens/jsesc,
 * but it provides additional functionality and much slower
 * See: https://github.com/mathiasbynens/jsesc/issues/16
 */
export function jsStringWrap(
  str: string,
  { quotes = 'single' }: { quotes?: 'single' | 'double' | 'backtick' } = {},
) {
  const wrapQuote = quotes === 'single' ? "'" : quotes === 'double' ? '"' : '`';
  // eslint-disable-next-line visual/complexity
  const escapedStr = ('' + str).replace(/["'`\\\n\r\u2028\u2029]/g, (character) => {
    // Escape all characters not included in SingleStringCharacters and
    // DoubleStringCharacters on
    // http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.4
    switch (character) {
      case wrapQuote:
      case '\\':
        return '\\' + character;
      // Four possible LineTerminator characters need to be escaped:
      case '\n':
        return '\\n';
      case '\r':
        return '\\r';
      case '\u2028':
        return '\\u2028';
      case '\u2029':
        return '\\u2029';
      default:
        return character;
    }
  });

  return `${wrapQuote}${escapedStr}${wrapQuote}`;
}
