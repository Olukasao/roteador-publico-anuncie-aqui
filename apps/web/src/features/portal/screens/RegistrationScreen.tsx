import { useState } from "react";
import { motion } from "motion/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { visitorRegistrationSchema, type VisitorRegistrationInput } from "@acessanet/shared";
import { Button, Card, Checkbox, Input } from "@acessanet/ui";
import { formatPhoneBR } from "../../../lib/masks";
import { DemoScenarioPicker } from "../mock/DemoScenarioPicker";
import type { MockOutcome } from "../mock/grandstreamMockProvider";

interface RegistrationScreenProps {
  onBack: () => void;
  onSubmit: (data: VisitorRegistrationInput, forcedOutcome: MockOutcome) => void;
}

export function RegistrationScreen({ onBack, onSubmit }: RegistrationScreenProps) {
  const [scenario, setScenario] = useState<MockOutcome>("success");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<VisitorRegistrationInput>({
    resolver: zodResolver(visitorRegistrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      termsAccepted: undefined,
      marketingConsent: false,
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      <Card className="flex flex-col gap-5 bg-surface p-6 sm:p-8">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 self-start text-sm text-text-secondary hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Voltar
        </button>

        <div>
          <h2 className="text-xl font-bold text-text-primary">Quase lá!</h2>
          <p className="text-sm text-text-secondary">
            Preencha seus dados para liberar o Wi-Fi gratuito.
          </p>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((data) => onSubmit(data, scenario))}
          noValidate
        >
          <Input
            label="Nome completo"
            autoComplete="name"
            placeholder="Como podemos te chamar?"
            error={errors.fullName?.message}
            {...register("fullName")}
          />

          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="voce@email.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input
                label="Celular"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="(00) 00000-0000"
                error={errors.phone?.message}
                value={field.value}
                onChange={(event) => field.onChange(formatPhoneBR(event.target.value))}
                onBlur={field.onBlur}
              />
            )}
          />

          <div className="flex flex-col gap-3 border-t border-surface-border pt-4">
            <Controller
              name="termsAccepted"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label="Aceito as condições de uso da rede Wi-Fi AcessaNet"
                  checked={field.value ?? false}
                  onChange={(event) => field.onChange(event.target.checked)}
                  error={errors.termsAccepted?.message}
                />
              )}
            />

            <Controller
              name="marketingConsent"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label="Quero receber ofertas e novidades da AcessaNet"
                  description="Opcional — você pode revogar quando quiser."
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                />
              )}
            />
          </div>

          <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
            Continuar
          </Button>
        </form>

        <DemoScenarioPicker value={scenario} onChange={setScenario} />
      </Card>
    </motion.div>
  );
}
