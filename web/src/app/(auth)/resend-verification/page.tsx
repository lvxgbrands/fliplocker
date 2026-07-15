import { resendVerificationAction } from "../actions";
import { SubmitButton } from "@/components/form-ui";

export default function ResendVerificationPage() {
  return (
    <div className="space-y-5 text-center">
      <h1 className="text-xl font-bold">Resend verification email</h1>
      <p className="text-sm text-ink-500">
        We&apos;ll send a fresh verification link to the email on your account.
      </p>
      <form action={resendVerificationAction}>
        <SubmitButton>Send verification link</SubmitButton>
      </form>
    </div>
  );
}
