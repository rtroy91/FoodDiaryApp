import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/auth";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { AuthSidePanel } from "../components/AuthSidePanel";
import { FormInput } from "../components/FormInput";

const REGISTER_WORDS = ["Review", "Remember", "Rate"];
const REGISTER_FEATURES = [
  "Log every restaurant, cafe & street food stop",
  "Infographic stats on your eating history",
  "Searchable by city, cuisine, or dish",
];

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [currentWord, setCurrentWord] = useState(REGISTER_WORDS[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => {
        const available = REGISTER_WORDS.filter((word) => word !== prev);
        return available[Math.floor(Math.random() * available.length)];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage(null);

    if (form.password !== form.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register(form.email, form.password, form.displayName);
      navigate("/");
    } catch {
      setErrorMessage(
        "Could not create your account. That email may already be taken.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1C1107]">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Panel */}
        <AuthSidePanel
          appFeatures={REGISTER_FEATURES}
          title={
            <>
              Eat
              <br />
              &amp; {currentWord}.
            </>
          }
        />

        {/* Right Panel */}
        <section className="flex items-center justify-center bg-[#FFFBF4] px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2
                className="mt-2 text-3xl font-semibold text-[#1F1B16]"
                style={{ fontFamily: '"Fraunces", serif' }}
              >
                Create your account
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                Already have one?
                <Link to="/login" className="ml-1 font-semibold text-[#E04B39]">
                  Sign in
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                label="user name"
                value={form.displayName}
                onChange={(value) => handleChange("displayName", value)}
                placeholder="Sora"
                required
              />

              <FormInput
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) => handleChange("email", value)}
                placeholder="you@example.com"
                required
              />

              <FormInput
                label="Password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(value) => handleChange("password", value)}
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
              <FormInput
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(value) => handleChange("confirmPassword", value)}
                placeholder="••••••••"
                required
                minLength={8}
              >
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="text-[#8C7B6A] transition hover:text-[#1F1B16]"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </FormInput>

              {form.confirmPassword && (
                <p
                  className={`text-xs font-medium ${
                    form.password === form.confirmPassword
                      ? "text-green-600"
                      : "text-[#E04B39]"
                  }`}
                >
                  {form.password === form.confirmPassword
                    ? "✓ Passwords match"
                    : "✗ Passwords do not match"}
                </p>
              )}

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
                  "Creating account..."
                ) : (
                  <>
                    Create account
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

{
  /*
  Implement COnfirm Password field
  Continue with google field
  */
}
