import React from 'react';


export default function StatCard({ title, value }) {
    return (
        <div className="stat-card">
            <div className="stat-title">{title}</div>
            <div className="stat-value">{value}</div>
        </div>
    );
}