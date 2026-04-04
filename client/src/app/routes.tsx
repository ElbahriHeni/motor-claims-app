import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { FileText, RefreshCcw, ShieldAlert, Plus } from 'lucide-react';
import { API_URL } from '../config';
import { useUserContext } from '../context/UserContext';

export default function MyClaimsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useUserContext();

  const isRequestor =
    currentUser?.roleCode === 'REQUESTOR' ||
    currentUser?.roleCode === 'ADMIN';

  const loadClaims = () => {
    if (!isRequestor) return;

    fetch(`${API_URL}/claims`)
      .then((res) => res.json())
      .then((data) => setClaims(data))
      .catch((err) => {
        console.error('Error loading claims:', err);
      });
  };

  useEffect(() => {
    loadClaims();
  }, [isRequestor]);

  const handleCreateNewClaim = async () => {
    if (!currentUser) return;

    try {
      setIsCreating(true);

      const response = await fetch(`${API_URL}/claims`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create claim');
      }

      const data = await response.json();
      navigate(`/claim/details?claimId=${data.id}`);
    } catch (error: any) {
      console.error('Error creating claim:', error);
      alert(error?.message || 'Could not create claim.');
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'RETURNED':
        return 'secondary';
      case 'ACCEPTED':
        return 'default';
      case 'REJECTED':
        return 'destructive';
      case 'SUBMITTED':
        return 'outline';
      case 'DRAFT':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (!isRequestor) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>My Claims</CardTitle>
            <CardDescription>
              View your submitted claims, statuses, and returned items.
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
                    <span className="font-medium">{currentUser?.fullName}</span> (
                    {currentUser?.roleCode}).
                  </p>
                  <p className="mt-2 text-sm text-amber-700">
                    Only requestor users can access claims submission and tracking.
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
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>My Claims</CardTitle>
            <CardDescription>
              View your submitted claims, draft claims, and returned items that need updates.
            </CardDescription>
          </div>

          <div>
            <Button onClick={handleCreateNewClaim} disabled={isCreating}>
              <Plus className="w-4 h-4 mr-2" />
              {isCreating ? 'Creating...' : 'Create New Claim'}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {claims.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-slate-500" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">No claims found</p>
                  <p className="text-sm text-slate-500">
                    Start by creating your first claim.
                  </p>
                </div>

                <div className="pt-2">
                  <Button onClick={handleCreateNewClaim} disabled={isCreating}>
                    <Plus className="w-4 h-4 mr-2" />
                    {isCreating ? 'Creating...' : 'Create New Claim'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            claims.map((c: any) => (
              <div
                key={c.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          Claim #{c.id}
                        </p>
                        <p className="text-sm text-slate-500">
                          Reference: {c.reference_number || '-'}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Status
                        </p>
                        <div className="mt-1">
                          <Badge variant={getStatusVariant(c.status) as any}>
                            {c.status}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Comment
                        </p>
                        <p className="mt-1 text-sm text-slate-700">
                          {c.decision_comment || '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {c.status === 'DRAFT' && (
                      <Button onClick={() => navigate(`/claim/details?claimId=${c.id}`)}>
                        Continue Draft
                      </Button>
                    )}

                    {c.status === 'RETURNED' && (
                      <Button onClick={() => navigate(`/claim/details?claimId=${c.id}`)}>
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Edit & Resubmit
                      </Button>
                    )}
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