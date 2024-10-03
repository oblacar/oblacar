// src/entities/User/User.js

class User {
    constructor(
        id,
        firstName,
        lastName,
        email,
        password,
        role,
        registrationDate,
        profilePicture = null,
        additionalInfo = {}
    ) {
        this.id = id; // Уникальный идентификатор
        this.firstName = firstName; // Имя
        this.lastName = lastName; // Фамилия
        this.email = email; // Электронная почта
        this.password = password; // Пароль (хранить зашифрованным)
        this.role = role; // Роль (владелец транспорта, владелец груза и т.д.)
        this.registrationDate = registrationDate; // Дата регистрации
        this.profilePicture = profilePicture; // URL фото профиля
        this.additionalInfo = additionalInfo; // Дополнительные данные (например, адрес, телефон)
    }
}

export default User;
