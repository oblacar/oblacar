import React from 'react';
import DataTable from '../components/Tables/DataTable';
import TableToolbar from '../components/Tables/TableToolbar';
import { useAdminAds } from '../context/AdminAdsContext';


export default function AdminAds() {
    const {
        rows, loading, selection, setSelection,
        filters, setFilters,
        bulkHide, bulkDelete,
    } = useAdminAds();


    const actions = [
        { label: 'Скрыть', onClick: bulkHide, disabled: selection.length === 0 },
        { label: 'Удалить', onClick: bulkDelete, disabled: selection.length === 0, variant: 'danger' },
    ];


    const columns = [
        { key: 'id', title: 'ID' },
        { key: 'type', title: 'Тип' },
        { key: 'owner', title: 'Владелец' },
        { key: 'route', title: 'Маршрут' },
        { key: 'date', title: 'Дата' },
        { key: 'status', title: 'Статус' },
    ];


    return (
        <>
            <TableToolbar filters={filters} onChange={setFilters} actions={actions} />
            <DataTable
                rows={rows}
                columns={columns}
                loading={loading}
                selection={selection}
                onSelectionChange={setSelection}
            />
        </>
    );
}