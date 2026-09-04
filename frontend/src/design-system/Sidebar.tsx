import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessMenu } from '../lib/canAccessMenu';
import { MENU_ITEMS } from '../lib/menuConfig';

// Ports .sidebar / .brand / .nav-item / .sidebar-foot / .role-badge from the
// demo's stylesheet §7. The 3D hover flourishes in the original CSS
// (perspective transforms on .nav-item) are intentionally left out of this
// port — same visual language, simpler implementation.
export function Sidebar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  // The list is already filtered against the SAME canAccessMenu() the
  // backend enforces — nothing here is ever hidden for a reason the API
  // wouldn't also reject.
  const visible = MENU_ITEMS.filter((item) => canAccessMenu(user, item.key));

  return (
    <aside className="flex h-screen w-sidebar shrink-0 flex-col bg-ink text-[#D0D8E2]">
      <div className="border-b border-white/10 px-5 pb-[18px] pt-[22px]">
        <div className="font-serif text-xl font-bold text-white">
          Expense<span className="text-gold">Easy</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 pt-4">
        <div className="px-2.5 pb-2 text-[10px] uppercase tracking-widest text-slate-light">Menu</div>
        {visible.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            className={({ isActive }) =>
              `mb-px flex items-center gap-2 rounded border-l-2 px-2.5 py-[9px] text-[13px] transition-colors ${
                isActive
                  ? 'border-gold bg-gold/[0.14] text-white'
                  : 'border-transparent text-[#BBC5CF] hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <span className="w-[18px] shrink-0 font-mono text-[10px] text-slate-light">{item.num}</span>
            {item.label}
          </NavLink>
        ))}
        {visible.length === 0 && (
          <div className="px-2.5 py-6 text-[13px] text-slate-light">No modules available for your role.</div>
        )}
      </nav>

      <div className="mt-auto border-t border-white/10 px-4 py-3.5">
        <div className="text-[13px] font-semibold text-white">{user.email}</div>
        <div className="mt-1.5 inline-block rounded-full bg-gold/[0.16] px-2 py-0.5 text-[10px] font-bold tracking-wider text-gold">
          {user.roles.join(', ') || 'NO ROLE'}
        </div>
        <button onClick={logout} className="mt-3 block text-[11px] text-slate-light hover:text-white">
          Sign out
        </button>
      </div>
    </aside>
  );
}
