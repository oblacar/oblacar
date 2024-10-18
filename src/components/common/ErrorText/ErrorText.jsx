import React from 'react';
import './ErrorText.css'; // Подключаем стили для ErrorText

const ErrorText = ({ errorMessage }) => {
    return (
        <>
            {errorMessage ? (
                <div>
                    <span className='error-text'>{errorMessage}</span>
                </div>
            ) : null}
        </>
    );
};

export default ErrorText;
