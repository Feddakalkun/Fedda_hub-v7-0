import TabNavigation from '@/components/navigation/TabNavigation';
import styles from './layout.module.css';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.dashboard}>
            <TabNavigation />

            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}

