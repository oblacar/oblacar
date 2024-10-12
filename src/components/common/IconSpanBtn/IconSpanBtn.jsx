// Иконка и текст - кнопка
import React from 'react';
import './IconSpanBtn.css'; // Импорт стилей

function IconSpanBtn({ icon: Icon, title, onClick }) {
    return (
        <div className='icon-text-container'>
            <div className='icon'>
                <Icon />
            </div>
            <span>{title}</span>
        </div>
    );
}

export default IconSpanBtn;
