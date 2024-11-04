import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { setTopLeftHover } from './hoverCardFunctions';
import './hoverCard.css'; // Создайте файл стилей HoverCard.css

import AuthContext from '../../../hooks/Authorization/AuthContext';
import UserContext from '../../../hooks/UserContext';

import Button from '../../common/Button/Button';

export const HoverNewAdCard = ({
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
                    <p className='hover-card-title'>Новое объявление</p>
                    {/* {!isAuthenticated || */}
                    { !isUserLoaded ? (
                        <div>
                            <p>
                                Для размещения нового объявления, необходимо
                                зайти в систему.
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p>Разместите объявление о Транспорте</p>
                            <Link to='/new-tansport-ad'>
                                <Button
                                    type='button'
                                    size_width='wide'
                                    size_height='medium'
                                    children='Транспорт'
                                    onClick={handleMouseLeave}
                                />
                            </Link>
                            <p>или о Грузе</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
