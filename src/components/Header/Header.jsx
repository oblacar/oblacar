// src/components/Header/Header.js
// Header - содержит три рабочих полосы и логотип
import React, { useEffect, useState, useRef } from 'react';
import './Header.css'; // Импортируем стили

import { IconDropdownMenuBar } from '../IconHoverCardBar/IconHoverCardBar';

import { Link, useAsyncError } from 'react-router-dom';

const Header = () => {
    const [isNarrowHeader, setIsNarrowHeader] = useState(false);

    const bottomLineRef = useRef(null);
    const nextLineRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) {
                    bottomLineRef.current.classList.add('fixed-bottom-line');
                    document
                        .querySelector('.header-padding')
                        .classList.add('visible');

                    setIsNarrowHeader(() => true);
                } else {
                    bottomLineRef.current.classList.remove('fixed-bottom-line');
                    document
                        .querySelector('.header-padding')
                        .classList.remove('visible');

                    setIsNarrowHeader(() => false);
                }
            },
            { threshold: 0 }
        );

        if (nextLineRef.current) {
            observer.observe(nextLineRef.current);
        }

        return () => {
            if (nextLineRef.current) {
                observer.unobserve(nextLineRef.current);
            }
        };
    }, []);

    return (
        <header className='header'>
            <div className='top-line'>
                <div className='container'>
                    <Link to='/'>
                        <div className='logo'>
                            <img
                                src='/logo/logo-oblacar5.png'
                                alt='Логотип'
                                className='logo-image'
                            />
                        </div>
                    </Link>
                </div>
            </div>
            <div className='middle-thin-line'></div>
            <div
                className='middle-thin-line2 next-line'
                ref={nextLineRef}
            ></div>
            <div
                className='bottom-line'
                ref={bottomLineRef}
            >
                {isNarrowHeader ? (
                    <Link to='/'>
                        <div className='container-logo-mini'>
                            <div className='logo-mini'>
                                <img
                                    src='/logo/logo-oblacar-mini.png'
                                    alt='Логотип'
                                    className='logo-image-mini'
                                />
                            </div>
                        </div>
                    </Link>
                ) : (
                    ''
                )}

                <IconDropdownMenuBar className='icons-area' />
            </div>
            <div className='header-padding'></div>
        </header>
    );
};

export default Header;
