import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import './ToggleIconButtonPlus.css';

const ToggleIconButtonPlus = ({ onToggle, initialAdded = false }) => {
    const [isAdded, setIsAdded] = useState(initialAdded);

    const handleClick = () => {
        setIsAdded((prev) => !prev);
        onToggle(!isAdded);
    };

    return (
        <button
            onClick={handleClick}
            className={`toggle-icon-button ${isAdded ? 'added' : 'not-added'}`}
        >
            <FaPlus className='icon' />
            {/* <span className='toggle-label'>
                {isAdded ? 'Удалить из вариантов' : 'Добавить в варианты'}
            </span> */}
        </button>
    );
};

export default ToggleIconButtonPlus;
