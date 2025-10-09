// src/components/CargoAds/toolbar/CargoListToolbar.jsx
import React from 'react';
import './CargoListToolbar.css';

import SortDropdown from '../../common/SortDropdown/SortDropdown';
import MultiCheckDropdown from '../../common/MultiCheckDropdown/MultiCheckDropdown';

import {
    PACKAGING_OPTIONS_UI,
    CARGO_TYPE_OPTIONS,
    LOADING_KIND_OPTIONS,
} from '../utils/options';

const SORT_OPTIONS = [
    { value: 'price_asc', label: 'По возрастанию цены' },
    { value: 'price_desc', label: 'По убыванию цены' },
    { value: 'alpha_asc', label: 'По алфавиту A–Я' },
    { value: 'alpha_desc', label: 'По алфавиту Я–A' },
    { value: 'date_new', label: 'Сначала новые' },
    { value: 'date_old', label: 'Сначала старые' },
];

export default function CargoListToolbar({
    className = '',
    rightSlot = null,

    // сортировка
    sort = 'price_desc',
    onSortChange = () => { },

    // внешнее состояние фильтров (необязательно)
    filters: externalFilters = null, // { cargoTypes:[], loadKinds:[], packaging:[] }
    onFiltersChange = () => { },
}) {
    // локальный стейт фильтров с синхронизацией извне
    const [filters, setFilters] = React.useState(
        externalFilters ?? { cargoTypes: [], loadKinds: [], packaging: [] }
    );

    React.useEffect(() => {
        if (externalFilters) setFilters(externalFilters);
    }, [externalFilters]);

    // единый апдейтер + уведомление родителя
    const update = (key, arr) => {
        setFilters(prev => {
            const next = { ...prev, [key]: arr };
            onFiltersChange(next);
            return next;
        });
    };

    return (
        <div className={`cargo-toolbar ${className}`}>
            <div className="ctb-bar">
                <SortDropdown
                    value={sort}
                    onChange={onSortChange}
                    options={SORT_OPTIONS}
                />

                <MultiCheckDropdown
                    label="Тип груза"
                    options={CARGO_TYPE_OPTIONS}
                    selected={filters.cargoTypes}
                    onChange={(arr) => update('cargoTypes', arr)}
                />

                <MultiCheckDropdown
                    label="Тип загрузки"
                    options={LOADING_KIND_OPTIONS}
                    selected={filters.loadKinds}
                    onChange={(arr) => update('loadKinds', arr)}
                />

                <MultiCheckDropdown
                    label="Упаковка"
                    options={PACKAGING_OPTIONS_UI}
                    selected={filters.packaging}
                    onChange={(arr) => update('packaging', arr)}
                />

                {rightSlot}
            </div>
        </div>
    );
}
