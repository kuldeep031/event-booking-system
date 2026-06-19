import { Link } from 'react-router-dom';
import { TicketIcon } from './icons.jsx';

// Centered, branded shell shared by the Login and Register pages.
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto flex max-w-md animate-fade-up flex-col items-center py-6">
      <Link to="/" className="mb-6 flex items-center gap-2.5" aria-label="EventHub home">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-white">
          <TicketIcon className="h-5 w-5" />
        </span>
        <span className="font-display text-xl font-extrabold tracking-tight text-ink">
          Event<span className="text-muted">Hub</span>
        </span>
      </Link>

      <div className="card w-full p-8">
        <h1 className="font-display text-2xl font-extrabold text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>

      {footer && <p className="mt-5 text-center text-sm text-muted">{footer}</p>}
    </div>
  );
}
