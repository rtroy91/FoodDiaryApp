import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/auth";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { AuthSidePanel } from "../components/AuthSidePanel";
import { FormInput } from "../components/FormInput";
import { GoogleSignInButton } from "../components/GoogleSignInButton";

const REGISTER_WORDS = ["Review", "Remember", "Rate"];
const REGISTER_FEATURES = [
  "Log every restaurant, cozy cafe, and late-night street food run.",
  "Get visual, guilt-free proof of your entire eating history.",
  "Instantly search by food place, city, or that one specific craving.",
];
const DISPLAY_NAME_MAX_LENGTH = 15;

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
  const [shakeDisplayName, setShakeDisplayName] = useState(false);
  const [showDisplayNameLimitMessage, setShowDisplayNameLimitMessage] = useState(false);

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

  useEffect(() => {
    if (!shakeDisplayName) return undefined;

    const timeout = window.setTimeout(() => setShakeDisplayName(false), 320);
    return () => window.clearTimeout(timeout);
  }, [shakeDisplayName]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleDisplayNameChange(value) {
    const nextValue = value.slice(0, DISPLAY_NAME_MAX_LENGTH);
    const hitDisplayNameLimit = value.length >= DISPLAY_NAME_MAX_LENGTH && nextValue.length === DISPLAY_NAME_MAX_LENGTH;

    setForm((prev) => {
      if (
        hitDisplayNameLimit &&
        (prev.displayName.length < DISPLAY_NAME_MAX_LENGTH || value.length > DISPLAY_NAME_MAX_LENGTH)
      ) {
        setShakeDisplayName(true);
        setShowDisplayNameLimitMessage(true);
      }

      return { ...prev, displayName: nextValue };
    });
  }

  function hideDisplayNameLimitMessage() {
    setShowDisplayNameLimitMessage(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage(null);
    const normalizedEmail = form.email.trim();
    const normalizedDisplayName = form.displayName.trim();

    if (normalizedDisplayName.length > DISPLAY_NAME_MAX_LENGTH) {
      setErrorMessage("User name must be 15 characters or fewer.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register(normalizedEmail, form.password, normalizedDisplayName);
      navigate("/login", {
        replace: true,
        state: { accountCreatedMessage: "Account created. Sign in to start your food diary." },
      });
    } catch (error) {
      if (!error.response) {
        setErrorMessage(
          "Lost connection to the pantry. The servers are in a deep food coma. Give us a moment to wake them up!"
        );
      } else {
        setErrorMessage("Could not create your account. That email may already be taken.");
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
        <section className="flex items-start justify-center bg-[#FFFBF4] px-6 py-12 sm:px-10 lg:items-center">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="mt-2 text-3xl font-semibold text-[#1F1B16]" style={{ fontFamily: '"Fraunces", serif' }}>
                Create your account
              </h2>

              <p className="mt-2 text-sm text-stone-700">
                Already have one?
                <Link to="/login" className="ml-1 font-bold text-[#B83224] hover:text-[#8F261C]">
                  Sign in
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className={shakeDisplayName ? "field-limit-shake" : ""}>
                <div onBlur={hideDisplayNameLimitMessage}>
                  <FormInput
                    label="user name"
                    name="displayName"
                    value={form.displayName}
                    onChange={handleDisplayNameChange}
                    placeholder="Sora"
                    autoComplete="name"
                    spellCheck={false}
                    required
                    maxLength={DISPLAY_NAME_MAX_LENGTH}
                    inputClassName={
                      form.displayName.length >= DISPLAY_NAME_MAX_LENGTH
                        ? "border-[#B83224]/40 ring-2 ring-[#B83224]/10"
                        : ""
                    }
                  />
                </div>
                {showDisplayNameLimitMessage && (
                  <p className="mt-1.5 text-xs font-medium text-[#8A2A1C]" aria-live="polite">
                    15 characters max. Keep it snack-sized.
                  </p>
                )}
              </div>

              <FormInput
                label="Email"
                type="email"
                name="email"
                value={form.email}
                onChange={(value) => handleChange("email", value)}
                placeholder="you@example.com"
                autoComplete="email"
                spellCheck={false}
                required
              />

              <FormInput
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(value) => handleChange("password", value)}
                placeholder="••••••••"
                autoComplete="new-password"
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
              <FormInput
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(value) => handleChange("confirmPassword", value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                minLength={8}
              >
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="flex h-12 w-12 touch-manipulation items-center justify-center rounded-2xl text-[#5F4A37] transition-colors hover:bg-[#E8DFC8] hover:text-[#1F1B16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B83224]/25"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </FormInput>

              {form.confirmPassword && (
                <p
                  className={`text-xs font-medium ${
                    form.password === form.confirmPassword ? "text-green-700" : "text-[#B83224]"
                  }`}
                >
                  {form.password === form.confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}

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
                  "Creating account…"
                ) : (
                  <>
                    Create account
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <div className="flex items-center gap-4 py-1">
                <div className="h-px flex-1 bg-[#D8CDBB]" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#5F4A37]">or</span>
                <div className="h-px flex-1 bg-[#D8CDBB]" />
              </div>

              <GoogleSignInButton disabled={submitting} text="Sign up with Google" />
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
