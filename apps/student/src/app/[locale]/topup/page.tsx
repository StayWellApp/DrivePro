"use client";

import { useState, useEffect } from "react";
import { TopUpSchema, type TopUpFormData } from "@repo/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

export default function TopUpPage() {
  const t = useTranslations("TopUp");
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would come from an auth context or session
    const storedId = localStorage.getItem("student_id");
    if (storedId) setStudentId(storedId);
    else setStudentId("student-789"); // Fallback for demo
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TopUpFormData>({
    resolver: zodResolver(TopUpSchema),
  });

  const onSubmit = async (data: TopUpFormData) => {
    if (!studentId) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/create-checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: studentId,
            amount: data.amount,
          }),
        },
      );

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Top-up failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("amountLabel")}
          </label>
          <input
            type="number"
            {...register("amount", { valueAsNumber: true })}
            className="w-full p-2 border rounded"
            placeholder="1000"
          />
          {errors.amount && (
            <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !studentId}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? t("processing") : t("submit")}
        </button>
      </form>
    </div>
  );
}
