// src/components/ResponsiveVehicleGallery.jsx
import React, { useLayoutEffect, useRef, useState } from 'react';
import VerticalPhotoCarousel from './VerticalPhotoCarousel';

/**
 * Авто-галерея:
 * - Считает ширину контейнера через ResizeObserver.
 * - Если места достаточно — показывает вертикальные превью слева.
 * - Если узко — прячет превью (минималистичный режим), оставляя только большое фото с нав-стрелками.
 *
 * props:
 *  - photos: массив URL или объект {ph1: url, ...}
 *  - aspectRatio?: число (по умолчанию 4/3)
 *  - stripWidth?: px (84)
 *  - gap?: px (10)
 *  - minMainWidth?: px (380) — минимальная ширина большого фото для режима с превью
 *  - maxMainHeight?: px (опционально, например 460) — если хочешь ограничить высоту
 *  - className?: string
 */
const ResponsiveVehicleGallery = ({
    photos,
    aspectRatio = 4 / 3,
    stripWidth = 84,
    gap = 10,
    minMainWidth = 380,
    maxMainHeight,
    className = '',
}) => {
    const rootRef = useRef(null);
    const [containerW, setContainerW] = useState(0);

    useLayoutEffect(() => {
        let alive = true;
        const node = rootRef.current;

        const readWidth = (el) =>
            el ? Math.round(el.getBoundingClientRect().width || el.clientWidth || 0) : 0;

        const measure = (reason = 'measure') => {
            if (!alive) return;
            let wNode = readWidth(node);
            let wParent = node?.parentElement ? readWidth(node.parentElement) : 0;
            const chosen = wNode || wParent || 0;

            // ЛОГ №1: что видим по ширинам
            console.log('[RVG]', reason, { wNode, wParent, chosen });

            if (chosen) setContainerW(chosen);
        };

        measure('initial');                 // сразу после layout
        const raf = requestAnimationFrame(() => measure('raf')); // на следующий кадр

        // ResizeObserver по самому контейнеру
        let ro = null;
        if (typeof ResizeObserver !== 'undefined' && node instanceof Element) {
            ro = new ResizeObserver(() => measure('resize-observer'));
            ro.observe(node);
        }

        const onResize = () => measure('window-resize');
        window.addEventListener('resize', onResize);

        return () => {
            alive = false;
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
            ro?.disconnect();
        };
    }, []);

    // Решение по режиму и итоговые размеры
    const needVertical = containerW >= stripWidth + gap + minMainWidth;

    let mainW, mainH;
    if (needVertical) {
        mainW = Math.max(minMainWidth, containerW - stripWidth - gap);
    } else {
        mainW = containerW;
    }
    mainW = Math.max(1, Math.floor(mainW));
    mainH = Math.max(1, Math.floor(mainW / aspectRatio));
    if (maxMainHeight && mainH > maxMainHeight) {
        mainH = maxMainHeight;
        mainW = Math.floor(mainH * aspectRatio);
    }

    // ЛОГ №2: финальные решения
    console.log('[RVG] decision', {
        containerW,
        needVertical,
        mainW,
        mainH,
        stripWidth,
        gap,
        minMainWidth,
    });

    return (
        <div
            ref={rootRef}
            className={className}
            style={{ width: '100%', minWidth: 1 }} // защита от 0px
        >
            <VerticalPhotoCarousel
                photos={photos}
                mainWidth={mainW}
                mainHeight={mainH}
                stripWidth={stripWidth}
                gap={gap}
                showThumbs={needVertical}
                // showThumbs={true}
            />

            {/* <VerticalPhotoCarousel
                photos={truckPhotoUrls}
                stripWidth={84}
                gap={10}
            /> */}
        </div>
    );
};

export default ResponsiveVehicleGallery;