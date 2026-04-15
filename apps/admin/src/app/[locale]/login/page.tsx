"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { LoginForm } from "@repo/ui";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = (session.user as any).role;

      if (role === "SUPER_ADMIN") {
        router.push("/super");
      } else if (role === "STUDENT") {
        // Use window.location.origin to ensure we are not redirected to localhost:3000 by accident
        window.location.href = `${window.location.origin}/`;
      } else {
        router.push(callbackUrl || "/dashboard");
      }
    }
  }, [session, status, router, callbackUrl]);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <LoginForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        title="Admin Portal"
      />
    </div>
  );
}
