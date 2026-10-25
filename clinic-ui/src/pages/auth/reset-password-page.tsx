import { FormEvent, useState } from "react";
import { KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SamaRootBrand } from "@/components/brand/samaroot-brand";
import { authService } from "@/services/auth-service";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("The password reset link is missing its token.");
      return;
    }

    if (newPassword.length < 12) {
      setError("Password must be at least 12 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({ token, newPassword });
      setSuccess(true);
    } catch {
      setError(
        "Unable to reset your password. The link may have expired or already been used.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-white to-slate-100 p-4">
      <Card className="!w-full !max-w-md !overflow-hidden !rounded-3xl !border-0 !bg-white/90 !shadow-xl !shadow-slate-200/40 !outline-none ring-1 ring-inset ring-slate-200/70 backdrop-blur">
        <CardContent className="p-8 sm:p-10">
          <div className="mb-8 flex justify-center">
            <SamaRootBrand />
          </div>

          {success ? (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <h1 className="text-2xl font-semibold text-slate-900">
                Password reset successful
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Your password has been updated. You can now sign in with your
                new password.
              </p>

              <Button
                type="button"
                onClick={() => navigate("/login", { replace: true })}
                className="mt-7 h-11 w-full rounded-xl bg-teal-700 text-white hover:bg-teal-800"
              >
                Go to login
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-7 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  <KeyRound className="h-7 w-7" />
                </div>

                <h1 className="text-2xl font-semibold text-slate-900">
                  Reset password
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Enter and confirm your new password below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="newPassword"
                    className="text-sm font-medium text-slate-700"
                  >
                    New password
                  </label>
                  <Input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={12}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="!h-11 !w-full !rounded-xl !border-0 !bg-slate-50/60 px-3 text-sm text-slate-700 shadow-none outline-none !ring-1 !ring-slate-200/60 focus-visible:!border-0 focus-visible:!bg-white focus-visible:!ring-2 focus-visible:!ring-teal-500/30 focus-visible:!ring-offset-0"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-slate-700"
                  >
                    Confirm new password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={12}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="!h-11 !w-full !rounded-xl !border-0 !bg-slate-50/60 px-3 text-sm text-slate-700 shadow-none outline-none !ring-1 !ring-slate-200/60 focus-visible:!border-0 focus-visible:!bg-white focus-visible:!ring-2 focus-visible:!ring-teal-500/30 focus-visible:!ring-offset-0"
                  />
                </div>

                {error && (
                  <p role="alert" className="text-sm text-red-600">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading || !token}
                  className="h-11 w-full rounded-xl bg-teal-700 text-white hover:bg-teal-800"
                >
                  {loading ? "Resetting..." : "Reset password"}
                </Button>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-teal-700 hover:text-teal-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </button>
              </form>

              {!token && (
                <p role="alert" className="mt-3 text-sm text-red-600">
                  The reset token is missing. Please request a new reset link.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
