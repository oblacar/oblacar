export const AdminStatsService = {
    async getOverview() {
        // TODO: собрать агрегаты из БД
        return {
            usersWeek: 0,
            adsActive: 0,
            transportationsActive: 0,
            reportsNew: 0,
        };
    },
};