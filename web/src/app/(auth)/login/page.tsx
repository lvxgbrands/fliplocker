import Link from "next/link";
import { loginAction } from "../actions";
import { ErrorNote, Field, SubmitButton, SuccessNote } from "@/components/form-ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; reset?: string; documented?: string }>;
}) {
  const { error, next, reset, documented } = await searchParams;
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Sign in to FlipLocker</h1>
      <ErrorNote message={error} />
      <SuccessNote
        message={
          reset
            ? "Password updated — sign in with your new password."
            : documented
              ? "Email confirmed — sign in to continue."
              : undefined
        }
      />
      <form action={loginAction} className="space-y-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <Field label="Email" name="email" type="email" />
        <Field label="Password" name="password" type="password" />
        <SubmitButton>Sign in</SubmitButton>
      </form>
      <div className="flex items-center justify-between text-sm">
        <Link className="text-ink-500 hover:underline" href="/forgot-password">
          Forgot password?
        </Link>
        <Link className="font-semibold text-brand-700 hover:underline" href="/register">
          Create an account
        </Link>
      </div>
    </div>
  );
}
