'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRoot() {
    const router = useRouter();

    useEffect(() => {
        router.push('/characters');
    }, [router]);

    return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <p>Redirecting to characters...</p>
        </div>
    );
}
