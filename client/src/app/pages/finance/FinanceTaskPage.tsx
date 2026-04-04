import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { API_URL } from '../../config';

export default function FinanceTaskPage() {
  const { taskId } = useParams();
  const [taskData, setTaskData] = useState<any>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const loadTask = async () => {
    try {
      const res = await fetch(`${API_URL}/finance/tasks/${taskId}`);
      const data = await res.json();
      console.log('TASK DATA:', data);
      setTaskData(data);
    } catch (error) {
      console.error('Error loading task:', error);
      alert('Could not load task data.');
    }
  };

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const getActionPayload = (type: string) => {
    if (type === 'claim') {
      const confirmed = window.confirm('Are you sure you want to claim this task?');
      if (!confirmed) return null;

      return {
        userId: 1,
        comment: 'Task claimed by finance user',
      };
    }

    if (type === 'release') {
      const confirmed = window.confirm('Are you sure you want to release this task back to the queue?');
      if (!confirmed) return null;

      return {
        userId: 1,
        comment: 'Task released back to queue',
      };
    }

    if (type === 'accept') {
      const confirmed = window.confirm('Are you sure you want to accept this claim?');
      if (!confirmed) return null;

      const comment = window.prompt('Optional comment for acceptance:', 'Finance approved') || '';

      return {
        userId: 1,
        comment,
      };
    }

    if (type === 'return') {
      const comment = window.prompt('Return reason is required. Please enter the reason:');
      if (!comment || !comment.trim()) {
        alert('Return reason is required.');
        return null;
      }

      const confirmed = window.confirm('Are you sure you want to return this claim?');
      if (!confirmed) return null;

      return {
        userId: 1,
        comment: comment.trim(),
      };
    }

    if (type === 'reject') {
      const comment = window.prompt('Rejection reason is required. Please enter the reason:');
      if (!comment || !comment.trim()) {
        alert('Rejection reason is required.');
        return null;
      }

      const confirmed = window.confirm('Are you sure you want to reject this claim?');
      if (!confirmed) return null;

      return {
        userId: 1,
        comment: comment.trim(),
      };
    }

    return null;
  };

  const action = async (type: string) => {
    const payload = getActionPayload(type);
    if (!payload) return;

    try {
      setLoadingAction(type);

      const res = await fetch(`${API_URL}/finance/tasks/${taskId}/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Failed to ${type} task`);
      }

      await loadTask();
      alert(`${type} completed successfully`);
    } catch (error) {
      console.error(`Error during ${type}:`, error);
      alert(`Could not ${type} this task.`);
    } finally {
      setLoadingAction(null);
    }
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
      <div className="lg:col-span-2 space-y-6">
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

      <div className="space-y-6">
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => action('claim')}
              disabled={!isPending || loadingAction !== null}
              className="w-full"
            >
              {loadingAction === 'claim' ? 'Processing...' : 'Claim'}
            </Button>

            <Button
              onClick={() => action('release')}
              disabled={!isAssigned || isCompleted || loadingAction !== null}
              variant="outline"
              className="w-full"
            >
              {loadingAction === 'release' ? 'Processing...' : 'Release'}
            </Button>

            <Button
              onClick={() => action('accept')}
              disabled={!isAssigned || isCompleted || loadingAction !== null}
              className="w-full"
            >
              {loadingAction === 'accept' ? 'Processing...' : 'Accept'}
            </Button>

            <Button
              onClick={() => action('return')}
              disabled={!isAssigned || isCompleted || loadingAction !== null}
              variant="secondary"
              className="w-full"
            >
              {loadingAction === 'return' ? 'Processing...' : 'Return'}
            </Button>

            <Button
              onClick={() => action('reject')}
              disabled={!isAssigned || isCompleted || loadingAction !== null}
              variant="destructive"
              className="w-full"
            >
              {loadingAction === 'reject' ? 'Processing...' : 'Reject'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}