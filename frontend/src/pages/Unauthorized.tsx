import { Link } from 'react-router-dom';

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper text-center">
      <div className="font-serif text-2xl font-semibold text-ink">403 — Access denied</div>
      <p className="max-w-sm text-sm text-slate">
        Your account doesn't have permission to view this module. If you think this is wrong, contact your admin.
      </p>
      <Link to="/" className="text-sm font-medium text-gold hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
