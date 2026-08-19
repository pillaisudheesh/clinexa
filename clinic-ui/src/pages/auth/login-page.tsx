import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  HeartPulse,
  Headphones,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ClinexaBrand } from "@/components/brand/clinexa-brand";
import { useAuth } from "@/auth/auth-context";
import { authService } from "@/services/auth-service";

const highlights = [
  {
    icon: ShieldCheck,
    title: "Secure",
    text: "Protect patient information with enterprise-grade security.",
  },
  {
    icon: UsersRound,
    title: "All-in-One",
    text: "Manage every clinic workflow in one integrated platform.",
  },
  {
    icon: HeartPulse,
    title: "Patient-first",
    text: "Spend more time caring and less time on administration.",
  },
];

const trustPoints = ["Patient-first", "Secure workflows", "Built for clinics"];

export function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      setSession(response.user);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setError(
        "We couldn't sign you in. Check your email and password and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-svh overflow-hidden bg-slate-950">
      <div className="grid min-h-svh lg:grid-cols-[1.08fr_0.92fr]">
        {/* Brand panel */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#063746] via-[#075D67] to-[#13B8A8] px-8 py-8 text-white lg:flex lg:flex-col xl:px-12 2xl:px-16">
          {/* Top orbital decoration */}
          <div className="pointer-events-none absolute -right-24 -top-40 size-[520px] rounded-full !border !border-cyan-100/25 bg-white/[0.09]" />
          <div className="pointer-events-none absolute -right-8 -top-28 size-[390px] rounded-full !border !border-cyan-100/20 bg-white/[0.09]" />
          <div className="pointer-events-none absolute right-[9%] top-[17%] size-2 rounded-full bg-cyan-100/80 shadow-[0_0_16px_rgba(207,250,254,0.65)]" />

          {/* Top dotted pattern */}
          <div className="pointer-events-none absolute right-[7%] top-6 grid grid-cols-5 gap-3 opacity-30">
            {Array.from({ length: 25 }).map((_, index) => (
              <span key={index} className="size-1 rounded-full bg-cyan-100" />
            ))}
          </div>

          {/* Bottom orbital decoration */}
          <div className="pointer-events-none absolute -bottom-64 right-[-110px] size-[470px] rounded-full  border-cyan-100/25 bg-white/[0.09]" />
          <div className="pointer-events-none absolute -bottom-80 right-[16%] size-[500px] rounded-full  border-cyan-100/20 bg-white/[0.09]" />
          <div className="pointer-events-none absolute bottom-[13%] right-[9%] size-2 rounded-full bg-cyan-100/90 shadow-[0_0_16px_rgba(207,250,254,0.7)]" />
          <div className="pointer-events-none absolute bottom-[26%] right-[29%] size-2 rounded-full bg-cyan-100/80 shadow-[0_0_16px_rgba(207,250,254,0.55)]" />

          {/* Lower-left dot pattern */}
          <div className="pointer-events-none absolute bottom-10 left-0 grid grid-cols-5 gap-3 opacity-25">
            {Array.from({ length: 20 }).map((_, index) => (
              <span key={index} className="size-1 rounded-full bg-cyan-100" />
            ))}
          </div>

          <div className="relative z-10">
            <ClinexaBrand variant="white" className="h-16 w-auto" />
          </div>

          <div className="relative z-10 flex flex-1 items-center py-12 xl:py-16">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border-white/15 bg-white/[0.10] px-4 py-2 text-xs font-medium text-white/95 shadow-sm backdrop-blur-md">
                <Sparkles className="size-3.5 text-cyan-200" />
                Smarter clinic operations
              </div>

              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] xl:text-[4.35rem]">
                Smart Clinic
                <br />
                Management.
                <br />
                <span className="text-cyan-200">Better Patient Care.</span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-7 text-cyan-50/85 xl:text-lg">
                Clinexa brings your clinic&apos;s patients, appointments,
                consultations, laboratory, pharmacy and billing workflows
                together in one secure workspace.
              </p>

              <div className="mt-9 grid max-w-3xl grid-cols-3 gap-4">
                {highlights.map(({ icon: Icon, title, text }) => (
                  <div
                    key={title}
                    className="min-h-[178px] rounded-2xl  border-cyan-100/30 bg-white/[0.09] p-4 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.5)] backdrop-blur-md transition-colors hover:bg-white/[0.13]"
                  >
                    <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                      <Icon className="size-5 text-cyan-100" />
                    </div>

                    <p className="mt-5 text-sm font-semibold text-white">
                      {title}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-cyan-50/75">
                      {text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                {trustPoints.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-full  border-white/15 bg-black/[0.08] px-3.5 py-2 text-xs font-medium text-white/90 backdrop-blur-sm"
                  >
                    <span className="flex size-4 items-center justify-center rounded-full bg-cyan-300/20">
                      <Check className="size-2.5 text-cyan-100" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-cyan-50/65">
            <span>© {new Date().getFullYear()} Clinexa</span>
            <span>Smarter Care. Better Outcomes.</span>
          </div>
        </section>

        {/* Login panel */}
        <section className="relative flex min-h-svh items-center justify-center overflow-hidden bg-gradient-to-br from-white via-slate-50 to-cyan-50/70 px-4 py-8 sm:px-8 lg:px-10 xl:px-14">
          {/* Large soft arc */}
          <div className="pointer-events-none absolute -right-36 -top-40 size-[470px] rounded-full !border !border-teal-200/35 bg-white/[0.16]" />
          <div className="pointer-events-none absolute -right-16 -top-24 size-[330px] rounded-full !border !border-teal-200/25 bg-white/[0.10]" />

          {/* Right-side dots */}
          <div className="pointer-events-none absolute right-8 top-[42%] grid grid-cols-5 gap-3 opacity-45">
            {Array.from({ length: 35 }).map((_, index) => (
              <span key={index} className="size-1 rounded-full bg-teal-200" />
            ))}
          </div>

          {/* Bottom wave-like rings */}
          <div className="pointer-events-none absolute -bottom-44 -right-40 size-[430px] rounded-full !border !border-teal-200/30 bg-white/[0.06]" />
          <div className="pointer-events-none absolute -bottom-56 -right-28 size-[410px] rounded-full !border !border-teal-200/22 bg-white/[0.04]" />
          <div className="pointer-events-none absolute -bottom-68 right-[-70px] size-[390px] rounded-full !border !border-teal-200/18 bg-white/[0.03]" />

          <div className="relative z-10 w-full max-w-[490px]">
            {/* Mobile branding */}
            <div className="mb-8 flex justify-center lg:hidden">
              <ClinexaBrand className="h-16 w-auto" />
            </div>

            <Card className="overflow-hidden rounded-[26px] border-0 bg-white/95 shadow-[0_30px_90px_-28px_rgba(15,118,110,0.30)] ring-1 ring-slate-200/70 backdrop-blur-xl">
              <CardContent className="p-7 sm:p-9 lg:p-10">
                <div className="mb-8">
                  <div className="mb-7 hidden lg:block">
                    <ClinexaBrand className="h-14 w-auto" />
                  </div>

                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">
                    Welcome back
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Sign in to access your Clinexa account.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-semibold text-slate-800"
                    >
                      Email
                    </label>

                    <div className="group relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-teal-600" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        className="h-12 rounded-xl !border !border-slate-200 bg-white pl-10 text-sm shadow-none transition-all placeholder:text-slate-400 hover:!border-slate-300 focus-visible:!border-teal-400 focus-visible:ring-4 focus-visible:ring-teal-500/10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <label
                        htmlFor="password"
                        className="text-sm font-semibold text-slate-800"
                      >
                        Password
                      </label>

                      <button
                        type="button"
                        className="text-sm font-medium text-teal-700 transition-colors hover:text-teal-800"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <div className="group relative">
                      <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-teal-600" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                        className="h-12 rounded-xl !border !border-slate-200 bg-white pl-10 pr-11 text-sm shadow-none transition-all placeholder:text-slate-400 hover:!border-slate-300 focus-visible:!border-teal-400 focus-visible:ring-4 focus-visible:ring-teal-500/10"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="size-4 rounded border-slate-300 accent-teal-600 focus:ring-teal-500"
                    />
                    Remember me
                  </label>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="group h-12 w-full rounded-xl bg-gradient-to-r from-[#39D6C5] to-[#078A86] text-sm font-semibold text-white shadow-[0_12px_25px_-12px_rgba(15,118,110,0.65)] transition-all hover:from-[#28CDBB] hover:to-[#057874] hover:shadow-[0_16px_30px_-12px_rgba(15,118,110,0.7)] disabled:opacity-70"
                  >
                    {loading ? "Signing in..." : "Sign in"}
                    {!loading && (
                      <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
                    )}
                  </Button>

                  <div className="flex items-center gap-3 py-1">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Need help?
                    </span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-full rounded-xl !border !border-slate-200 bg-white text-sm font-medium text-slate-700 transition-colors hover:!border-slate-300 hover:bg-slate-50"
                  >
                    <Headphones className="mr-2 size-4 text-slate-500" />
                    Contact Administrator
                  </Button>
                </form>

                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="size-3.5 text-teal-600" />
                  <span>Secure access</span>
                  <span>•</span>
                  <span>Privacy protected</span>
                </div>
              </CardContent>
            </Card>

            <p className="mt-5 text-center text-xs text-slate-400 lg:hidden">
              © {new Date().getFullYear()} Clinexa · Smarter Care. Better
              Outcomes.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
