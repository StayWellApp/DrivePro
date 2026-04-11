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

export const TelemetrySyncSchema = z.object({
  coordinates: z.array(
    z.object({
      lat: z.number(),
      lng: z.number(),
      timestamp: z.string(),
    })
  ),
  faults: z.array(
    z.object({
      type: z.string(),
      severity: z.enum(["minor", "serious", "dangerous"]),
      timestamp: z.string(),
      coordinate: z.object({
        lat: z.number(),
        lng: z.number(),
      }),
    })
  ),
});

export type TopUpFormData = z.infer<typeof TopUpSchema>;
export type StudentRegistrationFormData = z.infer<
  typeof StudentRegistrationSchema
>;
export type TelemetrySyncData = z.infer<typeof TelemetrySyncSchema>;
