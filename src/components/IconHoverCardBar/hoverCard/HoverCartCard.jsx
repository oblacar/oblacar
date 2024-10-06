import { useState } from 'react';
import { setTopLeftHover } from './hoverCardFunctions';
import './hoverCard.css'; // Создайте файл стилей HoverCard.css

export const HoverCartCard = ({
    isHoveredIcon,
    iconCoordinates,
    windowWidth,
}) => {
    const [isHoveredCard, setIsHoveredCard] = useState(false);

    const handleMouseEnter = () => {
        setIsHoveredCard(true);
    };

    const handleMouseLeave = () => {
        setIsHoveredCard(false);
    };

    return (
        <>
            <div
                className={`hover-card  ${
                    isHoveredIcon || isHoveredCard ? 'visible' : ''
                }`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={setTopLeftHover(iconCoordinates, windowWidth)}
            >
                <div className='hover-card-content '>
                    <p className='hover-card-title'>Корзина</p>
                    <p>Для совершения покупки, необходимо зайти в систему.</p>
                </div>
            </div>
        </>
    );
};
