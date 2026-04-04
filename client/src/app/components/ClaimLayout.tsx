import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { Progress } from '../components/ui/progress';
import { Car } from 'lucide-react';
import { Button } from './ui/button';
import { useUserContext } from '../context/UserContext';

interface ClaimLayoutProps {
  currentStep: number;
  totalSteps: number;
}

export const ClaimLayout: React.FC<ClaimLayoutProps> = ({ currentStep, totalSteps }) => {
  const progressPercentage = (currentStep / totalSteps) * 100;
  const navigate = useNavigate();
  const location = useLocation();

  const { currentUser, setCurrentUser, demoUsers } = useUserContext();

  const steps = [
    { path: '/', label: 'Welcome' },
    { path: '/claim/details', label: 'Claim Details' },
    { path: '/claim/vehicle', label: 'Vehicle Info' },
    { path: '/claim/upload', label: 'Documents' },
    { path: '/claim/review', label: 'Review' },
    { path: '/claim/success', label: 'Success' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Motor Claim Submission
                </h1>
                <p className="text-sm text-slate-600">
                  Step {currentStep} of {totalSteps}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 min-w-[280px]">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Current User
              </p>

              <select
                value={currentUser.id}
                onChange={(e) => {
                  const selected = demoUsers.find(
                    (user) => user.id === Number(e.target.value)
                  );
                  if (selected) {
                    setCurrentUser(selected);
                  }
                }}
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
              >
                {demoUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} ({user.roleCode})
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs text-slate-500">
                Region: {currentUser.regionCode || '-'}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {steps.map((step, index) => (
              <Button
                key={step.path}
                variant={location.pathname === step.path ? 'default' : 'outline'}
                size="sm"
                onClick={() => navigate(step.path)}
                className="text-xs"
              >
                {index + 1}. {step.label}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1">
        <Outlet />
      </main>

      <footer className="mt-auto py-6 text-center text-sm text-slate-500">
        <p>© 2026 Insurance Company. All rights reserved.</p>
      </footer>
    </div>
  );
};