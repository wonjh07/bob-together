import * as styles from './layout.css';

export default function DashboardPlainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={styles.layoutContainer}>{children}</div>;
}
