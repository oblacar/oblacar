// src/components/common/CitySearch/CitySearch.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { fetchCities } from '../../../services/CityService';
import './CitySearch.css';

function CitySearch({
    value,                // контролируемый режим, если передан
    defaultValue,         // старт для неконтролируемого
    initialValue,         // алиас к defaultValue
    onCitySelected,       // (name: string) => void
    inputClassName,
    placeholder,
    debounceMs = 300,
    ...rest
}) {
    const isControlled = value !== undefined;

    // локальный стейт — только в неконтролируемом
    const [inner, setInner] = useState(defaultValue ?? initialValue ?? '');
    const inputValue = isControlled ? (value ?? '') : inner;

    const [cities, setCities] = useState([]);
    const [open, setOpen] = useState(false);
    const [picked, setPicked] = useState(false);

    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const timerRef = useRef(null);

    // флаг: «мы только что меняли текст сами — сохраняй фокус/каретку»
    const keepFocusRef = useRef(false);

    const searchTerm = useMemo(() => (inputValue || '').trim(), [inputValue]);

    // ДЕБАУНС поиска городов
    useEffect(() => {
        if (picked) return;
        if (timerRef.current) clearTimeout(timerRef.current);

        if (searchTerm.length > 2) {
            timerRef.current = setTimeout(async () => {
                try {
                    const list = await fetchCities(searchTerm);
                    setCities(Array.isArray(list) ? list : []);
                    setOpen((Array.isArray(list) ? list.length : 0) > 0);
                } catch {
                    setCities([]);
                    setOpen(false);
                }
            }, debounceMs);
        } else {
            setCities([]);
            setOpen(false);
        }

        return () => timerRef.current && clearTimeout(timerRef.current);
    }, [searchTerm, picked, debounceMs]);

    // СТАБИЛЬНЫЕ хендлеры
    const notifySelected = useCallback((name) => {
        onCitySelected?.(name);
    }, [onCitySelected]);

    const handleChange = useCallback((e) => {
        const next = e.target.value;
        keepFocusRef.current = true; // набираем — фокус должен остаться
        if (isControlled) {
            notifySelected(next);
        } else {
            setInner(next);
            notifySelected(next);
        }
    }, [isControlled, notifySelected]);

    const handleFocus = useCallback(() => {
        setPicked(false);
    }, []);

    const handleBlur = useCallback((e) => {
        // если уходим на клик по выпадающему — игнорим blur (мы его уже предотвратили onMouseDown в списке)
        // если пользователь реально ушёл (кликнул на другое место/табаут) — не возвращаем фокус
        keepFocusRef.current = false;
    }, []);

    const handleSelectCity = useCallback((name) => {
        if (!isControlled) setInner(name);
        notifySelected(name);
        setPicked(true);
        setOpen(false);
        // вручную вернём фокус, чтобы можно было продолжить правку
        requestAnimationFrame(() => inputRef.current?.focus());
    }, [isControlled, notifySelected]);

    // МЯГКАЯ РЕ-«ФОКУСИРОВКА»: если при наборе фокус пропал из-за ремонта снаружи — вернём его и каретку.
    useEffect(() => {
        if (!keepFocusRef.current) return;
        const el = inputRef.current;
        if (!el) return;

        // если по какой-то причине инпут потерял фокус — восстановим и каретку
        if (document.activeElement !== el) {
            el.focus({ preventScroll: true });
            const pos = String(inputValue).length;
            try { el.setSelectionRange(pos, pos); } catch (_) { }
        }
        // сбрасываем флаг, но оставляем его снова выставляться при следующем onChange
        keepFocusRef.current = false;
    }, [inputValue]);

    return (
        <div className="city-search-container" ref={containerRef} {...rest}>
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                className={`city-search-input ${inputClassName || ''}`}
                autoComplete="off"
            />

            {open && cities.length > 0 && (
                <ul
                    className="city-dropdown"
                    // предотвращает blur инпута при клике по элементу списка
                    onMouseDown={(e) => e.preventDefault()}
                >
                    {cities.map((c, i) => (
                        <li
                            key={`${c?.name || 'city'}-${i}`}
                            className="city-dropdown-item"
                            onClick={() => handleSelectCity(c?.name || '')}
                        >
                            {c?.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default React.memo(CitySearch);
