export default function Avatar({ user, size = 'md' }) {
    const bg = user?.avatar?.startsWith('http') ? null : 'var(--accent)';
    const sizeClass = `avatar avatar-${size}`;
    const initial = user?.name?.[0]?.toUpperCase() || '?';

    if (user?.avatar?.startsWith('http')) {
        return (
            <img
                src={user.avatar}
                alt={user.name}
                className={sizeClass}
                style={{ background: 'var(--bg-hover)' }}
                onError={(e) => { e.target.style.display = 'none'; }}
            />
        );
    }
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b'];
    const colorIdx = user?.name ? user.name.charCodeAt(0) % colors.length : 0;
    return (
        <div className={sizeClass} style={{ background: colors[colorIdx], color: '#fff' }}>
            {initial}
        </div>
    );
}
