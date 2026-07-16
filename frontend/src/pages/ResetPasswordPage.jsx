import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { resetPassword } from "../api/auth";
import { AuthSidePanel } from "../components/AuthSidePanel";
import { FormInput } from "../components/FormInput";

const CONNECTION_MESSAGE =
  "Lost connection to the pantry. The servers are in a deep food coma. Give us a moment to wake them up!";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage("This reset link is missing its token.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, password);
      navigate("/login", {
        replace: true,
        state: { resetMessage: "Password reset. You can sign in with your new password." },
      });
    } catch (error) {
      if (!error.response) {
        setErrorMessage(CONNECTION_MESSAGE);
      } else {
        setErrorMessage("This reset link is invalid or expired.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#1C1107]">
      <div className="grid min-h-screen lg:grid-cols-2">
        <AuthSidePanel
          compactOnMobile
          appFeatures={["Choose a fresh password.", "Reset links work once.", "Expired links stay locked."]}
          title={
            <>
              Fresh start,
              <br />
              same cravings.
            </>
          }
        />

        <section className="flex items-start justify-center bg-[#FFFBF4] px-6 py-12 sm:px-10 lg:items-center">
          <div className="w-full max-w-md">
            <Link
              to="/login"
              className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-[#8F261C] no-underline hover:text-[#5F1D15]"
            >
              <ArrowLeft size={15} />
              Back to sign in
            </Link>

            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-[#1F1B16]" style={{ fontFamily: '"Fraunces", serif' }}>
                Reset password
              </h1>
              <p className="mt-2 text-sm leading-6 text-stone-700">Create a new password for your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                label="New Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={setPassword}
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
                value={confirmPassword}
                onChange={setConfirmPassword}
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

              {confirmPassword && (
                <p
                  className={`text-xs font-medium ${password === confirmPassword ? "text-green-700" : "text-[#B83224]"}`}
                >
                  {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
                </p>
              )}

              {errorMessage && (
                <div className="rounded-2xl border border-[#E04B39]/20 bg-[#E04B39]/10 px-4 py-3 text-sm font-semibold text-[#8A2A1C]">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !token}
                className="flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-2xl bg-[#B83224] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#8F261C] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  "Resetting password..."
                ) : (
                  <>
                    Reset password
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
