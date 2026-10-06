// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// A small RFC 4180 CSV reader: quoted fields, doubled quotes, commas and line breaks inside
// quotes, CRLF or LF, and a UTF-8 byte-order mark (what Excel writes). No dependency.

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  let i = text.charCodeAt(0) === 0xfeff ? 1 : 0;
  for (; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"' && field === '') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      rows.push(row); row = [];
    } else field += c;
  }
  if (quoted) throw new Error('A quoted field is never closed.');
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  // Blank lines (often at the end of an exported file) carry nothing.
  return rows.filter(r => r.some(cell => cell.trim() !== ''));
}

// The reverse, for templates and downloads.
export function toCsv(rows: string[][]): string {
  return rows.map(r => r.map(cell => /[",\r\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell).join(',')).join('\r\n') + '\r\n';
}
