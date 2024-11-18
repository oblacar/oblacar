import React, { useState } from 'react';
import styles from './HorizontalPhotoCarousel.module.css';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const HorizontalPhotoCarousel = ({ photos }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const prevPhoto = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? photos.length - 1 : prevIndex - 1
        );
    };

    const nextPhoto = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === photos.length - 1 ? 0 : prevIndex + 1
        );
    };

    return (
        <div className={styles.carouselContainer}>
            <button
                className={styles.arrowButton}
                onClick={prevPhoto}
                aria-label='Previous Photo'
            >
                <ChevronLeftIcon className={styles.arrowIcon} />
            </button>

            <div className={styles.photoContainer}>
                <img
                    src={photos[currentIndex]}
                    alt=''
                    className={styles.photo}
                />
            </div>

            <button
                className={styles.arrowButton}
                onClick={nextPhoto}
                aria-label='Next Photo'
            >
                <ChevronRightIcon className={styles.arrowIcon} />
            </button>

            <div className={styles.dotsContainer}>
                {photos.map((_, index) => (
                    <span
                        key={index}
                        className={`${styles.dot} ${
                            index === currentIndex ? styles.activeDot : ''
                        }`}
                    ></span>
                ))}
            </div>
        </div>
    );
};

export default HorizontalPhotoCarousel;
