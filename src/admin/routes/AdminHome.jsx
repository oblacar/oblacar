import React from "react";
import { CheckCircle, AlertTriangle, User, Truck, Bell } from "react-icons/fa";
// Если нет react-icons — скажи, заменю SVGами

export default function AdminHome() {

    // ==== FAKE DATA ====

    const tasks = [
        { id: 1, text: "Проверить новые жалобы", count: 3 },
        { id: 2, text: "Подтвердить документы перевозчиков", count: 1 },
        { id: 3, text: "Проверить подозрительные объявления", count: 2 },
        { id: 4, text: "Ответить на запросы поддержки", count: 1 },
    ];

    const events = [
        { id: 1, text: "Пользователь Sergey K. подал жалобу", icon: "⚠️" },
        { id: 2, text: "Создано 17 новых объявлений", icon: "🚚" },
        { id: 3, text: "Пользователь truckPro обновил документы", icon: "👤" },
        { id: 4, text: "2 пользователя запросили удаление аккаунта", icon: "👤" },
    ];

    const tools = [
        { id: 1, title: "Поиск пользователя", icon: "🔍" },
        { id: 2, title: "Поиск объявления", icon: "📄" },
        { id: 3, title: "Журнал действий", icon: "📘" },
        { id: 4, title: "Настройки платформы", icon: "⚙️" },
    ];

    const docs = [
        "Правила модерации объявлений",
        "Алгоритм действий при жалобе",
        "Гайд по работе администратора",
        "Контакты поддержки",
    ];


    return (
        <div className="admin-home-grid p-20">

            {/* block: welcome */}
            <div className="admin-card col-span-4">
                <div className="admin-card-header">
                    <h2 className="admin-card-title">Добро пожаловать в панель управления OBLACAR</h2>
                </div>
                <div className="admin-card-content">
                    <p>
                        Здесь вы можете управлять объявлениями, пользователями,
                        модерацией, жалобами и деятельностью перевозчиков.
                    </p>
                </div>
            </div>

            {/* block: tasks */}
            <div className="admin-card col-span-2">
                <div className="admin-card-header">
                    <h3 className="admin-card-title">Текущие задачи</h3>
                </div>
                <div className="admin-card-content">
                    <ul className="admin-list">
                        {tasks.map(t => (
                            <li key={t.id} className="admin-list-item">
                                {t.text}
                                <span className="admin-number">{t.count}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* block: events */}
            <div className="admin-card col-span-2">
                <div className="admin-card-header">
                    <h3 className="admin-card-title">Последние события</h3>
                </div>
                <div className="admin-card-content">
                    <ul className="admin-list">
                        {events.map(e => (
                            <li key={e.id} className="admin-list-item">
                                <span className="admin-emoji">{e.icon}</span>
                                {e.text}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* block: tools */}
            <div className="admin-card col-span-2">
                <div className="admin-card-header">
                    <h3 className="admin-card-title">Инструменты администратора</h3>
                </div>
                <div className="admin-card-content admin-tools-grid">
                    {tools.map(tool => (
                        <div key={tool.id} className="admin-tool">
                            <span className="admin-emoji">{tool.icon}</span>
                            {tool.title}
                        </div>
                    ))}
                </div>
            </div>

            {/* block: docs */}
            <div className="admin-card col-span-2">
                <div className="admin-card-header">
                    <h3 className="admin-card-title">Важные документы</h3>
                </div>
                <div className="admin-card-content">
                    <ul className="admin-docs">
                        {docs.map((d, idx) => (
                            <li key={idx}>{d}</li>
                        ))}
                    </ul>
                </div>
            </div>

        </div>
    );
}
