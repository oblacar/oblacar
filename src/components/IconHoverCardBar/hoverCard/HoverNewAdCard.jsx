import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { setTopLeftHover } from './hoverCardFunctions';
import './hoverCard.css'; // Создайте файл стилей HoverCard.css

import AuthContext from '../../../hooks/Authorization/AuthContext';

import Button from '../../common/Button/Button';

export const HoverNewAdCard = ({
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
        <>
            <div
                className={`hover-card  ${
                    isHoveredIcon || isHoveredCard ? 'visible' : ''
                }`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={setTopLeftHover(iconCoordinates, windowWidth)}
            >
                <p className='hover-card-title'>Новое объявление</p>
                <div className='hover-card-content '>
                    {!isAuthenticated ? (
                        <div>
                            <p>
                                Для размещения нового объявления, необходимо
                                зайти в систему.
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p>Для оформления заказов, нужно войти в систему</p>
                            <Link to='/new-tansport-ad'>
                                <Button
                                    type='button'
                                    size_width='wide'
                                    size_height='medium'
                                    children='Транспорт'
                                    onClick={handleMouseLeave}
                                />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
