import React from 'react';
import { NavLink } from 'react-router-dom';


export default function Sidebar() {
    return (
        <aside className="admin-sidebar">
            <div className="admin-logo">oblacar • admin</div>
            <nav className="admin-nav">
                <NavLink to="/admin" end>Dashboard</NavLink>
                <NavLink to="/admin/ads">Объявления</NavLink>
                <NavLink to="/admin/users">Пользователи</NavLink>
                {/* будущее: <NavLink to="/admin/transportations">Транспортировки</NavLink> */}
                {/* будущее: <NavLink to="/admin/reports">Жалобы</NavLink> */}
                {/* ---- пробел / разделитель ---- */}
                <div style={{ height: 12 }} />

                <NavLink to="/admin/downloads">Downloads</NavLink>
            </nav>
        </aside>
    );
}