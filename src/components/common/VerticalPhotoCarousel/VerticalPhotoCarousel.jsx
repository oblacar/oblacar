import React, { useEffect, useMemo, useRef, useState } from 'react';
import './VerticalPhotoCarousel.css';

/**
 * Вертикальная фото-карусель:
 *  - превью слева (ширина stripWidth), прокрутка ↑/↓ без нативного скролла
 *  - справа большое фото, бесконечная навигация стрелками
 *  - активное превью синхронизировано с главным фото
 *  - размер большого фото управляется CSS через aspect-ratio (см. .vpc__main)
 */
const VerticalPhotoCarousel = ({
  photos,
  stripWidth = 84,   // ширина колонки превью (px)
  gap = 10,           // зазор между колонками/элементами (px)
  aspectRatio = 4 / 3, // соотношение сторон большого фото (можно 16/9)
  className = '',
  onSelect,
  showThumbs = true,  // можно скрыть ленту превью при узкой вёрстке
}) => {
  const list = useMemo(() => toArray(photos), [photos]);
  const [index, setIndex] = useState(0);

  // прокрутка ленты превью
  const [offset, setOffset] = useState(0);
  const [viewportH, setViewportH] = useState(0);
  const [contentH, setContentH] = useState(0);

  const thumbsRef = useRef(null);       // окно (видимая область)
  const thumbsInnerRef = useRef(null);  // колонка с превью

  // измеряем геометрию ленты при монтировании/обновлениях
  useEffect(() => {
    const measure = () => {
      if (!thumbsRef.current || !thumbsInnerRef.current) return;
      const vpH = thumbsRef.current.clientHeight || 0;
      const ctH = thumbsInnerRef.current.scrollHeight || 0;
      setViewportH(vpH);
      setContentH(ctH);
      const max = Math.max(0, ctH - vpH);
      setOffset((o) => clamp(o, 0, max));
    };

    // первый замер + на следующий кадр (если сначала была ширина 0)
    measure();
    const raf = requestAnimationFrame(measure);

    let ro = null;
    const el1 = thumbsRef.current;
    const el2 = thumbsInnerRef.current;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure);
      if (el1 instanceof Element) ro.observe(el1);
      if (el2 instanceof Element) ro.observe(el2);
    }
    window.addEventListener('resize', measure);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      ro?.disconnect();
    };
  }, [list.length, stripWidth, gap, showThumbs]);

  // если массив поменялся и индекс вышел за пределы
  useEffect(() => {
    if (index >= list.length) setIndex(0);
  }, [list.length, index]);

  const ensureVisible = (i) => {
    if (!thumbsRef.current || !thumbsInnerRef.current) return;
    const wrap = thumbsRef.current;
    const el = thumbsInnerRef.current.querySelector(`.vpc__thumb[data-i="${i}"]`);
    if (!el) return;

    const wrapRect = wrap.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    let delta = 0;
    if (elRect.top < wrapRect.top) {
      delta = elRect.top - wrapRect.top - gap;
    } else if (elRect.bottom > wrapRect.bottom) {
      delta = elRect.bottom - wrapRect.bottom + gap;
    }

    const max = Math.max(0, contentH - viewportH);
    const newOffset = clamp(offset + delta, 0, max);
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

  // шаг прокрутки кнопками ↑/↓: ориентируемся на ширину ленты
  const scrollDelta = Math.max(44, Math.round(stripWidth + gap));
  const canScrollUp = offset > 0;
  const canScrollDown = offset < Math.max(0, contentH - viewportH);
  const scrollUp = () => {
    if (!canScrollUp) return;
    setOffset((o) => clamp(o - scrollDelta, 0, Math.max(0, contentH - viewportH)));
  };
  const scrollDown = () => {
    if (!canScrollDown) return;
    setOffset((o) => clamp(o + scrollDelta, 0, Math.max(0, contentH - viewportH)));
  };

  // CSS-переменные для размеров/отступов/сдвига + aspect-ratio
  const styleVars = {
    ['--vpc-strip-w']: `${stripWidth}px`,
    ['--vpc-gap']: `${gap}px`,
    ['--vpc-shift']: `-${Math.round(offset)}px`,
    ['--vpc-aspect']: aspectRatio,
  };

  const main = list[index];

  return (
    <div className={`vpc ${!showThumbs ? 'vpc--main-only' : ''} ${className}`} style={styleVars}>
      {/* Лента превью — только если включена */}
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
        String(a[0]).localeCompare(String(b[0]), undefined, { numeric: true })
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
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M7 14l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ChevronDown = (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ChevronLeft = (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path d="M14 7l-5 5 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ChevronRight = (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path d="M10 7l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
