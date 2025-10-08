import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import { AdminStatsService } from '../services/AdminStatsService';


export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const s = await AdminStatsService.getOverview();
                if (mounted) setStats(s);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => (mounted = false);
    }, []);


    if (loading) return <div>Загрузка…</div>;
    if (!stats) return <div>Нет данных</div>;


    return (
        <div className="admin-grid-4">
            <StatCard title="Пользователи (7д)" value={stats.usersWeek} />
            <StatCard title="Объявления активные" value={stats.adsActive} />
            <StatCard title="Транспортировки активные" value={stats.transportationsActive} />
            <StatCard title="Жалобы новые" value={stats.reportsNew} />
            {/* Место под простые графики — добавим позже */}
        </div>
    );
}