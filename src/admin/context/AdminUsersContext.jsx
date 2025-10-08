import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AdminUsersService } from '../services/AdminUsersService';
import { AdminAuditService } from '../services/AdminAuditService';


const Ctx = createContext(null);
export const useAdminUsers = () => useContext(Ctx);


export default function AdminUsersProvider({ children }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selection, setSelection] = useState([]);
    const [filters, setFilters] = useState({ q: '', status: '' });


    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await AdminUsersService.list(filters);
            setRows(data);
            setSelection([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);


    useEffect(() => { load(); }, [load]);


    const blockUsers = async () => {
        if (selection.length === 0) return;
        await AdminUsersService.block(selection);
        await AdminAuditService.log('users.block', { ids: selection });
        load();
    };
    const unblockUsers = async () => {
        if (selection.length === 0) return;
        await AdminUsersService.unblock(selection);
        await AdminAuditService.log('users.unblock', { ids: selection });
        load();
    };
    const grantAdmin = async () => {
        if (selection.length === 0) return;
        await AdminUsersService.grantAdmin(selection);
        await AdminAuditService.log('users.grantAdmin', { ids: selection });
        load();
    };
    const revokeAdmin = async () => {
        if (selection.length === 0) return;
        await AdminUsersService.revokeAdmin(selection);
        await AdminAuditService.log('users.revokeAdmin', { ids: selection });
        load();
    };


    const value = { rows, loading, selection, setSelection, filters, setFilters, blockUsers, unblockUsers, grantAdmin, revokeAdmin };
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}