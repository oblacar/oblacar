import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AdminAdsService } from '../services/AdminAdsService';
import { AdminAuditService } from '../services/AdminAuditService';


const Ctx = createContext(null);
export const useAdminAds = () => useContext(Ctx);


export default function AdminAdsProvider({ children }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selection, setSelection] = useState([]);
    const [filters, setFilters] = useState({ q: '', status: '' });


    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await AdminAdsService.list(filters);
            setRows(data);
            setSelection([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);


    useEffect(() => { load(); }, [load]);


    const bulkHide = async () => {
        if (selection.length === 0) return;
        await AdminAdsService.hide(selection);
        await AdminAuditService.log('ads.hide', { ids: selection });
        load();
    };


    const bulkDelete = async () => {
        if (selection.length === 0) return;
        await AdminAdsService.softDelete(selection);
        await AdminAuditService.log('ads.delete', { ids: selection });
        load();
    };


    const value = { rows, loading, selection, setSelection, filters, setFilters, bulkHide, bulkDelete };
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}