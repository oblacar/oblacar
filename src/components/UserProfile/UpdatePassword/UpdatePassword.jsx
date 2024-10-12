import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { userService } from '../../../services/UserService'; // Импортируем UserService
import './UpdatePassword.css'; // Импортируем стили
import Button from '../../common/Button/Button';

const UpdatePassword = ({ onCancel }) => {
    // const [isPassworsSuccesChanged, setSuccessMessage] = useState(''); // Добавляем состояние для сообщения об успехе
    const [isPasswordChangedSuccess, setIsPasswordChangedSuccess] =
        useState(false);

    const formik = useFormik({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        validationSchema: Yup.object({
            currentPassword: Yup.string().required('Введите старый пароль'),
            newPassword: Yup.string()
                .min(6, 'Пароль должен содержать минимум 6 символов')
                .required('Введите новый пароль'),
            confirmPassword: Yup.string()
                .oneOf(
                    [Yup.ref('newPassword'), null],
                    'Пароли должны совпадать'
                )
                .required('Подтверждение пароля обязательно'),
        }),
        onSubmit: async (values) => {
            try {
                // Получаем текущий email пользователя
                const email = userService.getCurrentUserEmail();

                // Проверяем старый пароль
                await userService.loginUser({
                    email,
                    password: values.currentPassword, // Используем введённый старый пароль
                });

                // Если старый пароль правильный, меняем на новый
                await userService.changeUserPassword(values.newPassword);

                // Обновляем состояние и показываем сообщение об успешной смене пароля
                setIsPasswordChangedSuccess(true);

                formik.resetForm(); // Сбрасываем форму после успешной смены пароля
                // onCancel(); // Вызываем onCancel, чтобы выйти из режима редактирования
            } catch (error) {
                switch (error.code) {
                    case 'auth/wrong-password':
                        formik.setErrors({
                            currentPassword: 'Неверный пароль.',
                        });
                        break;
                    case 'auth/invalid-credential':
                        formik.setErrors({
                            currentPassword:
                                'Неверный пароль. Попробуйте еще раз.',
                        });
                        break;
                    case 'auth/too-many-requests':
                        formik.setErrors({
                            general:
                                'Слишком много попыток. Пожалуйста, подождите некоторое время и попробуйте снова.',
                        });
                        break;
                    default:
                        formik.setErrors({
                            general:
                                'Ошибка при изменении пароля: ' + error.message,
                        });
                        break;
                }
            }
        },
    });

    return (
        <>
            <div className='update-password-container'>
                <h2>Изменение пароля</h2>

                {isPasswordChangedSuccess && (
                    <div className='success-message'>
                        Пароль успешно изменен.
                    </div>
                )}

                <form onSubmit={formik.handleSubmit}>
                    <div>
                        <label
                            className='label-for-input'
                            htmlFor='currentPassword'
                        >
                            Старый пароль
                        </label>
                        <input
                            id='currentPassword'
                            name='currentPassword'
                            type='password'
                            className='input-field'
                            value={formik.values.currentPassword}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder='Введите старый пароль'
                            onClick={() => setIsPasswordChangedSuccess(false)}
                        />
                        {/* Отображаем сообщение об ошибке, если старый пароль неверный */}
                        {formik.touched.currentPassword &&
                        formik.errors.currentPassword ? (
                            <div className='error'>
                                {formik.errors.currentPassword}
                            </div>
                        ) : null}
                    </div>
                    <div>
                        <label
                            className='label-for-input'
                            htmlFor='newPassword'
                        >
                            Новый пароль
                        </label>
                        <input
                            id='newPassword'
                            name='newPassword'
                            type='password'
                            className='input-field'
                            value={formik.values.newPassword}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder='Введите новый пароль'
                            onClick={() => setIsPasswordChangedSuccess(false)}
                        />
                        {formik.touched.newPassword &&
                        formik.errors.newPassword ? (
                            <div className='error'>
                                {formik.errors.newPassword}
                            </div>
                        ) : null}
                    </div>
                    <div>
                        <label
                            className='label-for-input'
                            htmlFor='confirmPassword'
                        >
                            Подтверждение пароля
                        </label>
                        <input
                            id='confirmPassword'
                            name='confirmPassword'
                            type='password'
                            className='input-field'
                            value={formik.values.confirmPassword}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder='Подтвердите новый пароль'
                            onClick={() => setIsPasswordChangedSuccess(false)}
                        />
                        {formik.touched.confirmPassword &&
                        formik.errors.confirmPassword ? (
                            <div className='error'>
                                {formik.errors.confirmPassword}
                            </div>
                        ) : null}
                    </div>
                    {formik.errors.general && (
                        <div className='error'>{formik.errors.general}</div>
                    )}
                    <div className='button-container'>
                        <Button
                            type='submit'
                            type_btn='yes'
                            size_width=''
                            size_height='medium'
                            children='Сохранить'
                            // onClick={onCancel}
                        />

                        <Button
                            type='button'
                            // type_btn='no'
                            size_width=''
                            size_height='medium'
                            children='Закрыть'
                            onClick={() => {
                                setIsPasswordChangedSuccess(false);
                                onCancel();
                            }}
                        />
                    </div>
                </form>
            </div>
        </>
    );
};

export default UpdatePassword;
