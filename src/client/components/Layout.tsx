import { Link, Outlet, useLocation } from 'react-router-dom';

export function Layout() {
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Dashboard', exact: true },
    { to: '/tasks', label: 'Tasks', exact: false },
    { to: '/tasks/new', label: 'New Task', exact: true },
  ];

  const isActive = (to: string, exact: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname === to || (to !== '/' && location.pathname.startsWith(to) && to !== '/tasks/new');
  };

  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="app-header">
        <div className="header-inner">
          <Link to="/" className="logo">
            <span aria-hidden="true">🎯</span> AI Learning Dashboard
          </Link>
          <nav className="main-nav" aria-label="Main navigation">
            {navItems.map(({ to, label, exact }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link ${isActive(to, exact) ? 'active' : ''}`}
                aria-current={isActive(to, exact) ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main id="main-content" className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <p>AI Practical Assessment — Project Tracker</p>
      </footer>
    </div>
  );
}
