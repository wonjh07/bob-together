import { dashboardContainer } from './layout.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={dashboardContainer}>{children}</div>;
}
