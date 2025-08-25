/**
 * Small HTML escaping helper used by webview renderers.
 * Keeps escaping centralized to avoid duplication and subtle differences.
 */
export function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, ch => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return ch;
    }
  });
}
