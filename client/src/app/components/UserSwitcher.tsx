import { useUserContext } from '../context/UserContext';
import { Button } from './ui/button';
import { LogOut, User } from 'lucide-react';

export default function UserSwitcher() {
  const { currentUser, logout } = useUserContext();

  if (!currentUser) return null;

  return (
    <div className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">

        {/* LEFT: User Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
            <User className="w-5 h-5 text-slate-600" />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-900">
              {currentUser.fullName}
            </p>
            <p className="text-xs text-slate-500">
              {currentUser.roleCode} • Region: {currentUser.regionCode || '-'}
            </p>
          </div>
        </div>

        {/* RIGHT: Logout */}
        <div>
          <Button
            variant="outline"
            onClick={logout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

      </div>
    </div>
  );
}