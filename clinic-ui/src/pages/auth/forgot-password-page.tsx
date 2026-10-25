import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SamaRootBrand } from "@/components/brand/samaroot-brand";
import { authService } from "@/services/auth-service";

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.forgotPassword({ email: email.trim() });
      setSubmitted(true);
    } catch {
      setError("We couldn't process your request right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-gradient-to-br from-white via-slate-50 to-cyan-50/70 px-4 py-8 sm:px-8 lg:px-10 xl:px-14">
      <div className="pointer-events-none absolute -right-36 -top-40 size-[470px] rounded-full !border !border-solid !border-teal-200/35 bg-white/[0.16]" />

      <div className="pointer-events-none absolute -right-16 -top-24 size-[330px] rounded-full !border !border-solid !border-teal-200/25 bg-white/[0.10]" />
      <Card className="w-full max-w-[490px] overflow-hidden rounded-[26px] border-0 bg-white/95 shadow-[0_30px_90px_-28px_rgba(15,118,110,0.30)] ring-1 ring-slate-200/70 backdrop-blur-xl">
        <CardContent className="p-7 sm:p-9 lg:p-10">
          <div className="mb-8 flex justify-center">
            <SamaRootBrand />
          </div>

          {submitted ? (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Check your email
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                If an account exists for this email address, instructions to
                reset your password will be sent to you.
              </p>

              <Button
                type="button"
                className="cursor-pointer mt-7 h-11 w-full rounded-xl bg-teal-700 text-white hover:bg-teal-800"
                onClick={() => navigate("/login", { replace: true })}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-7 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  <Mail className="h-7 w-7" />
                </div>

                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Forgot password?
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Enter your registered email address and we'll send
                  instructions to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Email address
                  </label>

                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="!h-11 !w-full !rounded-xl !border-0 !bg-slate-50/60 px-3 text-sm text-slate-700 shadow-none outline-none !ring-1 !ring-slate-200/60 transition-all placeholder:text-slate-400 focus-visible:!border-0 focus-visible:!bg-white focus-visible:!ring-2 focus-visible:!ring-teal-500/30 focus-visible:!ring-offset-0"
                  />
                </div>

                {error && (
                  <p role="alert" className="text-sm text-red-600">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="h-11 w-full rounded-xl bg-teal-700 text-white hover:bg-teal-800"
                >
                  {loading ? "Sending..." : "Send reset instructions"}
                </Button>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="cursor-pointer flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-teal-700 transition-colors hover:text-teal-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
