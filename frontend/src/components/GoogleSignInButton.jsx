import { getGoogleLoginUrl } from "../api/auth";
import googleIcon from "../assets/google-icon.svg";

export function GoogleSignInButton({ disabled = false, rememberMe = false, text = "Continue with Google" }) {
  function handleClick() {
    window.location.assign(getGoogleLoginUrl(rememberMe));
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className="flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#F7EFE5] disabled:cursor-not-allowed disabled:opacity-70"
    >
      <img src={googleIcon} alt="" width="16" height="16" className="h-4 w-4 shrink-0" aria-hidden="true" />
      {text}
    </button>
  );
}
