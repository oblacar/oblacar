// src/components/ReviewTypeToggle/ReviewTypeToggle.jsx
import React from 'react';
import './ReviewTypeToggle.css';

/**
 * props:
 * - value: 'transport' | 'cargo'
 * - onChange: (next: 'transport' | 'cargo') => void
 * - className?: string
 */
const ReviewTypeToggle = ({ value = 'transport', onChange, className = '' }) => {
    const isTransport = value === 'transport';

    const handleClick = (next) => () => {
        if (next !== value && typeof onChange === 'function') onChange(next);
    };

    return (
        <div className={`rtt ${className}`}>
            <div className="rtt-track" role="tablist" aria-label="Тип выбранных объявлений">
                {/* Бегунок */}
                <div
                    className={`rtt-thumb ${isTransport ? 'left' : 'right'}`}
                    aria-hidden="true"
                />

                <button
                    type="button"
                    role="tab"
                    aria-selected={isTransport}
                    className={`rtt-option ${isTransport ? 'active' : ''}`}
                    onClick={handleClick('transport')}
                >
                    Транспорт
                </button>

                <button
                    type="button"
                    role="tab"
                    aria-selected={!isTransport}
                    className={`rtt-option ${!isTransport ? 'active' : ''}`}
                    onClick={handleClick('cargo')}
                >
                    Груз
                </button>
            </div>
        </div>
    );
};

export default ReviewTypeToggle;
