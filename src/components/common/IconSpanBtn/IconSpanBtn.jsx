/**
 * Компонент IconSpanBtn.
 *
 * Описание: Компонент ссылка/кнопка: иконка (слева) и текст (справа).
 *
 * Props:
 * - icon: иконка, например, из коллекции import {FaTruck} from 'react-icons/fa'.
 * - title: текст / заголовок.
 *
 * Пример использования:
 *    <IconSpanBtn icon={FaTruck}  title='Доставки' />
 *
 * Автор: Черепанов Максим
 * Дата: 12 октября 2022
 */

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
