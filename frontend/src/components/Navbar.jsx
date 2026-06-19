import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LogOutIcon, TicketIcon } from './icons.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `rounded-pill px-3.5 py-1.5 text-sm font-medium transition-colors ${
      isActive ? 'bg-mist text-ink' : 'text-muted hover:bg-mist hover:text-ink'
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-white/85 backdrop-blur-md">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" aria-label="EventHub home">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-ink text-white">
            <TicketIcon className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-ink">
            Event<span className="text-muted">Hub</span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <NavLink to="/" className={linkClass} end>
            Events
          </NavLink>

          {user ? (
            <>
              {user.role === 'admin' ? (
                <NavLink to="/admin" className={linkClass}>
                  Manage
                </NavLink>
              ) : (
                <NavLink to="/my-bookings" className={linkClass}>
                  My Bookings
                </NavLink>
              )}

              <div className="mx-1 hidden h-6 w-px bg-ink/10 sm:block" />

              <span className="hidden items-center gap-2 pl-1 pr-2 sm:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mist text-sm font-semibold text-ink">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className="text-sm font-medium text-ink">{user.name}</span>
              </span>

              <button onClick={handleLogout} className="btn-secondary px-3 py-1.5" aria-label="Log out">
                <LogOutIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <Link to="/register" className="btn-primary px-4 py-1.5">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
