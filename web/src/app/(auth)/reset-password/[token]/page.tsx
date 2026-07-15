import { resetPasswordAction } from "../../actions";
import { ErrorNote, Field, SubmitButton } from "@/components/form-ui";

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Choose a new password</h1>
      <ErrorNote message={error} />
      <form action={resetPasswordAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <Field label="New password" name="password" type="password" hint="At least 8 characters" />
        <SubmitButton>Update password</SubmitButton>
      </form>
    </div>
  );
}
