import React from 'react';
import './ErrorText.css'; // Подключаем стили для ErrorText

const ErrorText = ({ error }) => {
    return (
        <>
            {error ? (
                <div>
                    <span className='error-text'>{error}</span>
                </div>
            ) : null}
        </>
    );
};

export default ErrorText;
