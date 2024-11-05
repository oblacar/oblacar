// src/utils/formatTimestamp.js
export function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();
    const isYesterday =
        new Date(now - 86400000).toDateString() === date.toDateString(); // 86400000 ms = 1 день

    if (isToday) {
        // Форматируем только часы и минуты для сегодняшних сообщений
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    } else if (isYesterday) {
        // Для вчерашних сообщений добавляем текст "Вчера" и время
        return `Вчера, ${date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        })}`;
    } else {
        // Для более старых сообщений возвращаем дату и время
        return (
            date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
            }) +
            ' ' +
            date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );
    }
}
