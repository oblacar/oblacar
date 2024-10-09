// src/models/User.js

class User {
    constructor(
        userId,
        userPhoto,
        userName,
        userEmail,
        userPhone,
        userAbout,
        userPassword,
        registrationDate = new Date(),
        firebaseToken = null
    ) {
        this.userId = userId; // Уникальный идентификатор пользователя
        this.userPhoto = userPhoto; // URL фото пользователя
        this.userName = userName; // Имя пользователя
        this.userEmail = userEmail; // Электронная почта пользователя
        this.userPhone = userPhone; // Телефон пользователя
        this.userAbout = userAbout; // Дополнительная информация о пользователе
        this.userPassword = userPassword; // Пароль пользователя (хранить зашифрованным)
        this.registrationDate = registrationDate; // Дата регистрации пользователя
        this.firebaseToken = firebaseToken; // Токен аутентификации Firebase
    }
}

export default User;
