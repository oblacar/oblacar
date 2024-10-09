import { Link } from 'react-router-dom';
import { useState } from 'react';
import { setTopLeftHover } from './hoverCardFunctions';
import './hoverCard.css'; // Создайте файл стилей HoverCard.css

import Button from '../../common/Button/Button';

export const HoverUserCard = ({
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
                className={`hover-card ${
                    isHoveredIcon || isHoveredCard ? 'visible' : ''
                }`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={setTopLeftHover(iconCoordinates, windowWidth)}
            >
                <div className='hover-card-content '>
                    <p className='hover-card-title'>Профиль</p>
                    <p>Для оформления заказов, нужно войти в систему</p>
                    <Link to='/login'>
                        <Button
                            type='button'
                            size_width='wide'
                            size_height='medium'
                            children='Войти'
                            onClick={handleMouseLeave}
                        />
                    </Link>
                    <p>или зарегистрироваться</p>

                    <Link to='/register'>
                        <Button
                            type='button'
                            size_width='wide'
                            size_height='medium'
                            children='Зарегистрироваться'
                            onClick={handleMouseLeave}
                        />
                    </Link>
                </div>
            </div>
        </>
    );
};
