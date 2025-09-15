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
    showThumbs = true, // <-- НОВОЕ: можно скрыть ленту превью
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
        const measure = (reason = 'measure') => {
            const hasThumbs = !!thumbsRef.current;
            const hasInner = !!thumbsInnerRef.current;

            if (!hasThumbs || !hasInner) {
                console.log('[VPC]', reason, 'refs missing', { hasThumbs, hasInner });
                return;
            }

            const vpH = thumbsRef.current.clientHeight || 0;
            const ctH = thumbsInnerRef.current.scrollHeight || 0;
            const max = Math.max(0, ctH - vpH);

            setViewportH(vpH);
            setContentH(ctH);

            // логируем текущее и скорректированное значение offset
            setOffset((o) => {
                const clamped = clamp(o, 0, max);
                if (clamped !== o) {
                    console.log('[VPC]', reason, 'clamp offset', { before: o, after: clamped, max, vpH, ctH });
                } else {
                    console.log('[VPC]', reason, { offset: o, max, vpH, ctH });
                }
                return clamped;
            });
        };

        measure('initial');

        // Если ResizeObserver доступен — наблюдаем только за реальными элементами
        let ro;
        const el1 = thumbsRef.current;
        const el2 = thumbsInnerRef.current;

        console.log('[VPC] setup observer', {
            hasResizeObserver: typeof ResizeObserver !== 'undefined',
            el1IsElement: el1 instanceof Element,
            el2IsElement: el2 instanceof Element,
        });

        if (typeof ResizeObserver !== 'undefined') {
            ro = new ResizeObserver(() => {
                console.log('[VPC] resize-observer tick');
                measure('resize-observer');
            });
            if (el1 instanceof Element) ro.observe(el1);
            if (el2 instanceof Element) ro.observe(el2);
        }

        const onResize = () => {
            console.log('[VPC] window resize');
            measure('window-resize');
        };
        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
            if (ro) {
                ro.disconnect();
                console.log('[VPC] observer disconnected');
            }
        };
        // зависимости те же:
    }, [list.length, mainHeight, stripWidth, gap]);

    // если индекс вышел за пределы при замене массива — сбросить
    useEffect(() => {
        if (index >= list.length) {
            console.log('[VPC] reset index', { index, listLen: list.length });
            setIndex(0);
        }
    }, [list.length, index]);

    const ensureVisible = (i) => {
        // прокрутить ленту так, чтобы превью с индексом i оказалось в окне
        if (!thumbsRef.current || !thumbsInnerRef.current) {
            console.log('[VPC] ensureVisible: refs missing', { i });
            return;
        }
        const wrap = thumbsRef.current;
        const el = thumbsInnerRef.current.querySelector(`.vpc__thumb[data-i="${i}"]`);
        if (!el) {
            console.log('[VPC] ensureVisible: thumb not found', { i });
            return;
        }

        const wrapRect = wrap.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();

        // сколько пикселей нужно сдвинуть, чтобы элемент попал в зону
        let delta = 0;
        if (elRect.top < wrapRect.top) {
            delta = elRect.top - wrapRect.top - gap;
        } else if (elRect.bottom > wrapRect.bottom) {
            delta = elRect.bottom - wrapRect.bottom + gap;
        }

        const max = Math.max(0, contentH - viewportH);
        const newOffset = clamp(offset + delta, 0, max);

        console.log('[VPC] ensureVisible', {
            i, delta, offsetBefore: offset, newOffset, max,
            wrapRectTop: wrapRect.top, wrapRectBottom: wrapRect.bottom,
            elRectTop: elRect.top, elRectBottom: elRect.bottom,
            viewportH, contentH
        });

        if (newOffset !== offset) setOffset(newOffset);
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

    console.log('[VPC] render', {
        listLen: list.length,
        mainWidth, mainHeight, stripWidth, gap,
        showThumbs   // если пробрасываешь этот проп
    });


    return (
        <div
            className={`vpc ${!showThumbs ? 'vpc--main-only' : ''} ${className}`}
            style={styleVars}
        >
            {/* Лента превью — рисуем только если showThumbs */}
            {showThumbs && (
                <div className="vpc__thumbs" ref={thumbsRef}>
                    {canScrollUp && (
                        <button
                            type="button"
                            className="vpc__thumbs-btn vpc__thumbs-btn--up"
                            onClick={scrollUp}
                            title="Вверх"
                            aria-label="Вверх"
                        >
                            {ChevronUp}
                        </button>
                    )}

                    <div
                        className="vpc__thumbs-inner"
                        ref={thumbsInnerRef}
                        style={{ transform: `translateY(var(--vpc-shift))` }}
                    >
                        {list.length ? (
                            list.map((url, i) => (
                                <button
                                    key={`${url}-${i}`}
                                    data-i={i}
                                    type="button"
                                    className={`vpc__thumb ${i === index ? 'is-active' : ''}`}
                                    aria-selected={i === index}
                                    onClick={() => handleSelectThumb(i)}
                                    title={`Фото ${i + 1}`}
                                >
                                    <img src={url} alt="" />
                                </button>
                            ))
                        ) : (
                            <div className="vpc__thumb vpc__thumb--placeholder">—</div>
                        )}
                    </div>

                    {canScrollDown && (
                        <button
                            type="button"
                            className="vpc__thumbs-btn vpc__thumbs-btn--down"
                            onClick={scrollDown}
                            title="Вниз"
                            aria-label="Вниз"
                        >
                            {ChevronDown}
                        </button>
                    )}
                </div>
            )}

            {/* Главное фото */}
            <div className="vpc__main">
                {main ? (
                    <>
                        <img src={main} alt="Главное фото" />
                        <button
                            type="button"
                            className="vpc__nav vpc__nav--left"
                            onClick={() => nav(-1)}
                            title="Предыдущее фото"
                            aria-label="Предыдущее фото"
                        >
                            {ChevronLeft}
                        </button>
                        <button
                            type="button"
                            className="vpc__nav vpc__nav--right"
                            onClick={() => nav(1)}
                            title="Следующее фото"
                            aria-label="Следующее фото"
                        >
                            {ChevronRight}
                        </button>
                    </>
                ) : (
                    <div className="vpc__main-placeholder">Фото</div>
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
