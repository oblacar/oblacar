// src/components/TransportAds/TransportAdsToolbar.jsx
import React from 'react';
import ViewModeToggle from '../../common/ViewModeToggle/ViewModeToggle';
import './TransportAdsToolbar.css';

export default function TransportAdsToolbar({
    mode = 'list',
    onModeChange,
    total = 0,
    className = '',
    children, // сюда позже можно добавить фильтры/сортировки
}) {
    return (
        <div className={`transport-ads-toolbar ${className}`}>
            <div className="ta-left">
                <h3 className="ta-title">Транспортные объявления</h3>
                <div className="ta-sub">Найдено: {total}</div>
            </div>

            <div className="ta-right">
                {/* место под будущие фильтры/сортировку */}
                {children}
                <ViewModeToggle mode={mode} onChange={onModeChange} />
            </div>
        </div>
    );
}
