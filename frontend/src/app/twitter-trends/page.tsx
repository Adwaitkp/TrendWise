"use client";

import React, { useEffect, useState } from 'react';

const TwitterTrendsPage = () => {
  const [trends, setTrends] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await fetch('/api/crawler/twitter-trends');
        const data = await res.json();
        if (data.trends) {
          setTrends(data.trends);
        } else {
          setError('No trends found');
        }
      } catch {
        setError('Failed to fetch Twitter trends');
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
      <h1>Twitter Trending Topics</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <ul>
          {trends.map((trend, idx) => (
            <li key={idx} style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>{trend}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TwitterTrendsPage; 