// src/components/common/CitySearch/CitySearch.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchCities } from '../../../services/CityService';
import './CitySearch.css';

function CitySearch({
    value,                // контролируемый режим, если передан
    defaultValue,         // стартовое значение для НЕконтролируемого
    initialValue,         // алиас к defaultValue
    onCitySelected,       // (name: string) => void
    inputClassName,
    placeholder,
    debounceMs = 300,
    ...rest
}) {
    const isControlled = value !== undefined;
    const [inner, setInner] = useState(defaultValue ?? initialValue ?? '');
    const inputValue = isControlled ? (value ?? '') : inner;

    const [cities, setCities] = useState([]);
    const [open, setOpen] = useState(false);
    const [picked, setPicked] = useState(false); // выбран вариант из списка

    const inputRef = useRef(null);
    const timerRef = useRef(null);

    // то, чем реально ищем
    const searchTerm = useMemo(() => (inputValue || '').trim(), [inputValue]);

    // дебаунс-автокомплит
    useEffect(() => {
        if (picked) {
            // если недавно выбрали город — не показываем подсказки до нового ввода
            if (timerRef.current) clearTimeout(timerRef.current);
            setOpen(false);
            return;
        }

        if (timerRef.current) clearTimeout(timerRef.current);

        if (searchTerm.length > 2) {
            timerRef.current = setTimeout(async () => {
                try {
                    const list = await fetchCities(searchTerm);
                    const arr = Array.isArray(list) ? list : [];
                    // если пользователь уже успел выбрать этот же город — не открываем
                    if (picked || (arr.length === 1 && arr[0]?.name === searchTerm)) {
                        setCities([]);
                        setOpen(false);
                        return;
                    }
                    setCities(arr);
                    setOpen(arr.length > 0);
                } catch {
                    setCities([]);
                    setOpen(false);
                }
            }, debounceMs);
        } else {
            setCities([]);
            setOpen(false);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [searchTerm, picked, debounceMs]);

    const handleChange = (e) => {
        const next = e.target.value;
        // новый ввод — разрешаем автокомплит снова
        setPicked(false);

        if (isControlled) {
            onCitySelected?.(next);
        } else {
            setInner(next);
            onCitySelected?.(next);
        }
    };

    // ВАЖНО: не трогаем picked на фокусе — это и вызывало повторное открытие списка
    const handleFocus = () => {
        // ничего
    };

    const handleBlur = () => {
        // лёгкое закрытие по блюру
        // задержка нужна, чтобы click по <li> успел отработать (мы всё равно делаем preventDefault ниже)
        setTimeout(() => setOpen(false), 100);
    };

    const handleSelectCity = (name) => {
        // если кликнули по тому же значению — просто закрыть меню
        if ((inputValue || '') === (name || '')) {
            setOpen(false);
            setPicked(true);
            return;
        }

        if (!isControlled) setInner(name);
        onCitySelected?.(name);
        setPicked(true);
        setOpen(false);

        // НЕ возвращаем фокус в инпут — иначе сработает onFocus и подсказки откроются снова
        // requestAnimationFrame(() => inputRef.current?.focus());
    };

    return (
        <div className="city-search-container" {...rest}>
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
                    // предотвращаем блюр на mousedown, чтобы click по li точно сработал один раз
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

export default CitySearch;
