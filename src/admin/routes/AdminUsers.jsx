import React from 'react';
import DataTable from '../components/Tables/DataTable';
import TableToolbar from '../components/Tables/TableToolbar';
import { useAdminUsers } from '../context/AdminUsersContext';


export default function AdminUsers() {
    const { rows, loading, selection, setSelection, filters, setFilters, blockUsers, unblockUsers, grantAdmin, revokeAdmin } = useAdminUsers();


    const actions = [
        { label: 'Заблокировать', onClick: blockUsers, disabled: selection.length === 0, variant: 'danger' },
        { label: 'Разблокировать', onClick: unblockUsers, disabled: selection.length === 0 },
        { label: 'Выдать admin', onClick: grantAdmin, disabled: selection.length === 0 },
        { label: 'Снять admin', onClick: revokeAdmin, disabled: selection.length === 0 },
    ];


    const columns = [
        { key: 'id', title: 'ID' },
        { key: 'name', title: 'Имя' },
        { key: 'email', title: 'Email' },
        { key: 'role', title: 'Роль' },
        { key: 'status', title: 'Статус' },
        { key: 'createdAt', title: 'Регистрация' },
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