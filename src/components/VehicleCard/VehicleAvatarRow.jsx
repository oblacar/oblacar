// src/components/VehicleAvatarRow/VehicleAvatarRow.jsx
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import VehicleAvatar from './VehicleAvatar';
import './VehicleAvatarRow.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const VehicleAvatarRow = ({
    vehicles = [],
    itemSize = 64,
    gap = 10,
    className = '',
    onItemClick,
    linkToBase = '/vehicles',
    emptyText = 'Пока нет машин',
    variant = 'auto',
    overlapOffset = 14,
    maxVisible = 4,
    minAutoOverlap = 6,
    maxAutoOverlapRatio = 0.6,
}) => {
    const rootRef = useRef(null);
    const scrollerRef = useRef(null);

    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(false);

    const [autoMode, setAutoMode] = useState({
        mode: 'plain',
        overlap: 0,
        visible: vehicles.length,
        overflow: 0,
    });

    const recalcScroll = () => {
        if (variant !== 'scroll') return;
        const el = scrollerRef.current;
        if (!el) return;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        const maxLeft = scrollWidth - clientWidth;
        setCanLeft(scrollLeft > 2);
        setCanRight(scrollLeft < maxLeft - 2);
    };

    useEffect(() => { recalcScroll(); }, [vehicles, itemSize, gap, variant]);

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

    useLayoutEffect(() => {
        if (variant !== 'auto') return;

        const calc = () => {
            const n = vehicles.length;
            if (n === 0) {
                setAutoMode({ mode: 'plain', overlap: 0, visible: 0, overflow: 0 });
                return;
            }
            const wrap = rootRef.current;
            if (!wrap) return;

            // небольшой запас от подрезания
            // const FIT_EPS = 2;
            // const W = wrap.clientWidth - FIT_EPS;
            const W = wrap.clientWidth;
            const s = itemSize + 6; // твой «+6» под белое кольцо

            const wPlain = n * s + (n - 1) * gap;
            if (wPlain <= W) {
                setAutoMode({ mode: 'plain', overlap: 0, visible: n, overflow: 0 });
                return;
            }

            let overlapNeeded = s - (W - s) / (n - 1);
            if (overlapNeeded < 0) overlapNeeded = 0;
            const maxAutoOverlap = s * maxAutoOverlapRatio;
            const overlapClamped = Math.max(minAutoOverlap, Math.min(overlapNeeded, maxAutoOverlap));

            const widthWithClamped = s + (n - 1) * (s - overlapClamped);
            if (widthWithClamped <= W) {
                setAutoMode({ mode: 'overlap', overlap: overlapClamped, visible: n, overflow: 0 });
                return;
            }

            const step = s - maxAutoOverlap;
            let k = Math.floor((W - s) / step);
            k = Math.max(0, k - 1);
            let visible = Math.min(n, Math.max(1, k + 1));
            const overflow = Math.max(0, n - visible);

            if (overflow === 0) {
                setAutoMode({ mode: 'overlap', overlap: maxAutoOverlap, visible: n, overflow: 0 });
            } else {
                setAutoMode({ mode: 'overlap', overlap: maxAutoOverlap, visible, overflow });
            }
        };

        calc();
        const ro = new ResizeObserver(() => calc());
        if (rootRef.current) ro.observe(rootRef.current);
        window.addEventListener('resize', calc);
        return () => {
            try { if (rootRef.current) ro.unobserve(rootRef.current); } catch { }
            ro.disconnect?.();
            window.removeEventListener('resize', calc);
        };
    }, [variant, vehicles, itemSize, gap, minAutoOverlap, maxAutoOverlapRatio]);

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

    const effOverlap = isAuto ? autoMode.overlap : isFixedOverlap ? overlapOffset : 0;
    const showOverlap = isAuto ? autoMode.mode === 'overlap' : isFixedOverlap;

    return (
        // ... внутри return в VehicleAvatarRow.jsx

        <div
            className={`va-row ${showOverlap ? 'va-row--overlap' : ''} ${className}`}
            ref={rootRef}
            style={{
                '--va-size': `${itemSize}px`,
                '--va-overlap': `${effOverlap}px`,
            }}
        >
            {/* стрелки — только для scroll */}
            {isScroll && canLeft && (
                <button
                    type="button"
                    className="va-row__nav va-row__nav--left"
                    data-stop-card="true"
                    onClick={(e) => { e.stopPropagation(); scrollByAmount(-1); }}
                    aria-label="Прокрутить влево"
                >
                    <FaChevronLeft />
                </button>
            )}
            {isScroll && canRight && (
                <button
                    type="button"
                    className="va-row__nav va-row__nav--right"
                    data-stop-card="true"
                    onClick={(e) => { e.stopPropagation(); scrollByAmount(1); }}
                    aria-label="Прокрутить вправо"
                >
                    <FaChevronRight />
                </button>
            )}

            <div
                className="va-row__scroll"
                ref={isScroll ? scrollerRef : undefined}
                style={{
                    gap: showOverlap ? 0 : `${gap}px`,
                    overflowX: isScroll ? 'auto' : 'hidden',
                }}
            >
                {list.length === 0 ? (
                    <div className="va-row__empty">{emptyText}</div>
                ) : (
                    list.map((v, idx) => {
                        const itemClass = `va-row__item ${showOverlap ? 'va-row__item--overlap' : ''}`;
                        const itemStyle = showOverlap && idx > 0
                            ? { marginLeft: 'calc(-1 * var(--va-overlap))' }
                            : undefined;

                        const content = (
                            <VehicleAvatar
                                vehicle={v}
                                size={itemSize}
                                title={v.truckName}
                                className="va-row__avatar"
                            />
                        );

                        if (onItemClick) {
                            return (
                                <button
                                    key={v.truckId}
                                    type="button"
                                    className={itemClass}
                                    style={itemStyle}
                                    title={v.truckName || 'Машина'}
                                    data-stop-card="true"
                                    onClick={(e) => { e.stopPropagation(); onItemClick(v); }}
                                >
                                    {content}
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={v.truckId}
                                to={`${linkToBase}/${v.truckId}`}
                                className={itemClass}
                                style={itemStyle}
                                title={v.truckName || 'Машина'}
                                data-stop-card="true"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {content}
                            </Link>
                        );
                    })
                )}

                {showOverlap && overflow > 0 && (
                    <Link
                        to={linkToBase}
                        className="va-row__more"
                        data-stop-card="true"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: 'var(--va-size)',
                            height: 'var(--va-size)',
                            marginLeft: list.length ? 'calc(-1 * var(--va-overlap))' : 0,
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
