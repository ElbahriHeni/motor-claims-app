import { useUserContext } from '../context/UserContext';

export default function UserSwitcher() {
  const { currentUser, setCurrentUser, demoUsers } = useUserContext();

  return (
    <div className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Current User
          </p>
          <p className="text-sm text-slate-700">
            {currentUser.fullName} ({currentUser.roleCode})
          </p>
        </div>

        <div className="flex min-w-[280px] flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Switch User
          </label>
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
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          >
            {demoUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName} ({user.roleCode})
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500">
            Region: {currentUser.regionCode || '-'}
          </p>
        </div>
      </div>
    </div>
  );
}   