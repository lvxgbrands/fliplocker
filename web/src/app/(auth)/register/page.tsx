import Link from "next/link";
import { registerAction } from "../actions";
import { ErrorNote, Field, SubmitButton } from "@/components/form-ui";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Create your seller account</h1>
        <p className="text-sm text-ink-500 mt-1">
          Invited to a deal as a buyer? Use the link in your invitation email instead.
        </p>
      </div>
      <ErrorNote message={error} />
      <form action={registerAction} className="space-y-4">
        <Field label="Full name" name="name" placeholder="Dana Seller" />
        <Field label="Email" name="email" type="email" placeholder="you@example.com" />
        <Field label="Password" name="password" type="password" hint="At least 8 characters" />
        <SubmitButton>Create account</SubmitButton>
      </form>
      <p className="text-sm text-ink-500 text-center">
        Already have an account?{" "}
        <Link className="font-semibold text-brand-700 hover:underline" href="/login">
          Sign in
        </Link>
      </p>
    </div>
  );
}
