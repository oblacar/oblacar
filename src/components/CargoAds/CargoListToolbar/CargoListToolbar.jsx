import React from 'react';
import './CargoListToolbar.css';

const SORT_OPTIONS = [
    { id: 'priceAsc', label: 'Цена ↑' },
    { id: 'priceDesc', label: 'Цена ↓' },
    { id: 'fromAsc', label: 'Откуда A→Я' },
    { id: 'fromDesc', label: 'Откуда Я→A' },
    { id: 'soonest', label: 'Ближайшая загрузка' },
    { id: 'latest', label: 'Поздняя загрузка' },
];

export default function CargoListToolbar({
    sort = 'priceDesc',
    onChangeSort,
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
            <label className="ctb-block">
                <span className="ctb-label">Сортировка</span>
                <select
                    className="ctb-select"
                    value={sort}
                    onChange={(e) => onChangeSort?.(e.target.value)}
                >
                    {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
            </label>

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
