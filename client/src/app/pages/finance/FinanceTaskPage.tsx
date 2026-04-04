import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { API_URL } from '../../config';

type ActionType = 'claim' | 'release' | 'accept' | 'return' | 'reject' | null;

export default function FinanceTaskPage() {
  const { taskId } = useParams();
  const [taskData, setTaskData] = useState<any>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [comment, setComment] = useState('');

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

  const openActionModal = (type: Exclude<ActionType, null>) => {
    setActionType(type);

    // sensible defaults
    if (type === 'accept') {
      setComment('Finance approved');
    } else if (type === 'claim') {
      setComment('Task claimed by finance user');
    } else if (type === 'release') {
      setComment('Task released back to queue');
    } else {
      setComment('');
    }

    setModalOpen(true);
  };

  const closeActionModal = () => {
    if (loadingAction) return;
    setModalOpen(false);
    setActionType(null);
    setComment('');
  };

  const getActionTitle = () => {
    switch (actionType) {
      case 'claim':
        return 'Claim Task';
      case 'release':
        return 'Release Task';
      case 'accept':
        return 'Accept Claim';
      case 'return':
        return 'Return Claim';
      case 'reject':
        return 'Reject Claim';
      default:
        return 'Confirm Action';
    }
  };

  const getActionDescription = () => {
    switch (actionType) {
      case 'claim':
        return 'This task will be assigned to you for processing.';
      case 'release':
        return 'This task will be released back to the finance queue.';
      case 'accept':
        return 'This claim will be accepted and the task will be completed.';
      case 'return':
        return 'This claim will be returned to the requestor for correction.';
      case 'reject':
        return 'This claim will be rejected and the task will be completed.';
      default:
        return '';
    }
  };

  const isCommentRequired = actionType === 'return' || actionType === 'reject';
  const showCommentField =
    actionType === 'accept' ||
    actionType === 'return' ||
    actionType === 'reject';

  const confirmAction = async () => {
    if (!actionType) return;

    if (isCommentRequired && !comment.trim()) {
      alert('Comment is required for this action.');
      return;
    }

    let finalComment = comment.trim();

    if (!finalComment) {
      if (actionType === 'claim') finalComment = 'Task claimed by finance user';
      if (actionType === 'release') finalComment = 'Task released back to queue';
      if (actionType === 'accept') finalComment = 'Finance approved';
    }

    try {
      setLoadingAction(actionType);

      const res = await fetch(`${API_URL}/finance/tasks/${taskId}/${actionType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1,
          comment: finalComment,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to ${actionType} task`);
      }

      await loadTask();
      closeActionModal();
    } catch (error) {
      console.error(`Error during ${actionType}:`, error);
      alert(`Could not ${actionType} this task.`);
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
    <>
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
                onClick={() => openActionModal('claim')}
                disabled={!isPending || loadingAction !== null}
                className="w-full"
              >
                {loadingAction === 'claim' ? 'Processing...' : 'Claim'}
              </Button>

              <Button
                onClick={() => openActionModal('release')}
                disabled={!isAssigned || isCompleted || loadingAction !== null}
                variant="outline"
                className="w-full"
              >
                {loadingAction === 'release' ? 'Processing...' : 'Release'}
              </Button>

              <Button
                onClick={() => openActionModal('accept')}
                disabled={!isAssigned || isCompleted || loadingAction !== null}
                className="w-full"
              >
                {loadingAction === 'accept' ? 'Processing...' : 'Accept'}
              </Button>

              <Button
                onClick={() => openActionModal('return')}
                disabled={!isAssigned || isCompleted || loadingAction !== null}
                variant="secondary"
                className="w-full"
              >
                {loadingAction === 'return' ? 'Processing...' : 'Return'}
              </Button>

              <Button
                onClick={() => openActionModal('reject')}
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {getActionTitle()}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {getActionDescription()}
              </p>
            </div>

            <div className="px-6 py-4 space-y-4">
              {showCommentField && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Comment {isCommentRequired ? '*' : '(optional)'}
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
                    placeholder={
                      actionType === 'accept'
                        ? 'Enter acceptance comment'
                        : actionType === 'return'
                        ? 'Enter return reason'
                        : 'Enter rejection reason'
                    }
                  />
                </div>
              )}

              {!showCommentField && (
                <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  Please confirm that you want to continue with this action.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <Button
                variant="outline"
                onClick={closeActionModal}
                disabled={loadingAction !== null}
              >
                Cancel
              </Button>

              <Button
                onClick={confirmAction}
                disabled={loadingAction !== null}
                variant={actionType === 'reject' ? 'destructive' : 'default'}
              >
                {loadingAction === actionType
                  ? 'Processing...'
                  : actionType === 'accept'
                  ? 'Confirm Accept'
                  : actionType === 'return'
                  ? 'Confirm Return'
                  : actionType === 'reject'
                  ? 'Confirm Reject'
                  : actionType === 'release'
                  ? 'Confirm Release'
                  : 'Confirm Claim'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}