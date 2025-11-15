import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';

// Графики
import AdminLineChart from '../components/charts/AdminLineChart';
import AdminPieChart from '../components/charts/AdminPieChart';
import AdminBarChart from '../components/charts/AdminBarChart';
import AdminAreaChart from '../components/charts/AdminAreaChart';

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

    // 🔥 Фейковые данные для визуального дизайна
    const fakeStats = {
        usersWeek: 42,
        adsActive: 128,
        transportationsActive: 8,
        reportsNew: 3,
    };

    const lineData = [
        { day: 'Пн', value: 12 },
        { day: 'Вт', value: 18 },
        { day: 'Ср', value: 8 },
        { day: 'Чт', value: 20 },
        { day: 'Пт', value: 15 },
        { day: 'Сб', value: 10 },
        { day: 'Вс', value: 6 },
    ];

    const pieData = [
        { name: 'Активные', value: 120 },
        { name: 'Скрытые', value: 32 },
        { name: 'Удаленные', value: 15 },
    ];

    const barData = [
        { month: 'Янв', count: 50 },
        { month: 'Фев', count: 62 },
        { month: 'Мар', count: 40 },
        { month: 'Апр', count: 80 },
        { month: 'Май', count: 72 },
    ];

    const areaData = [
        { day: 'Пн', value: 4 },
        { day: 'Вт', value: 6 },
        { day: 'Ср', value: 3 },
        { day: 'Чт', value: 5 },
        { day: 'Пт', value: 8 },
        { day: 'Сб', value: 2 },
        { day: 'Вс', value: 1 },
    ];

    return (
        <div className="admin-grid-dashboard">

            {/* KPI карточки */}
            <StatCard title="Пользователи (7д)" value={fakeStats.usersWeek} />
            <StatCard title="Объявления активные" value={fakeStats.adsActive} />
            <StatCard title="Транспортировки активные" value={fakeStats.transportationsActive} />
            <StatCard title="Жалобы новые" value={fakeStats.reportsNew} />

            {/* ГРАФИКИ */}
            <AdminLineChart
                title="Новые объявления за неделю"
                data={lineData}
                xKey="day"
                yKey="value"
            />

            <AdminBarChart
                title="Новые объявления по месяцам"
                data={barData}
                xKey="month"
                yKey="count"
            />

            <AdminPieChart
                title="Статусы объявлений"
                data={pieData}
                dataKey="value"
                nameKey="name"
            />

            <AdminAreaChart
                title="Завершенные транспортировки (7д)"
                data={areaData}
                xKey="day"
                yKey="value"
            />
        </div>
    );
}
