/**
 * Represents Gherkin template: string with <> placeholders.
 * Example: 'Given <name> is <age> years old'
 */
export class GherkinTemplate {
  constructor(private template: string) {}

  fill(params: Record<string, unknown>) {
    return this.template.replace(/<(.+?)>/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match;
    });
  }

  extractParams() {
    return [...this.template.matchAll(/<(.+?)>/g)].map((m) => m[1]);
  }
}
