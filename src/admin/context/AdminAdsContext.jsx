// src/admin/context/AdminAdsContext.jsx
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from 'react';
import { AdminAdsService } from '../services/AdminAdsService';
import { AdminAuditService } from '../services/AdminAuditService';

const Ctx = createContext(null);
export const useAdminAds = () => useContext(Ctx);

export default function AdminAdsProvider({ children }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selection, setSelection] = useState([]);
    const [filters, setFilters] = useState({ q: '', status: '', type: 'all' });

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

    useEffect(() => {
        load();
    }, [load]);

    const selectedPairs = () =>
        rows
            .filter((r) => selection.includes(r.id))
            .map((r) => ({ id: r.id, _root: r._root }));

    const bulkHide = async () => {
        const items = selectedPairs();
        if (!items.length) return;
        await AdminAdsService.hide(items);
        await AdminAuditService.log('ads.hide', {
            ids: items.map((x) => x.id),
        });
        load();
    };

    const bulkDelete = async () => {
        const items = selectedPairs();
        if (!items.length) return;
        await AdminAdsService.softDelete(items);
        await AdminAuditService.log('ads.delete', {
            ids: items.map((x) => x.id),
        });
        load();
    };

    const bulkRestore = async () => {
        const items = selectedPairs();
        if (!items.length) return;
        await AdminAdsService.restore(items);
        await AdminAuditService.log('ads.restore', {
            ids: items.map((x) => x.id),
        });
        load();
    };

    // 🔥 жёсткое удаление
    const bulkHardDelete = async () => {
        const items = selectedPairs();
        if (!items.length) return;
        await AdminAdsService.hardDeleteCascade(items); // 👈 КАСКАД
        await AdminAuditService.log('ads.hardDeleteCascade', {
            ids: items.map((x) => x.id),
        });
        load();
    };

    const value = {
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
    };

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
