import React, { useState, useRef, useEffect, useContext } from 'react';

import AuthContext from '../../hooks/Authorization/AuthContext';
import UserContext from '../../hooks/UserContext';
import TransportAdContext from '../../hooks/TransportAdContext';
import ConversationContext from '../../hooks/ConversationContext';

import IconHoverCard from './IconHoverCard';

import { HoverUserCard } from './hoverCard/HoverUserCard';
import { HoverMessageCard } from './hoverCard/HoverMessageCard';
import { HoverDeliveryCard } from './hoverCard/HoverDeliveryCard';
import { HoverOrdersCard } from './hoverCard/HoverOrdersCard';
import { HoverNewAdCard } from './hoverCard/HoverNewAdCard';
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

function IconDropdownMenuBar({ height }) {
    const { isAuthenticated } = useContext(AuthContext);
    const { user, isUserLoaded } = useContext(UserContext);
    const { reviewAds } = useContext(TransportAdContext);
    const { unreadMessages } = useContext(ConversationContext);

    const [iconNewAdCoordinates, setIconNewAdCoordinates] = useState(zero);
    const [iconUserCoordinates, setIconUserCoordinates] = useState(zero);
    const [iconOrdersCoordinates, setIconOrdersCoordinates] = useState(zero);
    const [iconMessageCoordinates, setIconMessageCoordinates] = useState(zero);
    const [iconCartCoordinates, setIconCartCoordinates] = useState(zero);

    const iconNewAdRef = useRef(null);
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

            setCoordinates(iconNewAdRef, setIconNewAdCoordinates);
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

    // const [isLoading, setIsLoading] = useState(true);

    // useEffect(() => {
    //     // Если пользователь аутентифицирован и данные пользователя загрузились
    //     if (isAuthenticated && user) {
    //         setIsLoading(false);

    //         console.log(user);
    //     }
    // }, [isAuthenticated, user]);

    // if (isLoading) {
    //     return <div>Loading...</div>;
    // }

    return (
        <>
            <div className={styles.iconsArea}>
                <IconHoverCard
                    type='Создать'
                    iconRef={iconNewAdRef}
                    IconComponent={FaPen}
                    HoverCardComponent={HoverNewAdCard}
                    iconCoordinates={iconNewAdCoordinates}
                    windowWidth={windowWidth}
                />
                <IconHoverCard
                    type={
                        isAuthenticated && isUserLoaded
                            ? `${user.userName}`
                            : 'Профиль'
                    }
                    iconRef={iconUserRef}
                    IconComponent={FaUser}
                    HoverCardComponent={HoverUserCard}
                    iconCoordinates={iconUserCoordinates}
                    windowWidth={windowWidth}
                    LinkTo={
                        isAuthenticated && isUserLoaded
                            ? '/user-profile'
                            : '/login'
                    }
                />
                <div className={styles.iconContainerVariants}>
                    <IconHoverCard
                        type='Сообщения'
                        iconRef={iconMessageRef}
                        IconComponent={FaEnvelope}
                        HoverCardComponent={HoverMessageCard}
                        iconCoordinates={iconMessageCoordinates}
                        windowWidth={windowWidth}
                        LinkTo={
                            isAuthenticated && isUserLoaded
                                ? '/dialogs'
                                : '/login'
                        }
                    />
                    {unreadMessages.length ? (
                        <div
                            className={`${styles.variantsCountContainer} ${styles.unreadMessagesPosition}`}
                        >
                            <div className={styles.variantsCount}>
                                {unreadMessages.length}
                            </div>
                        </div>
                    ) : (
                        ''
                    )}
                </div>

                <IconHoverCard
                    type='Доставки'
                    iconRef={iconCartRef}
                    IconComponent={FaShippingFast}
                    HoverCardComponent={HoverDeliveryCard}
                    iconCoordinates={iconCartCoordinates}
                    windowWidth={windowWidth}
                />
                <div className={styles.iconContainerVariants}>
                    <IconHoverCard
                        type='Варианты'
                        iconRef={iconOrdersRef}
                        IconComponent={FaClipboardList}
                        HoverCardComponent={HoverOrdersCard}
                        iconCoordinates={iconOrdersCoordinates}
                        windowWidth={windowWidth}
                    />
                    {reviewAds.length ? (
                        <div className={styles.variantsCountContainer}>
                            <div className={styles.variantsCount}>
                                {reviewAds.length}
                            </div>
                        </div>
                    ) : (
                        ''
                    )}
                </div>
            </div>
        </>
    );
}

export { IconDropdownMenuBar };
