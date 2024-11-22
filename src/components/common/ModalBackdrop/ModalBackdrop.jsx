import React from 'react';
import styles from './ModalBackdrop.module.css';

const ModalBackdrop = ({ children, onClose }) => {
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className={styles.backdrop}
            onClick={handleBackdropClick}
        >
            <div className={styles.modalContent}>{children}</div>
        </div>
    );
};


export default ModalBackdrop;
