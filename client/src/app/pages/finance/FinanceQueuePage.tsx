import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ClipboardList, ShieldAlert } from 'lucide-react';
import { API_URL } from '../../config';
import { useUserContext } from '../../context/UserContext';

export default function FinanceQueuePage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const navigate = useNavigate();
  const { currentUser } = useUserContext();

  const isFinanceUser =
    currentUser.roleCode === 'FINANCE_MEMBER' ||
    currentUser.roleCode === 'FINANCE_SUPERVISOR' ||
    currentUser.roleCode === 'ADMIN';

  useEffect(() => {
    if (!isFinanceUser) return;

    fetch(`${API_URL}/finance/tasks`)
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((error) => {
        console.error('Error loading finance tasks:', error);
      });
  }, [isFinanceUser]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'outline';
      case 'ASSIGNED':
        return 'secondary';
      case 'COMPLETED':
        return 'default';
      default:
        return 'outline';
    }
  };

  if (!isFinanceUser) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Finance Task Queue</CardTitle>
            <CardDescription>
              Manage and process incoming claims assigned to finance.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-6">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-800">
                    Access Restricted
                  </p>
                  <p className="mt-1 text-sm text-amber-700">
                    You are currently signed in as{' '}
                    <span className="font-medium">{currentUser.fullName}</span> (
                    {currentUser.roleCode}).
                  </p>
                  <p className="mt-2 text-sm text-amber-700">
                    Only finance users can access the finance queue.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Finance Task Queue</CardTitle>
          <CardDescription>
            Manage and process incoming claims assigned to finance.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {tasks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-slate-500" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">No tasks available</p>
                  <p className="text-sm text-slate-500">
                    New finance tasks will appear here.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            tasks.map((t: any) => (
              <div
                key={t.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          Task #{t.id}
                        </p>
                        <p className="text-sm text-slate-500">
                          Claim ID: {t.claim_id}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Status
                      </p>
                      <div className="mt-1">
                        <Badge variant={getStatusVariant(t.status) as any}>
                          {t.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Button onClick={() => navigate(`/finance/tasks/${t.id}`)}>
                      Open Task
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}