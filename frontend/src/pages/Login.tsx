import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../design-system';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch {
      setError('Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: 'radial-gradient(circle at 30% 20%, #2A3645 0%, #1B2430 60%)' }}
    >
      <div className="w-full max-w-[400px] rounded border border-line bg-white/[0.97] p-9 shadow-[0_20px_56px_rgba(0,0,0,0.38)] backdrop-blur">
        <div className="font-serif text-2xl font-bold text-ink">
          Expense<span className="text-gold">Easy</span>
        </div>
        <div className="mb-1.5 mt-1 text-[11px] uppercase tracking-wider text-slate">Sign in to continue</div>
        <hr className="my-5 border-line" />

        <form onSubmit={onSubmit} className="space-y-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11.5px] font-semibold text-slate">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded border-[1.5px] border-line px-3.5 py-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
              placeholder="you@company.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11.5px] font-semibold text-slate">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded border-[1.5px] border-line px-3.5 py-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
              placeholder="••••••••"
            />
          </div>
          {error && <div className="text-[13px] text-red">{error}</div>}
          <Button type="submit" variant="gold" disabled={submitting} className="w-full justify-center">
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
