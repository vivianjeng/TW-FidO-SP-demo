// Builds copy-pasteable curl equivalents of the requests this app makes, so a developer
// can reproduce a call against MOICA (or this app's own proxy routes) outside the UI.

function shellSingleQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

/** curl for a JSON POST — what every SP-API-* proxy route sends to MOICA. */
export function buildJsonCurl(url: string, body: unknown, method: string = "POST"): string {
  const json = JSON.stringify(body, null, 2);
  return [
    `curl -X ${method} ${shellSingleQuote(url)}`,
    `  -H 'Content-Type: application/json'`,
    `  -d ${shellSingleQuote(json)}`,
  ].join(" \\\n");
}

/** curl for a form-urlencoded POST — what SP-API-WEB-01's browser redirect sends. */
export function buildFormCurl(url: string, fields: object): string {
  const entries = Object.entries(fields as Record<string, unknown>).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  return [
    `curl -X POST ${shellSingleQuote(url)}`,
    ...entries.map(([key, value]) => `  --data-urlencode ${shellSingleQuote(`${key}=${String(value)}`)}`),
  ].join(" \\\n");
}
