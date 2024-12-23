import { Link } from 'react-router-dom';
import { useState, useContext } from 'react';
import { setTopLeftHover } from './hoverCardFunctions';
import './hoverCard.css'; // Создайте файл стилей HoverCard.css
import './HoverUserCard.css'; // Персональный стиль

import AuthContext from '../../../hooks/Authorization/AuthContext';
import UserContext from '../../../hooks/UserContext'; // Подключаем UserContext

import {
    FaTruck,
    FaFileAlt,
    FaWallet,
    FaCreditCard,
    FaHeart,
    FaHandshake,
    FaReceipt,
} from 'react-icons/fa';

import IconSpanBtn from '../../common/IconSpanBtn/IconSpanBtn';
import Button from '../../common/Button/Button';

export const HoverUserCard = ({
    isHoveredIcon,
    iconCoordinates,
    windowWidth,
}) => {
    const { isAuthenticated, logout } = useContext(AuthContext);
    const { user } = useContext(UserContext); // Получаем состояние пользователя из контекста

    const [isHoveredCard, setIsHoveredCard] = useState(false);

    const handleMouseEnter = () => {
        setIsHoveredCard(true);
    };

    const handleMouseLeave = () => {
        setIsHoveredCard(false);
    };

    const handleExit = () => {
        logout();
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
                    {!isAuthenticated ? (
                        <div>
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
                    ) : (
                        <div className='user-hover-container'>
                            <Link to='/user-profile'>
                                <div
                                    className='huc-personal-data'
                                    onClick={handleMouseLeave}
                                >
                                    <div className='huc-user-photo-container '>
                                        <img
                                            src={
                                                user.userPhoto ||
                                                'https://via.placeholder.com/100'
                                            }
                                            alt='Фото пользователя'
                                            className='huc-user-photo'
                                            onClick={handleMouseLeave}
                                        />
                                    </div>
                                    <div className='huc-personal-info'>
                                        <p className='huc-user-name'>
                                            {user.userName}
                                        </p>

                                        <p className='huc-user-phone'>
                                            {user.userPhone}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                            <p className='huc-spacer'> </p>
                            <IconSpanBtn
                                icon={FaTruck}
                                title='Доставки'
                                onClick
                            />
                            <IconSpanBtn
                                icon={FaFileAlt}
                                title='Заявки'
                                onClick
                            />
                            <p className='huc-spacer'> </p>
                            <IconSpanBtn
                                icon={FaWallet}
                                title='Баланс 0 ₽'
                                onClick
                            />
                            <IconSpanBtn
                                icon={FaCreditCard}
                                title='Способы оплаты'
                                onClick
                            />
                            <p className='huc-spacer'> </p>
                            <IconSpanBtn
                                icon={FaHeart}
                                title='Избранное'
                                onClick
                            />
                            <IconSpanBtn
                                icon={FaHandshake}
                                title='Сделки'
                                onClick
                            />
                            <IconSpanBtn
                                icon={FaReceipt}
                                title='Чеки'
                                onClick
                            />
                            <p className='huc-spacer'> </p>
                            <p className='huc-section-name without-icon'>
                                Обращения и поддержка
                            </p>
                            <p className='huc-section-name without-icon'>
                                Отзывы и вопросы
                            </p>
                            <p className='huc-spacer hpc-last-spacer'> </p>
                            {/* <Link to='/'>
                                <p
                                    className='huc-section-name without-icon'
                                    onClick={handleExit}
                                >
                                    Выйти
                                </p>
                            </Link> */}
                            <Link to='/'>
                                <Button
                                    type='button'
                                    size_width='wide'
                                    size_height='medium'
                                    children='Выйти'
                                    onClick={handleExit}
                                />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
