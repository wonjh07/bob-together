import AppointmentCreateClient from './AppointmentCreateClient';
import { page, panel } from './page.css';

export default function AppointmentCreatePage() {
  return (
    <div className={page}>
      <div className={panel}>
        <AppointmentCreateClient />
      </div>
    </div>
  );
}
