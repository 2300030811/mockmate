import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Log in to your account to save your certification progress"
    >
      <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading form...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
