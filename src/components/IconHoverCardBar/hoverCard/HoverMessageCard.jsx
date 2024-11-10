import { useContext, useState } from 'react';
import { setTopLeftHover } from './hoverCardFunctions';
import './hoverCard.css'; // Создайте файл стилей HoverCard.css

import UserContext from '../../../hooks/UserContext';
import ConversationContext from '../../../hooks/ConversationContext';

export const HoverMessageCard = ({
    isHoveredIcon,
    iconCoordinates,
    windowWidth,
}) => {
    const { isUserLoaded } = useContext(UserContext);
    const { unreadMessages } = useContext(ConversationContext);
    const [isHoveredCard, setIsHoveredCard] = useState(false);

    const handleMouseEnter = () => {
        setIsHoveredCard(true);
    };

    const handleMouseLeave = () => {
        setIsHoveredCard(false);
    };
    return (
        <>
            {isUserLoaded ? (
                <div
                    className={`hover-card ${
                        isHoveredIcon || isHoveredCard ? 'visible' : ''
                    }`}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    style={setTopLeftHover(iconCoordinates, windowWidth)}
                >
                    <div className='hover-card-content '>
                        <p className='hover-card-title'>Сообщения</p>
                        <span>{unreadMessages.length} новых сообщений</span>
                        <p>
                            Чтобы ознакомится с ними, пройдите в раздел
                            Сообщения, где вы сможете продолжить диалоги с вами
                            собеседниками
                        </p>
                    </div>
                </div>
            ) : (
                <div
                    className={`hover-card ${
                        isHoveredIcon || isHoveredCard ? 'visible' : ''
                    }`}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    style={setTopLeftHover(iconCoordinates, windowWidth)}
                >
                    <div className='hover-card-content '>
                        <p className='hover-card-title'>Сообщения</p>
                        <span>{0}</span> новых
                        <p>
                            Войдите в систему, чтобы посмотреть свои сообщения{' '}
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};
