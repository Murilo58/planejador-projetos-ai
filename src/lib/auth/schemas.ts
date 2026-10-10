import { z } from "zod";

/**
 * Validação de entrada da autenticação (RNF-001 / RNF-006).
 * Mantido mínimo e alinhado ao PRD RF-004/RF-005: apenas email e senha.
 */

const email = z
  .string()
  .trim()
  .min(1, "Informe seu email.")
  .email("Informe um email válido.");

// bcrypt ignora bytes além do 72º — limitar evita truncamento silencioso.
const password = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .max(72, "A senha deve ter no máximo 72 caracteres.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Informe sua senha."),
});

export const registerSchema = z
  .object({
    email,
    password,
    confirmPassword: z.string().min(1, "Confirme sua senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
