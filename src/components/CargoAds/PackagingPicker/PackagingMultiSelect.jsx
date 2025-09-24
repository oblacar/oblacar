// src/components/common/PackagingMultiSelect/PackagingMultiSelect.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import './PackagingMultiSelect.css';

/**
 * props:
 * - options: [{key, label}]
 * - value: string[] (массив выбранных key)
 * - onChange: (next: string[]) => void
 * - placeholder?: string
 * - maxTags?: number  // сколько тегов показывать, остальное "+N"
 */
const PackagingMultiSelect = ({
    options = [],
    value = [],
    onChange,
    placeholder = 'Выбрать упаковку',
    maxTags = 3,
}) => {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState('');
    const rootRef = useRef(null);
    const inputRef = useRef(null);

    // закрытие по клику вне
    useEffect(() => {
        const onDocClick = (e) => {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    // фокус на поиск при открытии
    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 0);
    }, [open]);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return options;
        return options.filter((o) => o.label.toLowerCase().includes(s));
    }, [q, options]);

    const toggle = (key) => {
        const has = value.includes(key);
        const next = has ? value.filter((k) => k !== key) : [...value, key];
        onChange?.(next);
    };

    const clearAll = () => onChange?.([]);

    // отображение выбранного (теги)
    const selected = options.filter((o) => value.includes(o.key));
    const visibleTags = selected.slice(0, maxTags);
    const hiddenCount = Math.max(selected.length - visibleTags.length, 0);

    return (
        <div
            className={`pkgms ${open ? 'pkgms--open' : ''}`}
            ref={rootRef}
        >
            <button
                type="button"
                className="pkgms__control"   // ← УБРАЛ create-transport-ad-input
                onClick={() => setOpen(v => !v)}
                aria-expanded={open}
            >
                {selected.length === 0 ? (
                    <span className="pkgms__placeholder">{placeholder}</span>
                ) : (
                    <div className="pkgms__tags">
                        {visibleTags.map(o => (
                            <span key={o.key} className="pkgms__tag">{o.label}</span>
                        ))}
                        {hiddenCount > 0 && <span className="pkgms__tag pkgms__tag--more">+{hiddenCount}</span>}
                    </div>
                )}
                <span className="pkgms__chev" aria-hidden>▾</span>
            </button>

            {open && (
                <div className="pkgms__menu" role="listbox" aria-multiselectable="true">
                    <div className="pkgms__search">
                        <input
                            ref={inputRef}
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Поиск…"
                            className="pkgms__search-input"   // ← без внешних классов
                        />
                        {value.length > 0 && (
                            <button type="button" className="pkgms__clear" onClick={clearAll}>
                                Сбросить
                            </button>
                        )}
                    </div>

                    <div className='pkgms__list'>
                        {filtered.length === 0 ? (
                            <div className='pkgms__empty'>
                                Ничего не найдено
                            </div>
                        ) : (
                            filtered.map((o) => {
                                const checked = value.includes(o.key);
                                return (
                                    <label
                                        key={o.key}
                                        className='pkgms__option'
                                    >
                                        <input
                                            className='create-transport-ad-checkbox'
                                            type='checkbox'
                                            checked={checked}
                                            onChange={() => toggle(o.key)}
                                        />
                                        <span className='pkgms__option-label'>
                                            {o.label}
                                        </span>
                                    </label>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PackagingMultiSelect;
