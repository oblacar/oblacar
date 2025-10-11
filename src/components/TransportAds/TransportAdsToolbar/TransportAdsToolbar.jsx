// src/components/TransportAds/TransportAdsToolbar.jsx
import React from 'react';
import SortDropdown from '../../common/SortDropdown/SortDropdown';
import ViewModeToggle from '../../common/ViewModeToggle/ViewModeToggle';
import './TransportAdsToolbar.css';

export default function TransportAdsToolbar({
    mode = 'list',
    onModeChange,
    total = 0,
    className = '',
    sort,
    onSortChange,
    sortOptions = [],
    children, // если нужно — останется справа
}) {
    return (
        <div className={`transport-ads-toolbar ${className}`}>
            <div className="ta-left">
                <div className="ta-left-top">
                    <h3 className="ta-title">Транспортные объявления</h3>
                    <div className="ta-sub">Найдено: {total}</div>
                </div>

                <div className="ta-left-controls">
                    <SortDropdown
                        value={sort}
                        onChange={onSortChange}
                        options={sortOptions}
                    />
                </div>
            </div>

            <div className="ta-right">
                {children}
                <ViewModeToggle mode={mode} onChange={onModeChange} />
            </div>
        </div>
    );
}
