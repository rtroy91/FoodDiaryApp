import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { AuthSidePanel } from "../components/AuthSidePanel";
import { FormInput } from "../components/FormInput";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginHighlights = [
    "Your food diary is waiting",
    "Revisit your favorite restaurants",
    "Keep building your food journey",
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setErrorMessage("Incorrect email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1C1107]">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Panel */}
        <AuthSidePanel
          appFeatures={loginHighlights}
          title={
            <>
              Build your
              <br />
              food journey.
            </>
          }
        />

        <section className="flex items-center justify-center bg-[#FFFBF4] px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="mt-2 text-3xl font-semibold text-[#1F1B16]" style={{ fontFamily: '"Fraunces", serif' }}>
                Sign in
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                No Account?
                <Link to="/register" className="ml-1 font-semibold text-[#E04B39]">
                  Register here.
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                label="Email Address"
                type="text"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                required
              />

              <FormInput
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                required
                minLength={8}
              >
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-[#8C7B6A] transition hover:text-[#1F1B16]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </FormInput>
              <p className="flex justify-end text-xs text-stone-500 hover:text-[#E04B39] cursor-pointer">
                Forgot Password?
              </p>

              <p className="text-xs text-stone-500 hover:text-[#E04B39] cursor-pointer">Remember Me?</p>

              {errorMessage && (
                <div className="rounded-2xl border border-[#E04B39]/20 bg-[#E04B39]/10 px-4 py-3 text-sm text-[#C44A3C]">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E04B39] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#c93c2f] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <div className="flex items-center gap-4 py-1">
                <div className="h-px flex-1 bg-[#D8CDBB]" />
                <span
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8C7B6A]"
                  style={{ fontFamily: '"Geist Mono", monospace' }}
                >
                  or
                </span>
                <div className="h-px flex-1 bg-[#D8CDBB]" />
              </div>

              <button
                type="button"
                disabled={submitting}
                className="w-full rounded-2xl bg-white border border-gray-200 px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#c93c2f] disabled:cursor-not-allowed disabled:opacity-70"
              >
                Continue with Google
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
