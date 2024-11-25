// src/components/Header/Header.js
// Header - содержит три рабочих полосы и логотип
import React, { useEffect, useState, useRef } from 'react';
import './Header.css'; // Импортируем стили

import imgPath from '../../assets/567-2.jpg'; // Импорт картинки

import { IconDropdownMenuBar } from '../IconHoverCardBar/IconHoverCardBar';

import { Link, useAsyncError } from 'react-router-dom';

const Header = () => {
    const [isNarrowHeader, setIsNarrowHeader] = useState(false);

    const bottomLineRef = useRef(null);
    const nextLineRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                const bottomLineElement = bottomLineRef.current;
                const headerPaddingElement =
                    document.querySelector('.header-padding');

                // Проверяем, что элементы существуют
                if (!bottomLineElement || !headerPaddingElement) {
                    console.warn('Required elements not found in DOM.');
                    return;
                }

                if (!entry.isIntersecting) {
                    bottomLineElement.classList.add('fixed-bottom-line');
                    headerPaddingElement.classList.add('visible');
                    setIsNarrowHeader(() => true);
                } else {
                    bottomLineElement.classList.remove('fixed-bottom-line');
                    headerPaddingElement.classList.remove('visible');
                    setIsNarrowHeader(() => false);
                }
            },
            { threshold: 0 }
        );

        // Проверяем наличие nextLineRef.current перед наблюдением
        if (nextLineRef.current) {
            observer.observe(nextLineRef.current);
        } else {
            console.warn('nextLineRef is not set.');
        }

        // Очищаем наблюдателя при размонтировании
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
                // style={{ backgroundImage: `url(${imgPath})` }} // Передача картинки через стиль
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
