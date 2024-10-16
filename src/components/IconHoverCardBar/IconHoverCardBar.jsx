import React, { useState, useRef, useEffect, useContext } from 'react';

import AuthContext from '../../hooks/Authorization/AuthContext';

import IconHoverCard from './IconHoverCard';

import { HoverUserCard } from './hoverCard/HoverUserCard';
import { HoverMessageCard } from './hoverCard/HoverMessageCard';
import { HoverDeliveryCard } from './hoverCard/HoverDeliveryCard';
import { HoverOrdersCard } from './hoverCard/HoverOrdersCard';
import styles from './IconHoverCardBar.module.css';

//импорт иконок из Font Awesome коллекции в react-icons. При необходимости можно выбрать другие коллекции и иконки
import {
    FaUser,
    FaEnvelope,
    FaShippingFast,
    FaClipboardList,
    //
    FaEdit,
    FaPen,
    FaClipboard,
    FaFileAlt,
    FaStickyNote,
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
    const { isAuthenticated } = useContext(AuthContext);

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

    return (
        <>
            <div className={styles.iconsArea}>
                <IconHoverCard
                    type='Создать'
                    iconRef={iconOrdersRef}
                    IconComponent={FaPen}
                    HoverCardComponent={HoverOrdersCard}
                    iconCoordinates={iconOrdersCoordinates}
                    windowWidth={windowWidth}
                />
                <IconHoverCard
                    type='Профиль'
                    iconRef={iconUserRef}
                    IconComponent={FaUser}
                    HoverCardComponent={HoverUserCard}
                    iconCoordinates={iconUserCoordinates}
                    windowWidth={windowWidth}
                    LinkTo={isAuthenticated ? '/user-profile' : '/login'}
                />
                <IconHoverCard
                    type='Сообщения'
                    iconRef={iconMessageRef}
                    IconComponent={FaEnvelope}
                    HoverCardComponent={HoverMessageCard}
                    iconCoordinates={iconMessageCoordinates}
                    windowWidth={windowWidth}
                />

                <IconHoverCard
                    type='Доставки'
                    iconRef={iconCartRef}
                    IconComponent={FaShippingFast}
                    HoverCardComponent={HoverDeliveryCard}
                    iconCoordinates={iconCartCoordinates}
                    windowWidth={windowWidth}
                />

                <IconHoverCard
                    type='Варианты'
                    iconRef={iconOrdersRef}
                    IconComponent={FaClipboardList}
                    HoverCardComponent={HoverOrdersCard}
                    iconCoordinates={iconOrdersCoordinates}
                    windowWidth={windowWidth}
                />
            </div>
        </>
    );
}

export { IconDropdownMenuBar };
