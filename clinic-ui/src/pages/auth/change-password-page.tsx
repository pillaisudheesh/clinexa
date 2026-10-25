import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SamaRootBrand } from "@/components/brand/samaroot-brand";
import { authService } from "@/services/auth-service";

export function ChangePasswordPage() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 12) {
      setError("Your new password must be at least 12 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The new password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("Your new password must differ from your current password.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.changePassword({
        currentPassword,
        newPassword,
      });

      setSuccess(response.message || "Password changed successfully.");

      // The backend asks the user to log in again after changing the password.
      await authService.logout().catch(() => undefined);
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof err.response === "object" &&
        err.response !== null &&
        "data" in err.response &&
        typeof err.response.data === "object" &&
        err.response.data !== null &&
        "message" in err.response.data
          ? err.response.data.message
          : null;

      setError(
        typeof message === "string"
          ? message
          : "Unable to change your password. Please check your current password and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <SamaRootBrand className="h-14 w-auto" />
        </div>

        <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-xl ring-1 ring-slate-200">
          <CardContent className="p-7 sm:p-9">
            <div className="mb-7 flex size-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <LockKeyhole className="size-6" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              Change your password
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              For your account security, set a new password before continuing to
              SamaRoot.
            </p>

            <div className="mt-5 flex gap-3 rounded-xl !border-0 bg-slate-50/60 p-3 text-sm text-slate-700 !shadow-none !outline-none ring-1 ring-inset ring-slate-200/60">
              <ShieldCheck className="mt-0.5 size-5 shrink-0" />
              <p>
                Use at least 12 characters. Choose a password you have not used
                before.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
                >
                  {success}
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="currentPassword"
                  className="text-sm font-medium text-slate-800"
                >
                  Current or temporary password
                </label>
                <Input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                  disabled={loading}
                  className="!h-11 !w-full !rounded-xl !border-0 !bg-slate-50/60 px-3 text-sm text-slate-700 shadow-none outline-none !ring-1 !ring-slate-200/60 transition-all placeholder:text-slate-400 focus-visible:!border-0 focus-visible:!bg-white focus-visible:!ring-2 focus-visible:!ring-teal-500/30 focus-visible:!ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="newPassword"
                  className="text-sm font-medium text-slate-800"
                >
                  New password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  minLength={12}
                  required
                  disabled={loading}
                  className="!h-11 !w-full !rounded-xl !border-0 !bg-slate-50/60 px-3 text-sm text-slate-700 shadow-none outline-none !ring-1 !ring-slate-200/60 transition-all placeholder:text-slate-400 focus-visible:!border-0 focus-visible:!bg-white focus-visible:!ring-2 focus-visible:!ring-teal-500/30 focus-visible:!ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-slate-800"
                >
                  Confirm new password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  minLength={12}
                  required
                  disabled={loading}
                  className="!h-11 !w-full !rounded-xl !border-0 !bg-slate-50/60 px-3 text-sm text-slate-700 shadow-none outline-none !ring-1 !ring-slate-200/60 transition-all placeholder:text-slate-400 focus-visible:!border-0 focus-visible:!bg-white focus-visible:!ring-2 focus-visible:!ring-teal-500/30 focus-visible:!ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => navigate("/login", { replace: true })}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white text-slate-700 shadow-none hover:bg-slate-50 hover:text-slate-900"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-lg bg-teal-700 text-white shadow-none hover:bg-teal-800"
                >
                  {loading ? "Changing password..." : "Change password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="mt-5 text-center text-xs text-slate-500">
          Your account security is important to us.
        </p>
      </div>
    </main>
  );
}
