// src/components/VehicleAvatarRow/VehicleAvatarRow.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import VehicleAvatar from './VehicleAvatar';
import './VehicleAvatarRow.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const VehicleAvatarRow = ({
    vehicles = [], // [{ truckId, truckName, truckPhotoUrls, ... }]
    itemSize = 64, // диаметр кружка
    gap = 10, // зазор между кружками
    className = '',
    onItemClick, // (vehicle) => void — если передан, используем его
    linkToBase = '/vehicles', // если onItemClick не передан — оборачиваем в <Link to={`${linkToBase}/${id}`}/>
    emptyText = 'Пока нет машин',
}) => {
    const scrollerRef = useRef(null);
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(false);

    const recalc = () => {
        const el = scrollerRef.current;
        if (!el) return;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        const maxLeft = scrollWidth - clientWidth;
        setCanLeft(scrollLeft > 2);
        setCanRight(scrollLeft < maxLeft - 2);
    };

    useEffect(() => {
        recalc();
    }, [vehicles, itemSize, gap]);

    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;
        const onScroll = () => recalc();
        el.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', recalc);
        return () => {
            el.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', recalc);
        };
    }, []);

    const scrollByAmount = (dir = 1) => {
        const el = scrollerRef.current;
        if (!el) return;
        const amount = Math.max(itemSize + gap, el.clientWidth * 0.6) * dir;
        el.scrollBy({ left: amount, behavior: 'smooth' });
    };

    return (
        <div className={`va-row ${className}`}>
            {/* стрелки-навигации */}
            {canLeft && (
                <button
                    type='button'
                    className='va-row__nav va-row__nav--left'
                    onClick={() => scrollByAmount(-1)}
                    aria-label='Прокрутить влево'
                >
                    <FaChevronLeft />
                </button>
            )}
            {canRight && (
                <button
                    type='button'
                    className='va-row__nav va-row__nav--right'
                    onClick={() => scrollByAmount(1)}
                    aria-label='Прокрутить вправо'
                >
                    <FaChevronRight />
                </button>
            )}

            <div
                className='va-row__scroll'
                ref={scrollerRef}
                style={{ gap: `${gap}px` }}
            >
                {vehicles.length === 0 ? (
                    <div className='va-row__empty'>{emptyText}</div>
                ) : (
                    vehicles.map((v) => {
                        const content = (
                            <VehicleAvatar
                                key={v.truckId}
                                vehicle={v}
                                size={itemSize}
                                title={v.truckName}
                                className='va-row__avatar'
                            />
                        );

                        if (onItemClick) {
                            return (
                                <button
                                    key={v.truckId}
                                    type='button'
                                    className='va-row__item va-row__btn'
                                    onClick={() => onItemClick(v)}
                                    title={v.truckName || 'Машина'}
                                >
                                    {content}
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={v.truckId}
                                to={`${linkToBase}/${v.truckId}`}
                                className='va-row__item va-row__link'
                                title={v.truckName || 'Машина'}
                            >
                                {content}
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default VehicleAvatarRow;
