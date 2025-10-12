// src/admin/services/AdminUsersService.js
// Чтение/апдейты пользователей из Realtime DB с учётом твоего firebase.js

import { ref, get, update } from 'firebase/database';
import { db } from '../../firebase'; // <-- берём готовый db из src/firebase.js

const USERS_ROOT = 'users';

function normalizeDate(d) {
  if (!d) return '-';
  if (typeof d === 'string') {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toISOString().slice(0, 10);
  }
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d);
}

function applyTextFilter(rows, q) {
  if (!q) return rows;
  const s = q.toLowerCase();
  const fields = ['id', 'name', 'email', 'phone', 'role', 'status'];
  return rows.filter((r) =>
    fields.some((k) => String(r[k] ?? '').toLowerCase().includes(s))
  );
}
function applyStatusFilter(rows, status) {
  if (!status) return rows;
  return rows.filter((r) => r.status === status);
}

export const AdminUsersService = {
  /**
   * Список пользователей (клиентская фильтрация для простоты).
   * filters: { q?: string, status?: string }
   */
  async list(filters = {}) {
    const { q = '', status = '' } = filters;

    const snap = await get(ref(db, USERS_ROOT));
    if (!snap.exists()) return [];

    const obj = snap.val();
    const rows = Object.keys(obj).map((uid) => {
      const u = obj[uid] || {};
      return {
        id: uid,
        name: u.userName ?? '',
        email: u.userEmail ?? '',
        role: u.userRole ?? 'user',
        status: u.status ?? 'active',
        createdAt: normalizeDate(u.registrationDate),
        phone: u.userPhone ?? '',
        _raw: u,
      };
    });

    let out = applyTextFilter(rows, q);
    out = applyStatusFilter(out, status);
    return out;
  },

  async block(ids = []) {
    if (!ids.length) return;
    const updates = {};
    ids.forEach((id) => (updates[`${USERS_ROOT}/${id}/status`] = 'blocked'));
    await update(ref(db), updates);
  },

  async unblock(ids = []) {
    if (!ids.length) return;
    const updates = {};
    ids.forEach((id) => (updates[`${USERS_ROOT}/${id}/status`] = 'active'));
    await update(ref(db), updates);
  },

  async grantAdmin(ids = []) {
    if (!ids.length) return;
    const updates = {};
    ids.forEach((id) => (updates[`${USERS_ROOT}/${id}/userRole`] = 'admin'));
    await update(ref(db), updates);
  },

  async revokeAdmin(ids = []) {
    if (!ids.length) return;
    const updates = {};
    ids.forEach((id) => (updates[`${USERS_ROOT}/${id}/userRole`] = 'user'));
    await update(ref(db), updates);
  },
};
