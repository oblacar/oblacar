// src/components/Header/Header.js
// Header - содержит три рабочих полосы и логотип
import React, { useEffect, useState, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';

import './Header.css'; // стили

import UserContext from '../../hooks/UserContext';

import { IconDropdownMenuBar } from '../IconHoverCardBar/IconHoverCardBar';

const Header = () => {
    const [isNarrowHeader, setIsNarrowHeader] = useState(false);

    const bottomLineRef = useRef(null);
    const nextLineRef = useRef(null);

    // профиль из контекста (нужен userRole)
    const { user: profile, isUserLoaded } = useContext(UserContext);

    useEffect(() => {
        const bottomLineElement = bottomLineRef.current;
        const paddingEl = document.querySelector('.header-padding');
        const nextEl = nextLineRef.current;

        // если чего-то нет — просто выходим без предупреждений
        if (!bottomLineElement || !paddingEl || !nextEl) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!bottomLineElement || !paddingEl) return;
                if (!entry.isIntersecting) {
                    bottomLineElement.classList.add('fixed-bottom-line');
                    paddingEl.classList.add('visible');
                    setIsNarrowHeader(true);
                } else {
                    bottomLineElement.classList.remove('fixed-bottom-line');
                    paddingEl.classList.remove('visible');
                    setIsNarrowHeader(false);
                }
            },
            { threshold: 0 }
        );

        observer.observe(nextEl);
        return () => observer.disconnect();
    }, []);

    return (
        <header className="header">
            <div className="top-line">
                <div className="container">
                    <Link to="/">
                        <div className="logo">
                            <img
                                src="/logo/logo-oblacar5.png"
                                alt="Логотип"
                                className="logo-image"
                            />
                        </div>
                    </Link>
                </div>
            </div>

            <div className="middle-thin-line"></div>
            <div className="middle-thin-line2 next-line" ref={nextLineRef}></div>

            <div className="bottom-line" ref={bottomLineRef}>
                {isNarrowHeader ? (
                    <Link to="/">
                        <div className="container-logo-mini">
                            <div className="logo-mini">
                                <img
                                    src="/logo/logo-oblacar-mini.png"
                                    alt="Логотип"
                                    className="logo-image-mini"
                                />
                            </div>
                        </div>
                    </Link>
                ) : null}

                {/* 👉 ССЫЛКА В АДМИНКУ — видна только админам */}
                {isUserLoaded && profile?.userRole === 'admin' && (
                    <div
                        className="admin-link"
                        style={{
                            marginLeft: 12,
                            padding: '6px 10px',
                            border: '1px solid #e5e7eb',
                            borderRadius: 8,
                            lineHeight: 1,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            background: '#fff',
                        }}
                        title="Панель администратора"
                    >
                        <Link to="/admin">Админ</Link>
                    </div>
                )}

                {/* ваша панель иконок */}
                <IconDropdownMenuBar className="icons-area" />
            </div>

            <div className="header-padding"></div>
        </header>
    );
};

export default Header;
