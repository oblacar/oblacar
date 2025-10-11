import React from 'react';
import SortDropdown from '../../common/SortDropdown/SortDropdown';
import ViewModeToggle from '../../common/ViewModeToggle/ViewModeToggle';
import MultiCheckDropdown from '../../common/MultiCheckDropdown/MultiCheckDropdown';
import './TransportAdsToolbar.css';

export default function TransportAdsToolbar({
    mode = 'list',
    onModeChange,
    total = 0,
    className = '',

    // сортировка
    sort,
    onSortChange,
    sortOptions = [],

    // фильтр: тип машины
    truckTypeOptions = [],
    selectedTruckTypes = [],
    onTruckTypesChange,

    // фильтр: тип загрузки
    loadingTypeOptions = [],
    selectedLoadingTypes = [],
    onLoadingTypesChange,
}) {
    return (
        <div className={`transport-ads-toolbar ${className}`}>
            <div className="ta-left">
                {/* <div className="ta-left-top">
                    <h3 className="ta-title">Транспортные объявления</h3>
                    <div className="ta-sub">Найдено: {total}</div>
                </div> */}

                <div className="ta-left-controls">
                    <SortDropdown value={sort} onChange={onSortChange} options={sortOptions} />

                    <MultiCheckDropdown
                        label="Тип машины"
                        options={truckTypeOptions}
                        selected={selectedTruckTypes}
                        onChange={onTruckTypesChange}
                    />

                    <MultiCheckDropdown
                        label="Тип загрузки"
                        options={loadingTypeOptions}
                        selected={selectedLoadingTypes}
                        onChange={onLoadingTypesChange}
                    />
                </div>
            </div>

            <div className="ta-right">
                <ViewModeToggle mode={mode} onChange={onModeChange} />
            </div>
        </div>
    );
}
