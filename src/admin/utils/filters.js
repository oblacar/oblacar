export function applyTextFilter(rows, q, fields) {
    if (!q) return rows;
    const s = q.toLowerCase();
    return rows.filter(r => fields.some(f => String(r[f] ?? '').toLowerCase().includes(s)));
}