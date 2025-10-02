// src/hooks/SearchModeContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// 'transport' | 'cargo'
const DEFAULT_MODE = 'transport';
// где хранить между перезагрузками: 'session' или 'local' или null (не хранить)
const PERSISTENCE = 'session';
const STORAGE_KEY = 'oblacar.searchMode';

const SearchModeContext = createContext(null);

export const SearchModeProvider = ({ children }) => {
    const [mode, setMode] = useState(DEFAULT_MODE); // 'transport' | 'cargo'

    // начальная загрузка из хранилища
    useEffect(() => {
        try {
            if (PERSISTENCE === 'session') {
                const v = sessionStorage.getItem(STORAGE_KEY);
                if (v === 'transport' || v === 'cargo') setMode(v);
            } else if (PERSISTENCE === 'local') {
                const v = localStorage.getItem(STORAGE_KEY);
                if (v === 'transport' || v === 'cargo') setMode(v);
            }
        } catch { }
    }, []);

    // запись в хранилище
    useEffect(() => {
        try {
            if (PERSISTENCE === 'session') {
                sessionStorage.setItem(STORAGE_KEY, mode);
            } else if (PERSISTENCE === 'local') {
                localStorage.setItem(STORAGE_KEY, mode);
            }
        } catch { }
    }, [mode]);

    const isTransport = mode === 'transport';
    const isCargo = mode === 'cargo';

    const toggle = () => setMode((m) => (m === 'transport' ? 'cargo' : 'transport'));

    const value = useMemo(
        () => ({ mode, setMode, toggle, isTransport, isCargo }),
        [mode]
    );

    return (
        <SearchModeContext.Provider value={value}>
            {children}
        </SearchModeContext.Provider>
    );
};

export const useSearchMode = () => useContext(SearchModeContext);

export default SearchModeContext;
