import Link from "next/link";
import { forgotPasswordAction } from "../actions";
import { ErrorNote, Field, SubmitButton, SuccessNote } from "@/components/form-ui";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Reset your password</h1>
      <ErrorNote message={error} />
      {sent ? (
        <SuccessNote message="If an account exists for that email, a reset link is on its way." />
      ) : (
        <form action={forgotPasswordAction} className="space-y-4">
          <Field label="Email" name="email" type="email" />
          <SubmitButton>Send reset link</SubmitButton>
        </form>
      )}
      <p className="text-sm text-center">
        <Link className="text-slate-500 hover:underline" href="/login">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
