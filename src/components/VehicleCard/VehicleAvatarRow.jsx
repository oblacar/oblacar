// src/components/VehicleAvatarRow/VehicleAvatarRow.jsx
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import VehicleAvatar from './VehicleAvatar';
import './VehicleAvatarRow.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const VehicleAvatarRow = ({
    vehicles = [], // [{ truckId, truckName, truckPhotoUrls, ... }]
    itemSize = 64, // диаметр кружка
    gap = 10, // зазор между кружками (для "без наезда")
    className = '',
    onItemClick, // (vehicle) => void — если передан, используем его
    linkToBase = '/vehicles',
    emptyText = 'Пока нет машин',

    // РЕЖИМ: 'auto' (умный), 'scroll' (гор. скролл со стрелками), 'overlap' (фикс. наезд)
    variant = 'auto',

    // для overlap
    overlapOffset = 14, // px — базовый наезд (используется при variant='overlap')
    maxVisible = 4, // сколько показывать при overlap, дальше +N
    // лимиты для авто-режима
    minAutoOverlap = 6, // минимальная величина наезда px
    maxAutoOverlapRatio = 0.6, // максимум наезда как доля itemSize (например, 0.6 => 60%)
}) => {
    const rootRef = useRef(null);
    const scrollerRef = useRef(null);

    // для scroll-режима
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(false);

    // для auto-режима вычисляем: plain/overlap, величину наезда и сколько показывать
    const [autoMode, setAutoMode] = useState({
        mode: 'plain', // 'plain' | 'overlap'
        overlap: 0, // px
        visible: vehicles.length, // сколько реально отображаем
        overflow: 0, // сколько скрыто (для +N)
    });

    // ===== scroll-логика (только для variant='scroll') =====
    const recalcScroll = () => {
        if (variant !== 'scroll') return;
        const el = scrollerRef.current;
        if (!el) return;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        const maxLeft = scrollWidth - clientWidth;
        setCanLeft(scrollLeft > 2);
        setCanRight(scrollLeft < maxLeft - 2);
    };

    useEffect(() => {
        recalcScroll();
    }, [vehicles, itemSize, gap, variant]);

    useEffect(() => {
        if (variant !== 'scroll') return;
        const el = scrollerRef.current;
        if (!el) return;
        const onScroll = () => recalcScroll();
        el.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', recalcScroll);
        return () => {
            el.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', recalcScroll);
        };
    }, [variant]);

    const scrollByAmount = (dir = 1) => {
        const el = scrollerRef.current;
        if (!el) return;
        const amount = Math.max(itemSize + gap, el.clientWidth * 0.6) * dir;
        el.scrollBy({ left: amount, behavior: 'smooth' });
    };

    // ===== авто-режим: расчёт наезда, чтобы вписаться в ширину =====
    useLayoutEffect(() => {
        if (variant !== 'auto') return;

        const calc = () => {
            const n = vehicles.length;
            if (n === 0) {
                setAutoMode({
                    mode: 'plain',
                    overlap: 0,
                    visible: 0,
                    overflow: 0,
                });
                return;
            }
            const wrap = rootRef.current;
            if (!wrap) return;

            // доступная ширина контейнера (внутренняя)
            const W = wrap.clientWidth;
            const s = itemSize;

            // 1) попытка без наезда (plain) с gap
            const wPlain = n * s + (n - 1) * gap;
            if (wPlain <= W) {
                setAutoMode({
                    mode: 'plain',
                    overlap: 0,
                    visible: n,
                    overflow: 0,
                });
                return;
            }

            // 2) считаем наезд, чтобы вписать все n
            // ширина при наезде: width = s + (n-1) * (s - overlap)
            // => overlapNeeded = s - (W - s) / (n - 1)
            let overlapNeeded = s - (W - s) / (n - 1);
            if (overlapNeeded < 0) overlapNeeded = 0; // теоретически не должно, мы проверили plain
            const maxAutoOverlap = s * maxAutoOverlapRatio;
            const overlapClamped = Math.max(
                minAutoOverlap,
                Math.min(overlapNeeded, maxAutoOverlap)
            );

            // если этого наезда хватает — показываем все n
            const widthWithClamped = s + (n - 1) * (s - overlapClamped);
            if (widthWithClamped <= W) {
                setAutoMode({
                    mode: 'overlap',
                    overlap: overlapClamped,
                    visible: n,
                    overflow: 0,
                });
                return;
            }

            // 3) даже с максимально допустимым наездом не влезаем — показываем максимум + кружок "+N"
            const step = s - maxAutoOverlap; // эффективный шаг по x на элемент
            // хотим уместить: [видимые элементы] + [кружок +N]
            let k = Math.floor((W - s) / step); // столько шагов умещается после первого s
            // k — это кол-во ДОПОЛНИТЕЛЬНЫХ элементов, которые поместятся, но нам нужно место и под "+N"
            // поэтому уменьшаем на 1, чтобы уместился ещё кружок +N (если будет overflow)
            k = Math.max(0, k - 1);

            let visible = Math.min(n, Math.max(1, k + 1)); // +1, т.к. k — дополнительные к первому
            const overflow = Math.max(0, n - visible);

            // если overflow == 0 (вдруг поместились все) — просто показываем все
            if (overflow === 0) {
                setAutoMode({
                    mode: 'overlap',
                    overlap: maxAutoOverlap,
                    visible: n,
                    overflow: 0,
                });
            } else {
                setAutoMode({
                    mode: 'overlap',
                    overlap: maxAutoOverlap,
                    visible,
                    overflow,
                });
            }
        };

        calc();

        // слушаем ресайз контейнера (ResizeObserver)
        const ro = new ResizeObserver(() => calc());
        if (rootRef.current) ro.observe(rootRef.current);
        window.addEventListener('resize', calc);

        return () => {
            try {
                if (rootRef.current) ro.unobserve(rootRef.current);
            } catch {}
            ro.disconnect?.();
            window.removeEventListener('resize', calc);
        };
    }, [variant, vehicles, itemSize, gap, minAutoOverlap, maxAutoOverlapRatio]);

    // какие данные использовать для рендера
    const isAuto = variant === 'auto';
    const isScroll = variant === 'scroll';
    const isFixedOverlap = variant === 'overlap';

    const list = isAuto
        ? vehicles.slice(0, autoMode.visible)
        : isFixedOverlap
        ? vehicles.slice(0, maxVisible)
        : vehicles;

    const overflow = isAuto
        ? autoMode.overflow
        : isFixedOverlap
        ? Math.max(vehicles.length - maxVisible, 0)
        : 0;
    const effOverlap = isAuto
        ? autoMode.overlap
        : isFixedOverlap
        ? overlapOffset
        : 0;
    const showOverlap = isAuto ? autoMode.mode === 'overlap' : isFixedOverlap;

    return (
        <div
            ref={rootRef}
            className={`va-row ${
                showOverlap ? 'va-row--overlap' : ''
            } ${className}`}
            style={{
                '--va-size': `${itemSize}px`,
                '--va-overlap': `${effOverlap}px`,
            }}
        >
            {/* стрелки — только для scroll */}
            {isScroll && canLeft && (
                <button
                    type='button'
                    className='va-row__nav va-row__nav--left'
                    onClick={() => scrollByAmount(-1)}
                    aria-label='Прокрутить влево'
                >
                    <FaChevronLeft />
                </button>
            )}
            {isScroll && canRight && (
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
                ref={isScroll ? scrollerRef : undefined}
                style={{
                    gap: showOverlap ? 0 : `${gap}px`,
                    overflowX: isScroll ? 'auto' : 'hidden',
                }}
            >
                {list.length === 0 ? (
                    <div className='va-row__empty'>{emptyText}</div>
                ) : (
                    list.map((v, idx) => {
                        const content = (
                            <VehicleAvatar
                                key={v.truckId}
                                vehicle={v}
                                size={itemSize}
                                title={v.truckName}
                                className='va-row__avatar'
                            />
                        );

                        const commonProps = {
                            key: v.truckId,
                            className: `va-row__item ${
                                showOverlap ? 'va-row__item--overlap' : ''
                            }`,
                            title: v.truckName || 'Машина',
                            style:
                                showOverlap && idx > 0
                                    ? {
                                          marginLeft:
                                              'calc(-1 * var(--va-overlap))',
                                      }
                                    : undefined,
                        };

                        if (onItemClick) {
                            return (
                                <button
                                    {...commonProps}
                                    type='button'
                                    onClick={() => onItemClick(v)}
                                >
                                    {content}
                                </button>
                            );
                        }
                        return (
                            <Link
                                {...commonProps}
                                to={`${linkToBase}/${v.truckId}`}
                            >
                                {content}
                            </Link>
                        );
                    })
                )}

                {/* "+N" — в авто и фикс overlap когда есть overflow */}
                {showOverlap && overflow > 0 && (
                    <Link
                        to={linkToBase}
                        className='va-row__more'
                        style={{
                            width: 'var(--va-size)',
                            height: 'var(--va-size)',
                            marginLeft: list.length
                                ? 'calc(-1 * var(--va-overlap))'
                                : 0,
                        }}
                        title={`Ещё ${overflow}`}
                        aria-label={`Ещё ${overflow}`}
                    >
                        +{overflow}
                    </Link>
                )}
            </div>
        </div>
    );
};

export default VehicleAvatarRow;
