import { useState, useContext } from 'react';
import { setTopLeftHover } from './hoverCardFunctions';
import './hoverCard.css'; // Создайте файл стилей HoverCard.css

// import AuthContext from '../../../hooks/Authorization/AuthContext';
import UserContext from '../../../hooks/UserContext';

import { PrevieReviewAdsList } from '../../ReviewAds/PreviewReviewAdsList';

export const HoverOrdersCard = ({
    isHoveredIcon,
    iconCoordinates,
    windowWidth,
}) => {
    // const { isAuthenticated } = useContext(AuthContext);//TODO Try relocated on UserContext
    const { isUserLoaded } = useContext(UserContext);

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
                {isUserLoaded ? (
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
