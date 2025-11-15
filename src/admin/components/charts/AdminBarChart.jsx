import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from 'recharts';

export default function AdminBarChart({ data, xKey, yKey, title }) {
    return (
        <div className="chart-card">
            <h3>{title}</h3>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={xKey} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey={yKey} fill="#10b981" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
