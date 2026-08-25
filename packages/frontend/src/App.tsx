import { StaffLayout, useHashRoute } from './lib/routing';
import { ClientsPage } from './pages/ClientsPage';
import { BookingsPage } from './pages/BookingsPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { PublicBookPage } from './pages/PublicBookPage';

export function App() {
  const route = useHashRoute();

  if (route === 'book') {
    return <PublicBookPage />;
  }

  return (
    <StaffLayout route={route}>
      {route === 'clients' && <ClientsPage />}
      {route === 'bookings' && <BookingsPage />}
      {route === 'invoices' && <InvoicesPage />}
    </StaffLayout>
  );
}
