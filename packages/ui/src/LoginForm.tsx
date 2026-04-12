"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading?: boolean;
  error?: string | null;
  title?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
  error = null,
  title = "Sign In",
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <div className="ui:w-full ui:max-w-md ui:p-8 ui:bg-white ui:rounded-2xl ui:shadow-xl ui:border ui:border-slate-100">
      <div className="ui:text-center ui:mb-8">
        <h1 className="ui:text-3xl ui:font-bold ui:text-slate-900">{title}</h1>
        <p className="ui:text-slate-500 ui:mt-2">Enter your credentials to access your dashboard</p>
      </div>

      {error && (
        <div className="ui:mb-6 ui:p-4 ui:bg-red-50 ui:border-l-4 ui:border-red-500 ui:text-red-700 ui:text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="ui:space-y-6">
        <div>
          <label className="ui:block ui:text-sm ui:font-semibold ui:text-slate-700 ui:mb-2">
            Email Address
          </label>
          <input
            {...register("email")}
            type="email"
            className="ui:w-full ui:px-4 ui:py-3 ui:rounded-lg ui:border ui:border-slate-200 ui:focus:ring-2 ui:focus:ring-blue-500 ui:focus:border-transparent ui:outline-none ui:transition-all"
            placeholder="name@company.com"
          />
          {errors.email && (
            <p className="ui:mt-1 ui:text-xs ui:text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="ui:block ui:text-sm ui:font-semibold ui:text-slate-700 ui:mb-2">
            Password
          </label>
          <input
            {...register("password")}
            type="password"
            className="ui:w-full ui:px-4 ui:py-3 ui:rounded-lg ui:border ui:border-slate-200 ui:focus:ring-2 ui:focus:ring-blue-500 ui:focus:border-transparent ui:outline-none ui:transition-all"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="ui:mt-1 ui:text-xs ui:text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="ui:w-full ui:bg-slate-900 ui:text-white ui:py-3 ui:rounded-lg ui:font-bold ui:hover:bg-slate-800 ui:transition-all ui:disabled:opacity-50 ui:flex ui:items-center ui:justify-center"
        >
          {isLoading ? (
            <span className="ui:animate-pulse">Signing in...</span>
          ) : (
            "Login"
          )}
        </button>
      </form>
    </div>
  );
};
