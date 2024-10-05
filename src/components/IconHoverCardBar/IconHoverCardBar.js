import { Link } from 'react-router-dom';
import React, { useState, useRef, useEffect } from 'react';

import { HoverUserCard } from './hoverCard/HoverUserCard';
import { HoverCartCard } from './hoverCard/HoverCartCard';
import { HoverMessageCard } from './hoverCard/HoverMessageCard';
import { HoverOrdersCard } from './hoverCard/HoverOrdersCard';
import styles from './IconHoverCardBar.module.css';

//импорт иконок из Font Awesome коллекции в react-icons. При необходимости можно выбрать другие коллекции и иконки
import {
    FaUser,
    FaEnvelope,
    FaShippingFast,
    FaShoppingCart,
} from 'react-icons/fa';

function setCoordinates(iconUserRef, setIconCoordinates) {
    const iconElement = iconUserRef.current;
    if (iconElement) {
        const rect = iconElement.getBoundingClientRect();

        setIconCoordinates(() => {
            return {
                top: rect.top,
                left: rect.left,
                bottom: rect.bottom,
                right: rect.right,
            };
        });
    }
}

const zero = {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
};

function IconDropdownMenuBar() {
    const [isUserHovered, setIsUserHovered] = useState(false);
    const [isOrdersHovered, setIsOrdersHovered] = useState(false);
    const [isMessageHovered, setIsMessageHovered] = useState(false);
    const [isCartHovered, setIsCartHovered] = useState(false);

    const [iconUserCoordinates, setIconUserCoordinates] = useState(zero);
    const [iconOrdersCoordinates, setIconOrdersCoordinates] = useState(zero);
    const [iconMessageCoordinates, setIconMessageCoordinates] = useState(zero);
    const [iconCartCoordinates, setIconCartCoordinates] = useState(zero);

    const iconUserRef = useRef(null);
    const iconOrdersRef = useRef(null);
    const iconMessageRef = useRef(null);
    const iconCartRef = useRef(null);

    const [windowWidth, setWindowWidth] = useState(
        document.documentElement.clientWidth
    );

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(document.documentElement.clientWidth);

            setCoordinates(iconUserRef, setIconUserCoordinates);
            setCoordinates(iconOrdersRef, setIconOrdersCoordinates);
            setCoordinates(iconMessageRef, setIconMessageCoordinates);
            setCoordinates(iconCartRef, setIconCartCoordinates);
        };

        window.addEventListener('resize', handleResize);

        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleMouseEnter = (icon_type) => {
        switch (icon_type) {
            case 'USER':
                setIsUserHovered(() => true);
                break;
            case 'MESSAGE':
                setIsMessageHovered(() => true);
                break;
            case 'ORDERS':
                setIsOrdersHovered(() => true);
                break;
            case 'CART':
                setIsCartHovered(() => true);
                break;
            default:
                return null;
        }
    };

    const handleMouseLeave = (icon_type) => {
        switch (icon_type) {
            case 'USER':
                setIsUserHovered(() => false);
                break;
            case 'MESSAGE':
                setIsMessageHovered(() => false);
                break;
            case 'ORDERS':
                setIsOrdersHovered(() => false);
                break;
            case 'CART':
                setIsCartHovered(() => false);
                break;
            default:
                return null;
        }
    };
    return (
        <>
            <div className={styles.iconsArea}>
                <div className={styles.iconHoverArea}>
                    <div
                        className={styles.headerMarketIcon}
                        ref={iconUserRef}
                        onMouseEnter={() => handleMouseEnter('USER')}
                        onMouseLeave={() => handleMouseLeave('USER')}
                    >
                        <div className={styles.iconContainer}>
                            <FaUser className={styles.iconHover} />
                            <span className={styles.iconLabel}>Профиль</span>
                        </div>
                    </div>
                    <HoverUserCard
                        isHoveredIcon={isUserHovered}
                        iconCoordinates={iconUserCoordinates}
                        windowWidth={windowWidth}
                    />
                </div>

                <div className={styles.iconHoverArea}>
                    <div
                        className={styles.headerMarketIcon}
                        ref={iconMessageRef}
                        onMouseEnter={() => handleMouseEnter('MESSAGE')}
                        onMouseLeave={() => handleMouseLeave('MESSAGE')}
                    >
                        <div className={styles.iconContainer}>
                            <FaEnvelope className={styles.iconHover} />
                            <span className={styles.iconLabel}>Сообщение</span>
                        </div>
                    </div>
                    <HoverMessageCard
                        isHoveredIcon={isMessageHovered}
                        iconCoordinates={iconMessageCoordinates}
                        windowWidth={windowWidth}
                    />
                </div>

                <div className={styles.iconHoverArea}>
                    <div
                        className={styles.headerMarketIcon}
                        ref={iconOrdersRef}
                        onMouseEnter={() => handleMouseEnter('ORDERS')}
                        onMouseLeave={() => handleMouseLeave('ORDERS')}
                    >
                        <div className={styles.iconContainer}>
                            <FaShippingFast className={styles.iconHover} />
                            <span className={styles.iconLabel}>Перевозки</span>
                        </div>
                    </div>
                    <HoverOrdersCard
                        isHoveredIcon={isOrdersHovered}
                        iconCoordinates={iconOrdersCoordinates}
                        windowWidth={windowWidth}
                    />
                </div>

                <div className={styles.iconHoverArea}>
                    <div
                        className={styles.headerMarketIcon}
                        ref={iconCartRef}
                        onMouseEnter={() => handleMouseEnter('CART')}
                        onMouseLeave={() => handleMouseLeave('CART')}
                    >
                        <div className={styles.iconContainer}>
                            <FaShoppingCart className={styles.iconHover} />
                            <span className={styles.iconLabel}>Заявки</span>
                        </div>
                    </div>
                    <HoverCartCard
                        isHoveredIcon={isCartHovered}
                        iconCoordinates={iconCartCoordinates}
                        windowWidth={windowWidth}
                    />
                </div>
            </div>
        </>
    );
}

export { IconDropdownMenuBar };
