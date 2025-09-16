import React, { useEffect, useMemo, useRef, useState } from 'react';
import './VerticalPhotoCarousel.css';

const VerticalPhotoCarousel = ({ photos, className = '', onSelect }) => {
  const list = useMemo(() => toArray(photos), [photos]);
  const [index, setIndex] = useState(0);

  // прокрутка ленты превью
  const [offset, setOffset] = useState(0);
  const [viewportH, setViewportH] = useState(0);
  const [contentH, setContentH] = useState(0);

  const thumbsRef = useRef(null);       // окно (видимая область)
  const thumbsInnerRef = useRef(null);  // колонка с превью

  // переизмеряем ленту при монтировании/ресайзе/смене списка
  useEffect(() => {
    const measure = () => {
      const wrap = thumbsRef.current;
      const inner = thumbsInnerRef.current;
      if (!wrap || !inner) return;

      // если лента скрыта через CSS (display:none), clientHeight будет 0
      const vpH = wrap.clientHeight || 0;
      const ctH = inner.scrollHeight || 0;

      setViewportH(vpH);
      setContentH(ctH);

      const max = Math.max(0, ctH - vpH);
      setOffset((o) => clamp(o, 0, max));
    };

    measure();
    const raf = requestAnimationFrame(measure);

    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure);
      thumbsRef.current && ro.observe(thumbsRef.current);
      thumbsInnerRef.current && ro.observe(thumbsInnerRef.current);
    }
    window.addEventListener('resize', measure);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      ro?.disconnect();
    };
  }, [list.length]);

  useEffect(() => {
    if (index >= list.length) setIndex(0);
  }, [list.length, index]);

  const ensureVisible = (i) => {
    const wrap = thumbsRef.current;
    const inner = thumbsInnerRef.current;
    if (!wrap || !inner) return;

    const el = inner.querySelector(`.vpc__thumb[data-i="${i}"]`);
    if (!el) return;

    const wrapRect = wrap.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    let delta = 0;
    if (elRect.top < wrapRect.top) delta = elRect.top - wrapRect.top - 8;
    else if (elRect.bottom > wrapRect.bottom) delta = elRect.bottom - wrapRect.bottom + 8;

    const max = Math.max(0, contentH - viewportH);
    const next = clamp(offset + delta, 0, max);
    if (next !== offset) setOffset(next);
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

  const canScrollUp = offset > 0;
  const canScrollDown = offset < Math.max(0, contentH - viewportH);

  const styleVars = {
    ['--vpc-shift']: `-${Math.round(offset)}px`,
  };

  const main = list[index];

  return (
    <div className={`vpc ${className}`} style={styleVars}>
      {/* Лента превью (её видимость и ширина — полностью под контролем CSS) */}
      <div className="vpc__thumbs" ref={thumbsRef}>
        {canScrollUp && (
          <button
            type="button"
            className="vpc__thumbs-btn vpc__thumbs-btn--up"
            onClick={() => setOffset((o) => Math.max(0, o - 96))}
            aria-label="Вверх"
            title="Вверх"
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
            onClick={() =>
              setOffset((o) => Math.min(Math.max(0, contentH - viewportH), o + 96))
            }
            aria-label="Вниз"
            title="Вниз"
          >
            {ChevronDown}
          </button>
        )}
      </div>

      {/* Большое фото */}
      <div className="vpc__main">
        {main ? (
          <>
            <img src={main} alt="Главное фото" />
            <button
              type="button"
              className="vpc__nav vpc__nav--left"
              onClick={() => nav(-1)}
              aria-label="Предыдущее фото"
              title="Предыдущее фото"
            >
              {ChevronLeft}
            </button>
            <button
              type="button"
              className="vpc__nav vpc__nav--right"
              onClick={() => nav(1)}
              aria-label="Следующее фото"
              title="Следующее фото"
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

/* helpers */
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
function mod(n, m) { return ((n % m) + m) % m; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

/* icons */
const ChevronUp = (<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 14l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const ChevronDown = (<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const ChevronLeft = (<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M14 7l-5 5 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const ChevronRight = (<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M10 7l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
