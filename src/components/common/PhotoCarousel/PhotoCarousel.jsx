import React, { useState, useRef } from 'react';
import './PhotoCarousel.css';

const PhotoCarousel = ({ photos }) => {
    const [activePhoto, setActivePhoto] = useState(photos?.[0] || '');
    const previewContainerRef = useRef(null);

    // Функция для смены активного фото
    const handlePhotoClick = (photoUrl) => {
        setActivePhoto(photoUrl);
    };

    // Функция для горизонтального сдвига миниатюр
    const scrollPreview = (direction) => {
        const container = previewContainerRef.current;
        if (container) {
            const scrollAmount = direction === 'left' ? -5 : 5;
            container.scrollLeft += scrollAmount;
        }
    };

    // Обработчики для активации сдвига при наведении на левый или правый край
    const handleMouseMove = (event) => {
        const container = previewContainerRef.current;
        const { left, right } = container.getBoundingClientRect();
        const offset = 20; // Зона, близкая к краю, для сдвига

        if (event.clientX < left + offset) {
            scrollPreview('left');
        } else if (event.clientX > right - offset) {
            scrollPreview('right');
        }
    };

    return (
        <div className='photo-carousel'>
            {/* Большое активное фото */}
            <div className='photo-carousel-active'>
                {activePhoto ? (
                    <img
                        src={activePhoto}
                        alt='Текущее фото'
                        className='photo-carousel-active-image'
                    />
                ) : (
                    'Фото недоступно'
                )}
            </div>

            {/* Полоса миниатюр */}
            <div
                className='photo-carousel-previews'
                onMouseMove={handleMouseMove}
                ref={previewContainerRef}
            >
                {photos?.map((photoUrl, index) => (
                    <img
                        key={index}
                        src={photoUrl}
                        alt={`Фото ${index + 1}`}
                        className='photo-carousel-thumbnail'
                        onClick={() => handlePhotoClick(photoUrl)}
                    />
                ))}
            </div>
        </div>
    );
};

export default PhotoCarousel;
