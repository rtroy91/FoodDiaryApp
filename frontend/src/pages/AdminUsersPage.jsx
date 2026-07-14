import { Navigate } from "react-router-dom";
import { ShieldCheck, Users } from "lucide-react";
import { isAdmin } from "../api/auth";
import { useUsers } from "../hooks/useDiaryData";

function formatDate(value) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function AdminUsersPage() {
  const canViewUsers = isAdmin();
  const { data: users = [], isLoading, isError } = useUsers({ enabled: canViewUsers });

  if (!canViewUsers) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-full bg-[#F5F0E8] px-4 pb-10 pt-24 font-['Plus_Jakarta_Sans'] text-[#1C1107] sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8C7B6A]">Admin</p>
            <h1 className="mt-1 text-4xl font-normal" style={{ fontFamily: '"Fraunces", serif' }}>
              Users
            </h1>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D8CDBB] bg-white px-4 py-2 text-sm font-bold text-[#6F5130]">
            <ShieldCheck size={16} />
            Admin only
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-[#E8DFC8] bg-white shadow-[0_14px_34px_rgba(28,17,7,0.06)]">
          <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-[#EFE4D5] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5EEE4] text-[#6F5130]">
                <Users size={18} />
              </div>
              <div>
                <p className="font-bold text-[#1C1107]">Registered users</p>
                <p className="text-xs text-stone-500">Email, display name, role, and join date.</p>
              </div>
            </div>
            <span className="self-center rounded-full bg-[#F5EEE4] px-3 py-1 text-xs font-bold text-[#756450]">
              {users.length}
            </span>
          </div>

          {isLoading && <p className="px-5 py-10 text-center text-sm text-stone-500">Loading users...</p>}
          {isError && <p className="px-5 py-10 text-center text-sm font-bold text-[#E04B39]">Unable to load users.</p>}

          {!isLoading && !isError && (
            <div className="divide-y divide-[#EFE4D5]">
              {users.map((user) => (
                <div key={user.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1.4fr_1fr_auto_auto] md:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-[#1C1107]">{user.email}</p>
                    <p className="mt-0.5 text-xs font-semibold text-stone-500">
                      {user.displayName || "No display name"}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[#756450]">{formatDate(user.createdAt)}</p>
                  <span className="w-fit rounded-full bg-[#F5EEE4] px-3 py-1 text-xs font-extrabold text-[#6F5130]">
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
