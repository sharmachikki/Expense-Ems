import { TopBar, KpiRow, KpiCard } from '../design-system';
import { useAuth } from '../context/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();
  return (
    <>
      <TopBar title="Dashboard" meta={`Signed in as ${user?.email}`} />
      <div className="px-8 py-7">
        <KpiRow>
          <KpiCard label="Pending Approvals" value="0" />
          <KpiCard label="This Month's Expenses" value="₹0" />
          <KpiCard label="Open Disputes" value="0" delta="0 vs last month" />
          <KpiCard label="Avg. Approval Time" value="—" />
        </KpiRow>
        <p className="text-sm text-slate">
          This is a scaffold dashboard. Wire up real KPI queries against the Expense/Approval modules next.
        </p>
      </div>
    </>
  );
}
