import * as styles from './layout.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={styles.dashboardContainer}>{children}</div>;
}
