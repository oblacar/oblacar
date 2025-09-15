import React, { useEffect, useMemo, useRef, useState } from 'react';
import './VerticalPhotoCarousel.css';

/**
 * Вертикальная фото-карусель:
 *  - превью слева: ширина = stripWidth, высота сохраняет пропорции оригинала
 *  - прокрутка ленты кнопками ↑/↓ (без нативного скролла)
 *  - справа большое фото, невидимые стрелки слева/справа проявляются на hover
 *  - бесконечная навигация, активное превью синхронизируется с главным фото
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
    const [index, setIndex] = useState(0);

    // пиксельный оффсет (на сколько прокручена внутренняя колонка превью)
    const [offset, setOffset] = useState(0);
    const [viewportH, setViewportH] = useState(mainHeight);
    const [contentH, setContentH] = useState(0);

    const thumbsRef = useRef(null); // окно (видимая область)
    const thumbsInnerRef = useRef(null); // колонка с превью

    // Измеряем геометрию при монтировании/изменении размеров/данных
    useEffect(() => {
        const measure = () => {
            if (!thumbsRef.current || !thumbsInnerRef.current) return;
            const vpH = thumbsRef.current.clientHeight;
            const ctH = thumbsInnerRef.current.scrollHeight;
            setViewportH(vpH);
            setContentH(ctH);

            // удерживаем offset в допустимых пределах
            const max = Math.max(0, ctH - vpH);
            setOffset((o) => clamp(o, 0, max));
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(thumbsRef.current);
        ro.observe(thumbsInnerRef.current);
        window.addEventListener('resize', measure);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [list.length, mainHeight, stripWidth, gap]);

    // если индекс вышел за пределы при замене массива — сбросить
    useEffect(() => {
        if (index >= list.length) setIndex(0);
    }, [list.length, index]);

    const ensureVisible = (i) => {
        // прокрутить ленту так, чтобы превью с индексом i оказался в окне
        if (!thumbsRef.current || !thumbsInnerRef.current) return;
        const wrap = thumbsRef.current;
        const el = thumbsInnerRef.current.querySelector(
            `.vpc__thumb[data-i="${i}"]`
        );
        if (!el) return;

        const wrapRect = wrap.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();

        // сколько пикселей нужно сдвинуть, чтобы элемент попал в зону
        let delta = 0;
        if (elRect.top < wrapRect.top) {
            // элемент выше окна — сдвинуть вверх (уменьшить offset)
            delta = elRect.top - wrapRect.top - gap;
        } else if (elRect.bottom > wrapRect.bottom) {
            // элемент ниже окна — сдвинуть вниз (увеличить offset)
            delta = elRect.bottom - wrapRect.bottom + gap;
        }

        if (delta !== 0) {
            const max = Math.max(0, contentH - viewportH);
            setOffset((o) => clamp(o + delta, 0, max));
        }
    };

    const handleSelectThumb = (i) => {
        setIndex(i);
        ensureVisible(i);
        onSelect?.(i, list[i]);
    };

    const nav = (dir) => {
        if (!list.length) return;
        const next = mod(index + dir, list.length);
        setIndex(next);
        ensureVisible(next);
        onSelect?.(next, list[next]);
    };

    // шаг прокрутки кнопками ↑/↓: «немного» — ориентируемся на ширину ленты
    const scrollDelta = Math.max(44, Math.round(stripWidth + gap));
    const canScrollUp = offset > 0;
    const canScrollDown = offset < Math.max(0, contentH - viewportH);
    const scrollUp = () => {
        if (!canScrollUp) return;
        setOffset((o) =>
            clamp(o - scrollDelta, 0, Math.max(0, contentH - viewportH))
        );
    };
    const scrollDown = () => {
        if (!canScrollDown) return;
        setOffset((o) =>
            clamp(o + scrollDelta, 0, Math.max(0, contentH - viewportH))
        );
    };

    const styleVars = {
        ['--vpc-main-w']: `${mainWidth}px`,
        ['--vpc-main-h']: `${mainHeight}px`,
        ['--vpc-strip-w']: `${stripWidth}px`,
        ['--vpc-gap']: `${gap}px`,
        ['--vpc-shift']: `-${Math.round(offset)}px`,
    };

    const main = list[index];

    return (
        <div
            className={`vpc ${className}`}
            style={styleVars}
        >
            {/* Лента превью без нативного скролла */}
            <div
                className='vpc__thumbs'
                ref={thumbsRef}
            >
                {canScrollUp && (
                    <button
                        type='button'
                        className='vpc__thumbs-btn vpc__thumbs-btn--up'
                        onClick={scrollUp}
                        title='Вверх'
                        aria-label='Вверх'
                    >
                        {ChevronUp}
                    </button>
                )}

                <div
                    className='vpc__thumbs-inner'
                    ref={thumbsInnerRef}
                    style={{ transform: `translateY(var(--vpc-shift))` }}
                >
                    {list.length ? (
                        list.map((url, i) => (
                            <button
                                key={`${url}-${i}`}
                                data-i={i}
                                type='button'
                                className={`vpc__thumb ${
                                    i === index ? 'is-active' : ''
                                }`}
                                aria-selected={i === index}
                                onClick={() => handleSelectThumb(i)}
                                title={`Фото ${i + 1}`}
                            >
                                {/* пропорциональное превью: ширина = ленте, высота по содержимому */}
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

                {canScrollDown && (
                    <button
                        type='button'
                        className='vpc__thumbs-btn vpc__thumbs-btn--down'
                        onClick={scrollDown}
                        title='Вниз'
                        aria-label='Вниз'
                    >
                        {ChevronDown}
                    </button>
                )}
            </div>

            {/* Большое фото с «невидимыми» стрелками */}
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
function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

/* --- inline SVG icons --- */
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
