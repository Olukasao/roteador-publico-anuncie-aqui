import { z } from "zod";

/**
 * Payload de cadastro do visitante (Seção 4, Tela 2).
 * O consentimento de marketing é sempre opcional e nunca pode ser `true` por padrão —
 * isso é reforçado também no backend (Fase 6), não só no formulário.
 */
export const visitorRegistrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Informe seu nome completo")
    .max(120, "Nome muito longo"),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  phone: z
    .string()
    .trim()
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, "Informe um celular válido com DDD"),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "É necessário aceitar as condições do serviço" }),
  }),
  marketingConsent: z.boolean().default(false),
});

export type VisitorRegistrationInput = z.infer<typeof visitorRegistrationSchema>;

/** Contexto técnico recebido do Grandstream via EXCAP (Seção 5, "Parâmetros do portal"). */
export const captivePortalContextSchema = z.object({
  loginUrl: z.string().url().optional(),
  apMac: z.string().optional(),
  clientMac: z.string().optional(),
  origUrl: z.string().url().optional(),
  ssid: z.string().optional(),
});

export type CaptivePortalContext = z.infer<typeof captivePortalContextSchema>;
