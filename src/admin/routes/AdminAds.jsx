// src/admin/routes/AdminAds.jsx
import React, { useState } from 'react';
import DataTable from '../components/Tables/DataTable';
import TableToolbar from '../components/Tables/TableToolbar';
import { useAdminAds } from '../context/AdminAdsContext';
import ConfirmModal from '../components/Modals/ConfirmModal';

export default function AdminAds() {
    const {
        rows,
        loading,
        selection,
        setSelection,
        filters,
        setFilters,
        bulkHide,
        bulkDelete,
        bulkRestore,
        bulkHardDelete,
    } = useAdminAds();

    const [confirmOpen, setConfirmOpen] = useState(false);

    const actions = [
        {
            label: 'Скрыть',
            onClick: bulkHide,
            disabled: selection.length === 0,
        },
        {
            label: 'Удалить (статус)',
            onClick: bulkDelete,
            disabled: selection.length === 0,
        },
        {
            label: 'Восстановить',
            onClick: bulkRestore,
            disabled: selection.length === 0,
        },
        {
            label: 'Удалить навсегда',
            onClick: () => setConfirmOpen(true),
            disabled: selection.length === 0,
            variant: 'danger',
        },
    ];

    const columns = [
        { key: 'id', title: 'ID' },
        { key: 'type', title: 'Тип' },
        { key: 'owner', title: 'Владелец' },
        { key: 'route', title: 'Маршрут' },
        { key: 'date', title: 'Дата' },
        { key: 'status', title: 'Статус' },
    ];

    const confirmCount = selection.length;

    return (
        <>
            <TableToolbar
                filters={filters}
                onChange={setFilters}
                actions={actions}
            />
            <DataTable
                rows={rows}
                columns={columns}
                loading={loading}
                selection={selection}
                onSelectionChange={setSelection}
            />

            {/* Диалог подтверждения «Удалить навсегда» */}
            <ConfirmModal
                open={confirmOpen}
                title='Удалить объявления навсегда?'
                description={
                    `Будут безвозвратно удалены ${confirmCount} элемент(ов) из базы данных. ` +
                    `Это действие нельзя отменить.`
                }
                confirmLabel='Да, удалить навсегда'
                onConfirm={async () => {
                    setConfirmOpen(false);
                    await bulkHardDelete();
                }}
                onClose={() => setConfirmOpen(false)}
                variant='danger'
            />
        </>
    );
}
