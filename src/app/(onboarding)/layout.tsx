import { loginLayoutContainer } from './layout.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={loginLayoutContainer}>
      {children}
    </div>
  );
}
