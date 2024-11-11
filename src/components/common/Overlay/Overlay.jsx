import React from 'react';
import './Overlay.css';

const Overlay = ({ onClose, children }) => {
    return (
        <div
            className='overlay'
            onClick={onClose}
        >
            <div
                className='overlay-content'
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};

export default Overlay;
