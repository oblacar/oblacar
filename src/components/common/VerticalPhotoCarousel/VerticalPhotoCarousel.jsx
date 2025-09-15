import React, { useEffect, useMemo, useRef, useState } from 'react';
import './VerticalPhotoCarousel.css';

/**
 * Вертикальная фото-карусель:
 *  - слева лента превью фикcированной ширины, по высоте = высоте главного фото
 *  - без скроллбаров: появляются круглые кнопки ↑/↓ для «шажковой» прокрутки
 *  - справа — главное фото фиксированного размера (cover + обрезка)
 *  - невидимые стрелки поверх главного фото (слева/справа), показываются при hover
 *  - бесконечная навигация по фото, синхронизация выделения превью
 *
 * props:
 *  - photos: string[] | Record<string,string>
 *  - mainWidth?: number   (px) ширина главного фото (по умолчанию 480)
 *  - mainHeight?: number  (px) высота главного фото (по умолчанию 360)
 *  - stripWidth?: number  (px) ширина колонки превью (по умолчанию 84)
 *  - gap?: number         (px) зазор между превью (по умолчанию 10)
 *  - className?: string
 *  - onSelect?: (index:number, url:string) => void
 */
const VerticalPhotoCarousel = ({
    photos,
    mainWidth = 480,
    mainHeight = 360,
    stripWidth = 84,
    gap = 10,
    className = '',
    onSelect,
}) => {
    const list = useMemo(() => toArray(photos), [photos]);
    const [index, setIndex] = useState(0); // выбранное большое фото
    const [scrollIdx, setScrollIdx] = useState(0); // «верхний» индекс в ленте
    const [step, setStep] = useState(stripWidth); // шаг прокрутки в px (высота одного превью + gap)
    const [visibleCount, setVisibleCount] = useState(1);

    const thumbsRef = useRef(null); // контейнер окна (с overflow: hidden)
    const thumbsInnerRef = useRef(null); // внутренняя колонка превью

    // пересчёт геометрии (высота превью + gap) и видимого количества
    useEffect(() => {
        const measure = () => {
            if (!thumbsRef.current) return;
            const wrap = thumbsRef.current;
            const firstThumb = wrap.querySelector('.vpc__thumb');
            const containerH = wrap.clientHeight || mainHeight;

            // gap из стилей
            let gapPx = gap;
            try {
                const cs = getComputedStyle(thumbsInnerRef.current || wrap);
                if (cs && cs.gap) {
                    const n = parseFloat(cs.gap);
                    if (!Number.isNaN(n)) gapPx = n;
                }
            } catch (_) {}

            // высота превью — по первому элементу (они квадратные)
            let thumbH = stripWidth;
            if (firstThumb) thumbH = firstThumb.offsetHeight || stripWidth;

            const stepPx = Math.max(1, Math.round(thumbH + gapPx));
            const count = Math.max(1, Math.floor(containerH / stepPx));

            setStep(stepPx);
            setVisibleCount(count);
        };

        measure();
        // пересчитываем при ресайзе окна
        const onResize = () => measure();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [list.length, mainHeight, stripWidth, gap]);

    // держим scrollIdx в допустимом диапазоне при смене данных/размеров
    useEffect(() => {
        const maxScroll = Math.max(0, list.length - visibleCount);
        if (scrollIdx > maxScroll) setScrollIdx(maxScroll);
    }, [list.length, visibleCount, scrollIdx]);

    // если список поменялся и текущий index «уехал» — сбросим его
    useEffect(() => {
        if (index >= list.length) setIndex(0);
    }, [list.length, index]);

    // при выборе фото — прокрутить ленту, чтобы выбранное было видно
    const ensureVisible = (i) => {
        const maxScroll = Math.max(0, list.length - visibleCount);
        if (i < scrollIdx) {
            setScrollIdx(i);
        } else if (i >= scrollIdx + visibleCount) {
            setScrollIdx(Math.min(maxScroll, i - visibleCount + 1));
        }
    };

    const handleSelectThumb = (i) => {
        setIndex(i);
        ensureVisible(i);
        onSelect?.(i, list[i]);
    };

    // стрелки на большом фото
    const nav = (dir) => {
        if (!list.length) return;
        const next = mod(index + dir, list.length);
        setIndex(next);
        ensureVisible(next);
        onSelect?.(next, list[next]);
    };

    // кнопки ↑/↓ у ленты
    const canScrollUp = scrollIdx > 0;
    const canScrollDown = scrollIdx + visibleCount < list.length;
    const scrollUp = () => {
        if (!canScrollUp) return;
        setScrollIdx((s) => Math.max(0, s - 1));
    };
    const scrollDown = () => {
        if (!canScrollDown) return;
        const maxScroll = Math.max(0, list.length - visibleCount);
        setScrollIdx((s) => Math.min(maxScroll, s + 1));
    };

    const styleVars = {
        ['--vpc-main-w']: `${mainWidth}px`,
        ['--vpc-main-h']: `${mainHeight}px`,
        ['--vpc-strip-w']: `${stripWidth}px`,
        ['--vpc-gap']: `${gap}px`,
        ['--vpc-shift']: `-${scrollIdx * step}px`,
    };

    const main = list[index];

    return (
        <div
            className={`vpc ${className}`}
            style={styleVars}
        >
            {/* Лента превью без скролла — прокрутка кнопками */}
            <div
                className='vpc__thumbs'
                ref={thumbsRef}
            >
                {/* Кнопка вверх (появляется только когда есть что крутить) */}
                {canScrollUp && (
                    <button
                        type='button'
                        className='vpc__thumbs-btn vpc__thumbs-btn--up'
                        onClick={scrollUp}
                        title='Вверх'
                    >
                        {ChevronUp}
                    </button>
                )}

                <div
                    className='vpc__thumbs-inner'
                    ref={thumbsInnerRef}
                >
                    {list.length ? (
                        list.map((url, i) => (
                            <button
                                key={`${url}-${i}`}
                                type='button'
                                className={`vpc__thumb ${
                                    i === index ? 'is-active' : ''
                                }`}
                                aria-selected={i === index}
                                onClick={() => handleSelectThumb(i)}
                                title={`Фото ${i + 1}`}
                            >
                                <img
                                    src={url}
                                    alt=''
                                />
                            </button>
                        ))
                    ) : (
                        <div className='vpc__thumb vpc__thumb--placeholder'>
                            —
                        </div>
                    )}
                </div>

                {/* Кнопка вниз */}
                {canScrollDown && (
                    <button
                        type='button'
                        className='vpc__thumbs-btn vpc__thumbs-btn--down'
                        onClick={scrollDown}
                        title='Вниз'
                    >
                        {ChevronDown}
                    </button>
                )}
            </div>

            {/* Главное фото с невидимыми стрелками слева/справа (hover → показать) */}
            <div className='vpc__main'>
                {main ? (
                    <>
                        <img
                            src={main}
                            alt='Главное фото'
                        />
                        <button
                            type='button'
                            className='vpc__nav vpc__nav--left'
                            onClick={() => nav(-1)}
                            title='Предыдущее фото'
                            aria-label='Предыдущее фото'
                        >
                            {ChevronLeft}
                        </button>
                        <button
                            type='button'
                            className='vpc__nav vpc__nav--right'
                            onClick={() => nav(1)}
                            title='Следующее фото'
                            aria-label='Следующее фото'
                        >
                            {ChevronRight}
                        </button>
                    </>
                ) : (
                    <div className='vpc__main-placeholder'>Фото</div>
                )}
            </div>
        </div>
    );
};

export default VerticalPhotoCarousel;

/* ---------- helpers ---------- */
function toArray(input) {
    if (!input) return [];
    if (Array.isArray(input)) return input.filter(Boolean);
    if (typeof input === 'object') {
        return Object.entries(input)
            .sort((a, b) =>
                String(a[0]).localeCompare(String(b[0]), undefined, {
                    numeric: true,
                })
            )
            .map(([, url]) => url)
            .filter(Boolean);
    }
    return [];
}
function mod(n, m) {
    return ((n % m) + m) % m;
}

// --- inline SVG icons ---
const ChevronUp = (
    <svg
        viewBox='0 0 24 24'
        width='18'
        height='18'
        aria-hidden='true'
    >
        <path
            d='M7 14l5-5 5 5'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        />
    </svg>
);
const ChevronDown = (
    <svg
        viewBox='0 0 24 24'
        width='18'
        height='18'
        aria-hidden='true'
    >
        <path
            d='M7 10l5 5 5-5'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        />
    </svg>
);
const ChevronLeft = (
    <svg
        viewBox='0 0 24 24'
        width='20'
        height='20'
        aria-hidden='true'
    >
        <path
            d='M14 7l-5 5 5 5'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        />
    </svg>
);
const ChevronRight = (
    <svg
        viewBox='0 0 24 24'
        width='20'
        height='20'
        aria-hidden='true'
    >
        <path
            d='M10 7l5 5-5 5'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
        />
    </svg>
);
