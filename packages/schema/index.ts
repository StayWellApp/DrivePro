import { z } from "zod";

export const TopUpSchema = z.object({
  amount: z.number().min(100, { message: "Validations.minTopup" }),
});

export const StudentRegistrationSchema = z.object({
  name: z.string().min(1, { message: "Validations.required" }),
  email: z.string().email({ message: "Validations.invalidEmail" }),
  courseType: z.enum(["A", "B", "C"], {
    required_error: "Validations.required",
  }),
});

export type TopUpFormData = z.infer<typeof TopUpSchema>;
export type StudentRegistrationFormData = z.infer<
  typeof StudentRegistrationSchema
>;
