import React from 'react';
import './CargoListToolbar.css';

import SortDropdown from '../../common/SortDropdown/SortDropdown'

const SORT_OPTIONS = [
    { value: 'priceAsc', label: 'По возрастанию цены' },
    { value: 'priceDesc', label: 'По убыванию цены' },
    { value: 'fromAsc', label: 'По алфавиту (откуда)' },
    { value: 'fromDesc', label: 'В обратном порядке' },
    { value: 'soonest', label: 'Сначала ближайшие' },
    { value: 'latest', label: 'Сначала поздние' },
];

export default function CargoListToolbar({
    sort = 'priceDesc',
    onSortChange,

    rightSlot = null, // сюда можно передать переключатель "список/плитка"
    className = "",

    loadingTypes = [],            // массив опций загрузки (например: ['верхняя','боковая',...])
    loadingKinds = [],            // массив опций способа/условий (например: ['гидроборт','кран','налив',...])
    specialTags = ['опасный', 'хрупкий', 'охлаждение', 'заморозка'],
    value = {                     // текущее значение фильтров
        loadTypes: [],              // выбранные типы загрузки
        loadKinds: [],              // выбранные варианты/способы
        specials: { all: true, set: [] }, // «все» или избранные
    },
    onChangeFilters,
}) {
    const toggleSet = (key, val) => {
        const next = new Set(value[key]);
        if (next.has(val)) next.delete(val);
        else next.add(val);
        onChangeFilters({ ...value, [key]: Array.from(next) });
    };

    const toggleSpecial = (val) => {
        if (val === 'all') {
            onChangeFilters({ ...value, specials: { all: !value.specials.all, set: value.specials.set } });
        } else {
            const set = new Set(value.specials.set);
            set.has(val) ? set.delete(val) : set.add(val);
            onChangeFilters({ ...value, specials: { ...value.specials, set: Array.from(set) } });
        }
    };

    return (
        <div className="cargo-toolbar">
            {/* Сортировка */}
            <div className={`cargo-toolbar ${className}`}>
                <SortDropdown
                    options={SORT_OPTIONS}
                    value={sort}
                    onChange={onSortChange}
                />
                <div style={{ marginLeft: "auto" }}>{rightSlot}</div>
            </div>

            {/* Типы загрузки */}
            <details className="ctb-dd">
                <summary className="ctb-dd__summary">Тип загрузки</summary>
                <div className="ctb-dd__panel">
                    {loadingTypes.map(opt => (
                        <label key={opt} className="ctb-check">
                            <input
                                type="checkbox"
                                checked={value.loadTypes.includes(opt)}
                                onChange={() => toggleSet('loadTypes', opt)}
                            />
                            <span>{opt}</span>
                        </label>
                    ))}
                </div>
            </details>

            {/* Варианты/способы */}
            <details className="ctb-dd">
                <summary className="ctb-dd__summary">Варианты загрузки</summary>
                <div className="ctb-dd__panel">
                    {loadingKinds.map(opt => (
                        <label key={opt} className="ctb-check">
                            <input
                                type="checkbox"
                                checked={value.loadKinds.includes(opt)}
                                onChange={() => toggleSet('loadKinds', opt)}
                            />
                            <span>{opt}</span>
                        </label>
                    ))}
                </div>
            </details>

            {/* Особые типы груза */}
            <details className="ctb-dd">
                <summary className="ctb-dd__summary">Особые грузы</summary>
                <div className="ctb-dd__panel">
                    <label className="ctb-check">
                        <input
                            type="checkbox"
                            checked={value.specials.all}
                            onChange={() => toggleSpecial('all')}
                        />
                        <span>Все</span>
                    </label>
                    {specialTags.map(opt => (
                        <label key={opt} className="ctb-check">
                            <input
                                type="checkbox"
                                checked={value.specials.set.includes(opt)}
                                onChange={() => toggleSpecial(opt)}
                            />
                            <span>{opt}</span>
                        </label>
                    ))}
                </div>
            </details>
        </div>
    );
}
