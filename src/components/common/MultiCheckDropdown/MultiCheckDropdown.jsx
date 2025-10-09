// src/components/common/MultiCheckDropdown/MultiCheckDropdown.jsx
import React from 'react';
import './MultiCheckDropdown.css';

export default function MultiCheckDropdown({
    label = 'Фильтр',
    options = [],          // [{value, label}]
    selected = [],         // массив value
    onChange,              // (newArray) => void
    className = '',
    showCount = true,
}) {
    const rootRef = React.useRef(null);
    const [open, setOpen] = React.useState(false);
    const [temp, setTemp] = React.useState(selected);
    const closeTimer = React.useRef(null);

    // держим локальное состояние в синхроне с внешним
    React.useEffect(() => setTemp(selected), [selected]);

    // открытие/закрытие по hover на общей обёртке
    const openNow = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setOpen(true);
    };
    const scheduleClose = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => setOpen(false), 120);
    };

    // закрытие по клику вне
    React.useEffect(() => {
        const onDocDown = (e) => {
            if (!rootRef.current) return;
            if (rootRef.current.contains(e.target)) return;
            setOpen(false);
        };
        document.addEventListener('mousedown', onDocDown);
        return () => document.removeEventListener('mousedown', onDocDown);
    }, []);

    // клик по триггеру (альтернатива hover’у — удобно на тач)
    const onTriggerClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setOpen((o) => !o);
    };

    // работа с чекбоксами (локально)
    const toggle = (val) => {
        setTemp((prev) => {
            const s = new Set(prev);
            s.has(val) ? s.delete(val) : s.add(val);
            return Array.from(s);
        });
    };

    const apply = () => {
        onChange?.(temp);
        setOpen(false);
    };
    const reset = () => {
        setTemp([]);
        onChange?.([]);
        setOpen(false);
    };

    const hasSelection = selected.length > 0;
    const triggerText = showCount && hasSelection
        ? `${label} · ${selected.length}`
        : label;

    return (
        <div
            ref={rootRef}
            className={`mcd ${className}`}
            onMouseEnter={openNow}
            onMouseLeave={scheduleClose}
        >
            <button
                type="button"
                className={`mcd__trigger ${hasSelection ? 'mcd__trigger--active' : ''}`}
                onClick={onTriggerClick}
            >
                <span className="mcd__trigger-text">{triggerText}</span>
                <span className={`mcd__caret ${open ? 'is-open' : ''}`} aria-hidden>▾</span>
            </button>

            {open && (
                <div
                    className="mcd__panel"
                    onMouseDown={(e) => e.stopPropagation()} // чтобы клик внутри не закрыл по "outside"
                >
                    <div className="mcd__list">
                        {options.map((opt) => (
                            <label key={opt.value} className="mcd__check">
                                <input
                                    type="checkbox"
                                    checked={temp.includes(opt.value)}
                                    onChange={() => toggle(opt.value)}
                                />
                                <span>{opt.label}</span>
                            </label>
                        ))}
                    </div>

                    <div className="mcd__actions">
                        <button className="mcd__btn mcd__btn--ghost" type="button" onClick={reset}>
                            Сбросить
                        </button>
                        <button className="mcd__btn mcd__btn--primary" type="button" onClick={apply}>
                            Готово
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
