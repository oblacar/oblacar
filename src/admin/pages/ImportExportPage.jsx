import React, { useState } from 'react';
import './ImportExportPage.css';

const tabs = [
    { id: 'users', label: 'Пользователи' },
    { id: 'ads', label: 'Объявления' },
    { id: 'requests', label: 'Запросы' },
];

export default function ImportExportPage() {
    const [activeTab, setActiveTab] = useState('users');
    const [selectedFile, setSelectedFile] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    return (
        <div className='ie-container'>
            <h1 className='ie-title'>Импорт / Экспорт данных</h1>
            <p className='ie-subtitle'>
                Инструменты резервного копирования и массового обновления
                данных.
            </p>

            {/* Tabs */}
            <div className='ie-tabs'>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`ie-tab-btn ${
                            activeTab === tab.id ? 'active' : ''
                        }`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className='ie-content'>
                {/* Export Section */}
                <section className='ie-section'>
                    <h2>Экспорт данных</h2>

                    <div className='ie-buttons'>
                        <button className='ie-btn'>Экспорт в Excel</button>
                        <button className='ie-btn'>Экспорт в CSV</button>
                        <button className='ie-btn'>Экспорт в PDF</button>
                    </div>
                </section>

                {/* Import Section */}
                <section className='ie-section'>
                    <h2>Импорт данных</h2>

                    <div className='ie-import-block'>
                        <input
                            type='file'
                            accept='.xlsx,.csv'
                            onChange={handleFileChange}
                        />

                        {selectedFile && (
                            <div className='ie-file-info'>
                                Выбран файл:{' '}
                                <strong>{selectedFile.name}</strong>
                            </div>
                        )}

                        <button
                            className='ie-btn'
                            disabled={!selectedFile}
                            onClick={() => setShowPreview(true)}
                        >
                            Предпросмотр
                        </button>
                    </div>
                </section>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className='ie-modal-backdrop'>
                    <div className='ie-modal'>
                        <h3>Предпросмотр файла</h3>
                        <p>Функционал предпросмотра будет добавлен позже.</p>

                        <div className='ie-modal-buttons'>
                            <button
                                className='ie-btn'
                                onClick={() => setShowPreview(false)}
                            >
                                Закрыть
                            </button>
                            <button className='ie-btn ie-btn-primary'>
                                Импортировать
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
