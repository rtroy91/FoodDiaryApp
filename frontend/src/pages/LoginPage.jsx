import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { login } from "../api/auth";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { AuthSidePanel } from "../components/AuthSidePanel";
import { FormInput } from "../components/FormInput";
import { GoogleSignInButton } from "../components/GoogleSignInButton";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const loginHighlights = [
    "Your food diary misses your bad decisions.",
    "Go stalk your favorite eating spots.",
    "Keep documenting your food obsession.",
  ];
  const googleRedirectFailed = new URLSearchParams(location.search).has("googleError");

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await login(email.trim(), password, rememberMe);
      navigate("/");
    } catch (error) {
      if (!error.response) {
        setErrorMessage(
          "Lost connection to the pantry. The servers are in a deep food coma. Give us a moment to wake them up!"
        );
      } else if (error.response.status === 401) {
        setErrorMessage("Incorrect email or password.");
      } else {
        setErrorMessage("Something went wrong while signing in. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#1C1107]">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Panel */}
        <AuthSidePanel
          compactOnMobile
          appFeatures={loginHighlights}
          title={
            <>
              Build your
              <br />
              food journey.
            </>
          }
        />

        <section className="flex items-start justify-center bg-[#FFFBF4] px-6 py-12 sm:px-10 lg:items-center">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="mt-2 text-3xl font-semibold text-[#1F1B16]" style={{ fontFamily: '"Fraunces", serif' }}>
                Sign in
              </h2>

              <p className="mt-2 text-sm text-stone-700">
                No Account?
                <Link to="/register" className="ml-1 font-bold text-[#B83224] hover:text-[#8F261C]">
                  Register here.
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {location.state?.resetMessage && (
                <div className="rounded-2xl border border-[#A5CF83]/40 bg-[#F1F7EA] px-4 py-3 text-sm font-semibold text-[#294B20]">
                  {location.state.resetMessage}
                </div>
              )}

              {location.state?.accountCreatedMessage && (
                <div className="rounded-2xl border border-[#A5CF83]/40 bg-[#F1F7EA] px-4 py-3 text-sm font-semibold text-[#294B20]">
                  {location.state.accountCreatedMessage}
                </div>
              )}

              {googleRedirectFailed && (
                <div className="rounded-2xl border border-[#E04B39]/20 bg-[#E04B39]/10 px-4 py-3 text-sm font-semibold text-[#8A2A1C]">
                  Google sign-in could not be completed. Please try again.
                </div>
              )}

              <FormInput
                label="Email Address"
                type="email"
                name="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                autoComplete="email"
                spellCheck={false}
                required
              />

              <FormInput
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                minLength={8}
              >
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="flex h-12 w-12 touch-manipulation items-center justify-center rounded-2xl text-[#5F4A37] transition-colors hover:bg-[#E8DFC8] hover:text-[#1F1B16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B83224]/25"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </FormInput>
              <div className="flex min-h-11 items-center justify-between gap-4">
                <label className="flex min-h-11 cursor-pointer items-center gap-2 text-xs font-semibold text-stone-700">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-[#BFAF99] text-[#B83224] accent-[#B83224] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B83224]/25"
                  />
                  <span>Remember me</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-stone-700 no-underline hover:text-[#8F261C]"
                >
                  Forgot Password?
                </Link>
              </div>

              {errorMessage && (
                <div className="rounded-2xl border border-[#E04B39]/20 bg-[#E04B39]/10 px-4 py-3 text-sm font-semibold text-[#8A2A1C]">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-2xl bg-[#B83224] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#8F261C] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  "Signing in…"
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <div className="flex items-center gap-4 py-1">
                <div className="h-px flex-1 bg-[#D8CDBB]" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#5F4A37]">or</span>
                <div className="h-px flex-1 bg-[#D8CDBB]" />
              </div>

              <GoogleSignInButton disabled={submitting} rememberMe={rememberMe} />
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
