// src/components/CargoAds/toolbar/CargoListToolbar.jsx
import React from 'react';
import './CargoListToolbar.css';

import SortDropdown from '../../common/SortDropdown/SortDropdown';
import MultiCheckDropdown from '../../common/MultiCheckDropdown/MultiCheckDropdown';

import {
    PACKAGING_OPTIONS_UI,
    CARGO_TYPE_OPTIONS,
    LOADING_KIND_OPTIONS,
    SORT_OPTIONS,
} from '../utils/options';

export default function CargoListToolbar({
    className = '',
    rightSlot = null,
    sort = 'price_desc',
    onSortChange = () => {},
    // важно: дальше фильтры ожидаются с ключом loadTypes
    filters: externalFilters = null, // { cargoTypes:[], loadTypes:[], packaging:[] }
    onFiltersChange = () => {},
}) {
    // локальный стейт с корректными ключами
    const [filters, setFilters] = React.useState(
        externalFilters ?? { cargoTypes: [], loadTypes: [], packaging: [] }
    );

    React.useEffect(() => {
        if (externalFilters) setFilters(externalFilters);
    }, [externalFilters]);

    const update = (key, arr) => {
        setFilters((prev) => {
            const next = { ...prev, [key]: arr };
            onFiltersChange(next);
            return next;
        });
    };

    return (
        <div className={`cargo-toolbar ${className}`}>
            <div className='ctb-bar'>
                {/* левая группа */}
                <div className='ctb-left'>
                    <SortDropdown
                        value={sort}
                        onChange={onSortChange}
                        options={SORT_OPTIONS}
                    />

                    <MultiCheckDropdown
                        label='Тип груза'
                        options={CARGO_TYPE_OPTIONS}
                        selected={filters.cargoTypes}
                        onChange={(arr) => update('cargoTypes', arr)}
                    />

                    {/* ВАЖНО: используем loadTypes, а не loadKinds */}
                    <MultiCheckDropdown
                        label='Тип загрузки'
                        options={LOADING_KIND_OPTIONS}
                        selected={filters.loadKinds}
                        onChange={(arr) => update('loadKinds', arr)}
                    />

                    <MultiCheckDropdown
                        label='Упаковка'
                        options={PACKAGING_OPTIONS_UI}
                        selected={filters.packaging}
                        onChange={(arr) => update('packaging', arr)}
                    />
                </div>

                {/* растяжка */}
                <div className='ctb-spacer' />

                {/* правый слот */}
                {rightSlot && <div className='ctb-right'>{rightSlot}</div>}
            </div>
        </div>
    );
}
