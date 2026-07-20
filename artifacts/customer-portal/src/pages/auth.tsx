import React, { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuthCustomer, useAuthRegister } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useLang } from "@/lib/i18n";
import { PhoneInput } from "@/components/phone-input";

const phoneSchema = z.object({
  phone: z.string().min(9, "Telefone inválido"),
});


export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLang();
  const T = t.auth;
  const [isRegistering, setIsRegistering] = useState(false);

  const loginMutation = useAuthCustomer();
  const registerMutation = useAuthRegister();

  const registerSchema = z.object({
    fullName: z.string().min(2, T.fullName),
    phone: z.string().min(9),
    email: z.string().email().optional().or(z.literal("")),
    birthMonth: z.coerce.number().min(1).max(12).optional().or(z.literal(0)),
    birthDay: z.coerce.number().min(1).max(31).optional().or(z.literal(0)),
    consentData: z.boolean().refine(val => val === true, { message: T.consentDataRequired }),
    consentMarketing: z.boolean().default(false),
  });

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      birthMonth: undefined,
      birthDay: undefined,
      consentData: false,
      consentMarketing: false,
    },
  });

  const onPhoneSubmit = (data: z.infer<typeof phoneSchema>) => {
    loginMutation.mutate({ data: { phone: data.phone } }, {
      onSuccess: (res: any) => {
        if (res?.token) {
          localStorage.setItem("portal_token", res.token);
          setLocation("/home");
        }
      },
      onError: (err: any) => {
        if (err?.status === 404 || err?.response?.status === 404 || err?.message?.includes("404")) {
          registerForm.setValue("phone", data.phone);
          setIsRegistering(true);
        } else {
          toast({ title: T.loginErrorTitle, description: T.loginError, variant: "destructive" });
          registerForm.setValue("phone", data.phone);
          setIsRegistering(true);
        }
      }
    });
  };

  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    const payload = {
      fullName: data.fullName,
      phone: data.phone,
      email: data.email || undefined,
      birthMonth: data.birthMonth ? Number(data.birthMonth) : undefined,
      birthDay: data.birthDay ? Number(data.birthDay) : undefined,
      consentMarketing: data.consentMarketing,
    };

    registerMutation.mutate({ data: payload }, {
      onSuccess: (res: any) => {
        if (res?.token) {
          localStorage.setItem("portal_token", res.token);
          setLocation("/home");
        }
      },
      onError: () => {
        toast({ title: T.registerErrorTitle, description: T.registerError, variant: "destructive" });
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center space-y-3">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Origens Restaurante"
            className="w-64 object-contain"
          />
          <p className="text-muted-foreground font-medium text-sm tracking-wide">{T.subtitle}</p>
        </div>

        {!isRegistering ? (
          <Form {...phoneForm}>
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-6">
              <FormField
                control={phoneForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{T.phoneLabel}</FormLabel>
                    <FormControl>
                      <PhoneInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={T.phonePlaceholder}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-12 text-lg rounded-xl shadow-sm" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? T.loggingIn : T.loginButton}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-serif">{T.welcome}</h2>
                <p className="text-sm text-muted-foreground">{T.completeRegistration}</p>
              </div>

              <FormField control={registerForm.control} name="fullName" render={({ field }) => (
                <FormItem><FormLabel>{T.fullName}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={registerForm.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>{T.phone}</FormLabel>
                  <FormControl>
                    <PhoneInput value={field.value} onChange={field.onChange} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={registerForm.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>{T.email}</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={registerForm.control} name="birthDay" render={({ field }) => (
                  <FormItem><FormLabel>{T.birthDay}</FormLabel><FormControl><Input type="number" placeholder="DD" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={registerForm.control} name="birthMonth" render={({ field }) => (
                  <FormItem><FormLabel>{T.birthMonth}</FormLabel><FormControl><Input type="number" placeholder="MM" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={registerForm.control} name="consentData" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-primary/30 bg-primary/5 p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-semibold">{T.consentDataTitle}</FormLabel>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {T.consentDataText("Origens")}
                    </p>
                    <FormMessage />
                  </div>
                </FormItem>
              )} />

              <FormField control={registerForm.control} name="consentMarketing" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{T.consentMarketing} <span className="text-muted-foreground font-normal">{T.optional}</span></FormLabel>
                  </div>
                </FormItem>
              )} />

              <Button type="submit" className="w-full h-12 text-lg rounded-xl mt-4" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? T.saving : T.finishRegistration}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setIsRegistering(false)}>
                {T.back}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
