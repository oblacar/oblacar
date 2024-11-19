import React, { useState } from 'react';
import styles from './AdEditMenu.module.css';
import { FaPen, FaTrash, FaSave, FaArrowRight } from 'react-icons/fa';

const AdEditMenu = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const menuItems = [
        { icon: <FaPen />, label: 'Edit' },
        { icon: <FaSave />, label: 'Save' },
        { icon: <FaArrowRight />, label: 'Other' },
        { icon: <FaTrash />, label: 'Delete' },
        // Add more items as needed
    ];

    const handleIconClick = (index) => {
        setActiveIndex(index === activeIndex ? null : index);
    };

    return (
        <div className={styles.menuContainer}>
            {menuItems.map((item, index) => (
                <div
                    key={index}
                    className={styles.menuItem}
                    onClick={() => handleIconClick(index)}
                >
                    <div className={styles.icon}>{item.icon}</div>
                    {activeIndex === index && (
                        <div className={styles.expandedField}>
                            <span>{item.label}</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default AdEditMenu;
