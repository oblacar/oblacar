// src/components/common/ViewModeToggle.jsx
import React from 'react';
import { FaList, FaThLarge } from 'react-icons/fa';

export default function ViewModeToggle({ mode = 'list', onChange }) {
    return (
        <div
            className='viewmode-toggle'
            role='group'
            aria-label='Режим отображения'
        >
            <button
                type='button'
                className={`vm-btn ${mode === 'list' ? 'active' : ''}`}
                onClick={() => onChange?.('list')}
                aria-pressed={mode === 'list'}
                title='Список'
            >
                <FaList />
            </button>
            <button
                type='button'
                className={`vm-btn ${mode === 'grid' ? 'active' : ''}`}
                onClick={() => onChange?.('grid')}
                aria-pressed={mode === 'grid'}
                title='Плитка'
            >
                <FaThLarge />
            </button>
        </div>
    );
}
