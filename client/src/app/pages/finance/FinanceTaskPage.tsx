import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { API_URL } from '../../config';

export default function FinanceTaskPage() {
  const { taskId } = useParams();
  const [taskData, setTaskData] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/finance/tasks/${taskId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log('TASK DATA:', data);
        setTaskData(data);
      });
  }, [taskId]);

  const action = async (type: string) => {
    await fetch(`${API_URL}/finance/tasks/${taskId}/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 1,
        comment: 'Test action',
      }),
    });

    alert(type + ' done');
  };

  if (!taskData) return <div className="p-6">Loading...</div>;

  const status = taskData.task.status;
  const isCompleted = status === 'COMPLETED';
  const isAssigned = status === 'ASSIGNED';
  const isPending = status === 'PENDING';

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT SIDE */}
      <div className="lg:col-span-2 space-y-6">
        {/* TASK HEADER */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Task #{taskData.task.id}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Claim ID
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {taskData.task.claim_id}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Outcome
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {taskData.task.outcome || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CLAIM INFO */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Claim Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Reference
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {taskData.claim.reference_number}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Claim Status
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {taskData.claim.status}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Decision Comment
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {taskData.claim.decision_comment || '-'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CUSTOMER */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Name
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {taskData.details?.full_name || '-'}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Policy Number
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {taskData.details?.policy_number || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* HISTORY */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {taskData.history?.length > 0 ? (
              taskData.history.map((item: any) => (
                <div
                  key={item.id}
                  className="border border-slate-200 rounded-lg p-4 bg-slate-50"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">{item.action}</p>
                      <p className="text-sm text-slate-600">
                        By: {item.action_by_name || item.action_by}
                      </p>
                      <p className="text-sm text-slate-700">{item.comment || '-'}</p>
                    </div>

                    <div className="text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No history available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RIGHT SIDE */}
      <div className="space-y-6">
        {/* STATUS PANEL */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Task Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Current Status
              </p>
              <div className="mt-2">
                <Badge variant={getStatusVariant(taskData.task.status) as any}>
                  {taskData.task.status}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Outcome
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {taskData.task.outcome || '-'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ACTIONS PANEL */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => action('claim')}
              disabled={!isPending}
              className="w-full"
            >
              Claim
            </Button>

            <Button
              onClick={() => action('release')}
              disabled={!isAssigned || isCompleted}
              variant="outline"
              className="w-full"
            >
              Release
            </Button>

            <Button
              onClick={() => action('accept')}
              disabled={!isAssigned || isCompleted}
              className="w-full"
            >
              Accept
            </Button>

            <Button
              onClick={() => action('return')}
              disabled={!isAssigned || isCompleted}
              variant="secondary"
              className="w-full"
            >
              Return
            </Button>

            <Button
              onClick={() => action('reject')}
              disabled={!isAssigned || isCompleted}
              variant="destructive"
              className="w-full"
            >
              Reject
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}