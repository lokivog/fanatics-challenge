module.exports = {
  singleQuote: true, // Use single quotes instead of double quotes - defaults `false`
  quoteProps: 'as-needed', // Change when properties in objects are quoted - defaults `as-needed`
  jsxSingleQuote: false, // Use single quotes instead of double quotes in JSX -  defaults `false`
  bracketSpacing: false, // Print spaces between brackets in object literals. - defaults `true`
  // deliberately set high to avoid formatting errors
  // https://prettier.io/docs/en/options.html#print-width
  printWidth: 120, // Specify the line length that the printer will wrap on - defaults `80`
  tabWidth: 2, // Specify the number of spaces per indentation-level - defaults `2`
  useTabs: false, // Indent lines with tabs instead of spaces - defaults `false`
  semi: true, // Print semicolons at the ends of statements - defaults `true`
  trailingComma: 'none', // Print trailing commas wherever possible when multi-line. - defaults `none`
  /**
   * Put the > of a multi-line JSX element at the end of the last line instead of being alone on the next line
   *
   * <button
   *   className="prettier-class"
   *   id="prettier-id"
   *   onClick={this.handleClick}
   * >
   *   Click Here
   * </button>
   */
  jsxBracketSameLine: false, // defaults `false`
  /**
   * Include parentheses around a sole arrow function parameter.
   * "avoid" - Omit parens when possible. Example: x => x
   */
  arrowParens: 'avoid', // default `avoid`
  // https://prettier.io/blog/2018/11/07/1.15.0.html#whitespace-sensitive-formatting
  htmlWhitespaceSensitivity: 'css', // defaults `css`
  endOfLine: 'auto' // Makes prettier tolerant of CRLF or LF - defaults `auto`
};
