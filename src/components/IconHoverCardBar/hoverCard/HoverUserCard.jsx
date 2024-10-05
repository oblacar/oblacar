import { Link } from 'react-router-dom';
import { useState } from 'react';
import { setTopLeftHover } from './hoverCardFunctions';
import './hoverCard.css'; // Создайте файл стилей HoverCard.css

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
                        <button
                            className='btn-hover-user-card login cu-btn-pink '
                            onClick={handleMouseLeave}
                        >
                            Войти
                        </button>
                    </Link>

                    <p>или зарегистрироваться</p>
                    <Link to='/register'>
                        <button
                            className='btn-hover-user-card auth cu-btn-pink '
                            onClick={handleMouseLeave}
                        >
                            Зарегистрироваться
                        </button>
                    </Link>
                </div>
            </div>
        </>
    );
};
