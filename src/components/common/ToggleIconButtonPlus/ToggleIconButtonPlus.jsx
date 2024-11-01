import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import './ToggleIconButtonPlus.css';

const ToggleIconButtonPlus = ({
    onToggle,
    initialAdded = false,
    isColored = true,
}) => {
    const [isAdded, setIsAdded] = useState(initialAdded);

    const [showTooltip, setShowTooltip] = useState(false);

    // Обработка задержки при наведении
    const handleMouseEnter = () => {
        setTimeout(() => {
            setShowTooltip(true);
        }, 500); // Задержка в 0.5 секунды
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    const handleClick = () => {
        setIsAdded((prev) => !prev);
        onToggle(!isAdded);
    };

    useEffect(() => {
        setIsAdded(initialAdded);
    }, [initialAdded]);

    return (
        <button
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`toggle-icon-button ${isAdded ? 'added' : 'not-added'} ${
                isColored ? '' : 'not-colored-btn'
            }`}
        >
            <div className='toggle-label-container-tip'>
                <FaPlus className='icon' />
                {showTooltip && (
                    <span className='toggle-label-tip'>
                        {isAdded
                            ? 'Удалить из Вариантов'
                            : 'Добавить в Варианты'}
                    </span>
                )}
            </div>
        </button>
    );
};

export default ToggleIconButtonPlus;
