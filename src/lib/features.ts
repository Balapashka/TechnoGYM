/**
 * Product "features" are free-text lines. Lines shaped "Name: value" become a
 * specification table; anything else stays a bullet point.
 */
export function splitFeatures(features: string[]): {
  specs: [string, string][];
  notes: string[];
} {
  const specs: [string, string][] = [];
  const notes: string[] = [];
  for (const line of features) {
    const m = /^([^:]{2,60}):\s*(.+)$/.exec(line.trim());
    if (m) specs.push([m[1].trim(), m[2].trim()]);
    else if (line.trim()) notes.push(line.trim());
  }
  return { specs, notes };
}
