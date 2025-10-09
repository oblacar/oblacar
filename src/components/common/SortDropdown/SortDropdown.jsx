// src/components/common/SortDropdown/SortDropdown.jsx
import React from "react";
import { LuChevronsUpDown } from "react-icons/lu";
import "./SortDropdown.css";

export default function SortDropdown({
    options,
    value,
    onChange,
    className = "",
    label = null, // необязательная подпись слева от значения
}) {
    const [open, setOpen] = React.useState(false);

    const selected = options.find(o => o.value === value) || options[0];

    // Закрываем по клику вне
    const wrapRef = React.useRef(null);
    React.useEffect(() => {
        const onDocClick = (e) => {
            if (!wrapRef.current) return;
            if (!wrapRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    return (
        <div
            ref={wrapRef}
            className={`sort-dd ${className}`}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <button
                type="button"
                className="sort-dd__btn"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen(o => !o)}
            >
                <LuChevronsUpDown className="sort-dd__icon" />
                <span className="sort-dd__text">
                    {label ? <span className="sort-dd__label">{label}: </span> : null}
                    {selected?.label}
                </span>
                <span className={`sort-dd__caret ${open ? "is-open" : ""}`} />
            </button>

            <div className={`sort-dd__menu ${open ? "is-open" : ""}`} role="listbox">
                {options.map(opt => {
                    const checked = opt.value === value;
                    return (
                        <label key={opt.value} className="sort-dd__item">
                            <input
                                type="radio"
                                name="sort-dd"
                                checked={checked}
                                onChange={() => {
                                    onChange?.(opt.value);
                                    // не закрываем мгновенно при hover-режиме — пусть меню закроется, когда мышь уйдёт
                                }}
                            />
                            <span className="sort-dd__radio" aria-hidden />
                            <span className="sort-dd__labeltext">{opt.label}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}
