import { useState, useContext } from 'react';
import { setTopLeftHover } from './hoverCardFunctions';
import './hoverCard.css'; // Создайте файл стилей HoverCard.css

import AuthContext from '../../../hooks/Authorization/AuthContext';

import { PrevieReviewAdsList } from '../../ReviewAds/PreviewReviewAdsList';

export const HoverOrdersCard = ({
    isHoveredIcon,
    iconCoordinates,
    windowWidth,
}) => {
    const { isAuthenticated } = useContext(AuthContext);
    const [isHoveredCard, setIsHoveredCard] = useState(false);

    const handleMouseEnter = () => {
        setIsHoveredCard(true);
    };

    const handleMouseLeave = () => {
        setIsHoveredCard(false);
    };
    return (
        <div
            className={`hover-card ${
                isHoveredIcon || isHoveredCard ? 'visible' : ''
            }`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={setTopLeftHover(iconCoordinates, windowWidth)}
        >
            <div className='hover-card-content '>
                <p className='hover-card-title'>Варианты</p>
                {isAuthenticated ? (
                    <PrevieReviewAdsList />
                ) : (
                    <p>
                        Войдите в систему, что бы иметь возможность работать с
                        вариантами объявлений.
                    </p>
                )}
            </div>
        </div>
    );
};
