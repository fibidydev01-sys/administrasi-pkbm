import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi").min(6, "Password minimal 6 karakter"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError<T> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function getFirstError<T>(error: z.ZodError<T>): string {
  const firstError = error.issues[0];
  return firstError?.message || "Validasi gagal";
}

export function getErrorMessages<T>(error: z.ZodError<T>): Record<string, string> {
  const messages: Record<string, string> = {};
  error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    if (!messages[path]) {
      messages[path] = issue.message;
    }
  });
  return messages;
}
