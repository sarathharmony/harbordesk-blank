import { ReactNode, useEffect, useState } from 'react';

export type Route = 'clients' | 'bookings' | 'invoices' | 'book';

export function getRoute(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '') || 'bookings';
  if (
    hash === 'clients' ||
    hash === 'bookings' ||
    hash === 'invoices' ||
    hash === 'book'
  ) {
    return hash;
  }
  return 'bookings';
}

export function navigate(route: Route): void {
  window.location.hash = `#/${route}`;
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(getRoute);

  useEffect(() => {
    const onChange = () => setRoute(getRoute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}

export function StaffLayout({
  route,
  children,
}: {
  route: Route;
  children: ReactNode;
}) {
  const links: { route: Route; label: string }[] = [
    { route: 'clients', label: 'Clients' },
    { route: 'bookings', label: 'Bookings' },
    { route: 'invoices', label: 'Invoices' },
  ];

  return (
    <div className="layout">
      <header className="layout__header">
        <div className="layout__brand">
          <span className="layout__logo" aria-hidden="true">
            ◉
          </span>
          <div>
            <h1 className="layout__title">HarborDesk</h1>
            <p className="layout__tagline">Studio booking & invoicing</p>
          </div>
        </div>
        <nav className="layout__nav" aria-label="Main">
          {links.map((link) => (
            <a
              key={link.route}
              href={`#/${link.route}`}
              className={`layout__nav-link${route === link.route ? ' layout__nav-link--active' : ''}`}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </header>
      <main className="layout__main">{children}</main>
    </div>
  );
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function groupByDay<T extends { start: string }>(
  items: T[],
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const day = item.start.slice(0, 10);
    const list = groups.get(day) ?? [];
    list.push(item);
    groups.set(day, list);
  }
  return new Map([...groups.entries()].sort(([a], [b]) => a.localeCompare(b)));
}
