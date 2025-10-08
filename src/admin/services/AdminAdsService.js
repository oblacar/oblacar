// Заглушки под Realtime DB. Подключи свои ссылки/индексы.
export const AdminAdsService = {
    async list(filters) {
        // TODO: читать из Firebase с учётом filters.q, filters.status
        // Возвращаем демо-данные
        return [
            { id: 'ad1', type: 'transport', owner: 'userA', route: 'NSK → MOW', date: '12.10.2025', status: 'active' },
            { id: 'ad2', type: 'cargo', owner: 'userB', route: 'SPB → KZN', date: '14.10.2025', status: 'hidden' },
        ];
    },
    async hide(ids) {
        // TODO: batch update status=hidden
        console.log('hide ads', ids);
    },
    async softDelete(ids) {
        // TODO: batch update status=deleted (soft-delete)
        console.log('delete ads', ids);
    },
    async restore(ids) {
        // TODO: batch update status=active
        console.log('restore ads', ids);
    },
};