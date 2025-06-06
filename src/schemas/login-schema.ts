import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
});

export type LoginFormSchema = z.infer<typeof loginFormSchema>;
