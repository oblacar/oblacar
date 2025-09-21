import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './InlineOverlapRow.css';

/**
 * Универсальная лента с «умным» наездом.
 *
 * Props:
 * - items: any[]                      — данные для рендера
 * - ItemComponent: ReactComponent     — компонент одного элемента (получит { item, size, aspect })
 * - itemSize: number = 60             — ширина плитки в px
 * - itemAspectRatio: number = 1       — отношение сторон (1 для круга/квадрата, 2/3 — «лист»)
 * - gap: number = 8                   — зазор в plain-режиме
 * - className: string = ''            — доп. классы
 *
 * Поведение:
 * - variant: 'auto' | 'overlap' | 'scroll' (сейчас используем 'auto')
 * - maxAutoOverlapRatio: 0.6          — максимум наезда как доля itemSize
 * - minAutoOverlap: 6                 — минимум наезда в px
 *
 * Навигация/клики:
 * - onItemClick?: (item) => void      — если задан, оборачиваем в <button>
 * - buildTo?: (item) => string        — если нет onItemClick, оборачиваем в <Link>
 * - linkBase?: string                 — альтернатива buildTo: `${linkBase}/${getKey(item)}`
 * - getKey?: (item) => string|number  — ключ элемента (по умолчанию item.id || item.key)
 *
 * Кастомизация "+N":
 * - renderOverflow?: (overflow, size) => JSX
 *
 * Пустое состояние:
 * - emptyText: string = 'Пусто'
 */
const InlineOverlapRow = ({
  items = [],
  ItemComponent,
  itemSize = 60,
  itemAspectRatio = 1,
  gap = 8,
  className = '',

  variant = 'auto',
  maxAutoOverlapRatio = 0.6,
  minAutoOverlap = 6,

  onItemClick,
  buildTo,
  linkBase,
  getKey = (x) => x?.id ?? x?.key,

  renderOverflow,
  emptyText = 'Пусто',
}) => {
  const rootRef = useRef(null);

  const [auto, setAuto] = useState({
    mode: 'plain',   // 'plain' | 'overlap'
    overlap: 0,
    visible: items.length,
    overflow: 0,
  });

  useLayoutEffect(() => {
    if (variant !== 'auto') return;

    const calc = () => {
      const n = items.length;
      if (!n) {
        setAuto({ mode: 'plain', overlap: 0, visible: 0, overflow: 0 });
        return;
      }
      const wrap = rootRef.current;
      if (!wrap) return;

      const W = wrap.clientWidth;
      const s = itemSize;

      // plain: n*s + (n-1)*gap
      const wPlain = n * s + (n - 1) * gap;
      if (wPlain <= W) {
        setAuto({ mode: 'plain', overlap: 0, visible: n, overflow: 0 });
        return;
      }

      // overlap: width = s + (n-1)*(s - overlap)
      // => overlapNeeded = s - (W - s)/(n-1)
      let overlapNeeded = s - (W - s) / (n - 1);
      if (overlapNeeded < 0) overlapNeeded = 0;
      const maxOverlap = s * maxAutoOverlapRatio;
      const overlap = Math.max(minAutoOverlap, Math.min(overlapNeeded, maxOverlap));

      const widthWithOverlap = s + (n - 1) * (s - overlap);
      if (widthWithOverlap <= W) {
        setAuto({ mode: 'overlap', overlap, visible: n, overflow: 0 });
        return;
      }

      // Не влезаем даже с maxOverlap — уменьшаем количество + "+N"
      const step = s - maxOverlap;
      let k = Math.floor((W - s) / step); // доп. элементов к первому
      k = Math.max(0, k - 1);             // резерв под "+N"
      const visible = Math.max(1, Math.min(n, k + 1));
      const overflow = Math.max(0, n - visible);

      setAuto({ mode: 'overlap', overlap: maxOverlap, visible, overflow });
    };

    calc();

    const ro = new ResizeObserver(() => calc());
    if (rootRef.current) ro.observe(rootRef.current);
    window.addEventListener('resize', calc);

    return () => {
      try { if (rootRef.current) ro.unobserve(rootRef.current); } catch {}
      ro.disconnect?.();
      window.removeEventListener('resize', calc);
    };
  }, [variant, items, itemSize, gap, maxAutoOverlapRatio, minAutoOverlap]);

  const list = useMemo(
    () => (variant === 'auto' ? items.slice(0, auto.visible) : items),
    [items, variant, auto.visible]
  );
  const overflow = variant === 'auto' ? auto.overflow : 0;

  const makeHref = (item) => {
    if (buildTo) return buildTo(item);
    if (linkBase) {
      const key = getKey(item);
      return key != null ? `${linkBase}/${key}` : '#';
    }
    return '#';
  };

  return (
    <div
      ref={rootRef}
      className={`ior-row ${variant === 'auto' && auto.mode === 'overlap' ? 'ior-row--overlap' : ''} ${className}`}
      style={{
        '--ior-size': `${itemSize}px`,
        '--ior-overlap': `${variant === 'auto' ? auto.overlap : 0}px`,
        '--ior-gap': `${gap}px`,
        '--ior-aspect': `${itemAspectRatio}`,
      }}
    >
      <div className="ior-row__list">
        {list.length === 0 ? (
          <div className="ior-row__empty">{emptyText}</div>
        ) : (
          list.map((item, idx) => {
            const key = String(getKey(item) ?? idx);
            const overlapCls = (variant === 'auto' && auto.mode === 'overlap' && idx > 0) ? 'ior-row__item--overlap' : '';
            const commonClass = `ior-row__item ${overlapCls}`;

            const inner = (
              <div className="ior-row__box" style={{ width: 'var(--ior-size)', aspectRatio: 'var(--ior-aspect)' }}>
                {/* Передаём только данные и размер; стиль элемента — внутри ItemComponent */}
                <ItemComponent item={item} size={itemSize} aspect={itemAspectRatio} />
              </div>
            );

            if (onItemClick) {
              return (
                <button
                  key={key}
                  type="button"
                  className={`${commonClass} ior-row__btn`}
                  data-stop-card="true"
                  onClick={(e) => { e.stopPropagation(); onItemClick(item); }}
                  title="Открыть"
                >
                  {inner}
                </button>
              );
            }

            if (buildTo || linkBase) {
              return (
                <Link
                  key={key}
                  to={makeHref(item)}
                  className={`${commonClass} ior-row__link`}
                  data-stop-card="true"
                  onClick={(e) => e.stopPropagation()}
                  title="Открыть"
                >
                  {inner}
                </Link>
              );
            }

            return (
              <div key={key} className={commonClass} data-stop-card="true">
                {inner}
              </div>
            );
          })
        )}

        {overflow > 0 && (
          <Link
            to={linkBase || '#'}
            className={`ior-row__item ior-row__more ${(variant === 'auto' && auto.mode === 'overlap' && list.length) ? 'ior-row__item--overlap' : ''}`}
            data-stop-card="true"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Ещё ${overflow}`}
            title={`Ещё ${overflow}`}
            style={{ width: 'var(--ior-size)', aspectRatio: 'var(--ior-aspect)' }}
          >
            {renderOverflow ? renderOverflow(overflow, itemSize) : `+${overflow}`}
          </Link>
        )}
      </div>
    </div>
  );
};

export default InlineOverlapRow;
