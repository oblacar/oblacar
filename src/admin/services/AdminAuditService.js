export const AdminAuditService = {
    async log(action, payload) {
        // TODO: записать лог в /adminAuditLogs/{ts}_{uid}
        console.log('[AUDIT]', action, payload);
    },
};