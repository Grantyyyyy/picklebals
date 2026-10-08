import { LoginForm } from "@/components/admin/login-form";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata = { title: "Sign in" };

export default function AdminLoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="container-page flex justify-center py-16">
      <section
        className="w-full max-w-sm rounded-2xl border bg-card p-8"
        aria-labelledby="login-title"
      >
        <h1 id="login-title" className="text-2xl font-bold text-court-deep">
          Administrator sign in
        </h1>
        {configured ? (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              Access is limited to approved administrators.
            </p>
            <LoginForm />
          </>
        ) : (
          <p role="note" className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            Supabase is not configured, so sign-in is unavailable. Add the Supabase environment
            variables to enable the admin area.
          </p>
        )}
      </section>
    </div>
  );
}
