import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { requestPasswordReset } from "../api/auth";
import { AuthSidePanel } from "../components/AuthSidePanel";
import { FormInput } from "../components/FormInput";

const SUCCESS_MESSAGE = "If this email exists, we sent a reset link.";
const CONNECTION_MESSAGE =
  "Lost connection to the pantry. The servers are in a deep food coma. Give us a moment to wake them up!";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setErrorMessage(null);
    setSubmitting(true);

    try {
      await requestPasswordReset(email);
      setMessage(SUCCESS_MESSAGE);
    } catch (error) {
      setErrorMessage(
        error.response ? "We couldn't send a reset link right now. Please try again." : CONNECTION_MESSAGE
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#1C1107]">
      <div className="grid min-h-screen lg:grid-cols-2">
        <AuthSidePanel
          compactOnMobile
          appFeatures={["Reset your password safely.", "Use a one-time link.", "Get back to your food diary."]}
          title={
            <>
              Find your
              <br />
              way back.
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
                Forgot password
              </h1>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                Enter your email and we'll send a password reset link if the account exists.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              {message && (
                <div className="rounded-2xl border border-[#A5CF83]/40 bg-[#F1F7EA] px-4 py-3 text-sm font-semibold text-[#294B20]">
                  {message}
                </div>
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
                  "Sending link…"
                ) : (
                  <>
                    Send reset link
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
