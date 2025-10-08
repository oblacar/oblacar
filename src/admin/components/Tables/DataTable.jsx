import React from 'react';


export default function DataTable({ rows, columns, loading, selection, onSelectionChange }) {
    if (loading) return <div>Загрузка…</div>;


    const toggleAll = (e) => {
        if (e.target.checked) onSelectionChange(rows.map(r => r.id));
        else onSelectionChange([]);
    };
    const toggleOne = (id) => {
        if (selection.includes(id)) onSelectionChange(selection.filter(x => x !== id));
        else onSelectionChange([...selection, id]);
    };


    return (
        <div className="table-wrap">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th><input type="checkbox" onChange={toggleAll} checked={selection.length === rows.length && rows.length > 0} /></th>
                        {columns.map(c => <th key={c.key}>{c.title}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 && (
                        <tr><td colSpan={columns.length + 1}>Нет данных</td></tr>
                    )}
                    {rows.map(row => (
                        <tr key={row.id}>
                            <td>
                                <input type="checkbox" checked={selection.includes(row.id)} onChange={() => toggleOne(row.id)} />
                            </td>
                            {columns.map(c => <td key={c.key}>{row[c.key]}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}