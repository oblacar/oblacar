import React from 'react';
import { FaList, FaThLarge } from 'react-icons/fa';
import { TiThLargeOutline, TiThMenuOutline } from "react-icons/ti";


import './ViewModeToggle.css'

export default function ViewModeToggle({ mode = 'list', onChange, className = '' }) {
    return (
        <div
            className={`viewmode-toggle ${className}`}
            role="group"
            aria-label="Режим отображения"
        >
            <button
                type="button"
                className={`vm-btn ${mode === 'list' ? 'active' : ''}`}
                onClick={() => onChange?.('list')}
                aria-pressed={mode === 'list'}
                aria-label="Список"
                title="Список"
            >
                {/* <FaList /> */}
                <TiThMenuOutline />
            </button>

            <button
                type="button"
                className={`vm-btn ${mode === 'grid' ? 'active' : ''}`}
                onClick={() => onChange?.('grid')}
                aria-pressed={mode === 'grid'}
                aria-label="Плитка"
                title="Плитка"
            >
                {/* <FaThLarge /> */}
                <TiThLargeOutline />
            </button>
        </div>
    );
}
