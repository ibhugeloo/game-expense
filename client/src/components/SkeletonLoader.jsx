import React from 'react';

/**
 * Skeleton loaders for dashboard loading state.
 * Replaces the basic spinner with visual placeholders.
 */

export const SkeletonStats = () => (
    <div className="stats-grid">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card skeleton-card">
                <div className="skeleton skeleton-text" style={{ width: '60%', height: '14px' }} />
                <div className="skeleton skeleton-text" style={{ width: '40%', height: '28px', marginTop: '0.75rem' }} />
                <div className="skeleton skeleton-text" style={{ width: '50%', height: '12px', marginTop: '0.5rem' }} />
            </div>
        ))}
    </div>
);

export const SkeletonChart = () => (
    <div className="chart-grid">
        {[...Array(2)].map((_, i) => (
            <div key={i} className="glass-panel skeleton-card" style={{ padding: '1.5rem', minHeight: '250px' }}>
                <div className="skeleton skeleton-text" style={{ width: '45%', height: '16px', marginBottom: '1.5rem' }} />
                <div className="skeleton" style={{ width: '100%', height: '180px', borderRadius: 'var(--radius-sm)' }} />
            </div>
        ))}
    </div>
);

export const SkeletonTable = () => (
    <div className="glass-panel" style={{ padding: '1rem' }}>
        <div className="skeleton skeleton-text" style={{ width: '30%', height: '16px', marginBottom: '1rem' }} />
        {[...Array(5)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid var(--card-border)' }}>
                <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div className="skeleton skeleton-text" style={{ width: `${60 + Math.random() * 30}%`, height: '14px' }} />
                    <div className="skeleton skeleton-text" style={{ width: '30%', height: '12px' }} />
                </div>
                <div className="skeleton skeleton-text" style={{ width: '60px', height: '14px' }} />
            </div>
        ))}
    </div>
);
