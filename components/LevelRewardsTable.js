'use client';
import { useState, useEffect } from 'react';

const LevelRewardsTable = () => {
    const [rewards, setRewards] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRewards = async () => {
            try {
                const res = await fetch('/api/ledger/level-rewards');
                if (!res.ok) {
                    throw new Error('Failed to fetch rewards');
                }
                const data = await res.json();
                setRewards(data.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRewards();
    }, []);

    if (loading) return <p>Loading rewards...</p>;
    if (error) return <p>Error: {error}</p>;

    const dates = Object.keys(rewards).sort((a, b) => new Date(b) - new Date(a));

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Daily Reward Logs</h1>
            {dates.length === 0 ? (
                <p>No reward logs found.</p>
            ) : (
                <div className="space-y-4">
                    {dates.map(date => (
                        <div key={date} className="p-4 border rounded-lg shadow">
                            <h2 className="text-lg font-semibold mb-2">{new Date(date).toDateString()}</h2>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {rewards[date].map(reward => (
                                        <tr key={reward._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">{reward.rewardType}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{parseFloat(reward.amount.toString()).toFixed(6)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LevelRewardsTable; 
