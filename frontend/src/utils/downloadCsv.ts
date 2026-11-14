/**
 * Download a UTF-8 CSV file from explicitly supplied dashboard records.
 * Text cells are escaped and protected against spreadsheet formula injection.
 */
export function downloadCsv(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const encode = (value: string | number | null | undefined) => {
    let text = value == null ? "" : String(value);
    if (/^[=+@\r\n\t]/.test(text) || /^-[^0-9.]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  const content = [headers, ...rows].map(row => row.map(encode).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.hidden = true;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
