export const AdminUsersService = {
    async list(filters) {
        // TODO: читать из Firebase с учётом filters
        return [
            { id: 'u1', name: 'Иван Петров', email: 'ivan@example.com', role: 'user', status: 'active', createdAt: '01.10.2025' },
            { id: 'u2', name: 'Администратор', email: 'admin@example.com', role: 'admin', status: 'active', createdAt: '15.09.2025' },
        ];
    },
    async block(ids) {
        console.log('block users', ids);
    },
    async unblock(ids) {
        console.log('unblock users', ids);
    },
    async grantAdmin(ids) {
        console.log('grant admin', ids);
    },
    async revokeAdmin(ids) {
        console.log('revoke admin', ids);
    },
};