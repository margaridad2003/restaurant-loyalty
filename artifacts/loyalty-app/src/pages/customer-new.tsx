import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateCustomer } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PhoneInput } from "@/components/phone-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(9, "Phone must be at least 9 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  birthMonth: z.coerce.number().min(1).max(12).optional().or(z.literal(0)),
  birthDay: z.coerce.number().min(1).max(31).optional().or(z.literal(0)),
  consentData: z.boolean().refine(val => val === true, { message: "Data consent is required to register a customer." }),
  consentMarketing: z.boolean().default(false),
});

export default function CustomerNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createCustomer = useCreateCustomer();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      birthMonth: 0,
      birthDay: 0,
      consentData: false,
      consentMarketing: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      ...values,
      email: values.email || undefined,
      birthMonth: values.birthMonth ? values.birthMonth : undefined,
      birthDay: values.birthDay ? values.birthDay : undefined,
    };

    createCustomer.mutate({ data: payload }, {
      onSuccess: (data) => {
        toast({
          title: "Customer Registered",
          description: `${data.fullName} has been added to the loyalty program.`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        setLocation(`/customers/${data.id}`);
      },
      onError: (error) => {
        toast({
          title: "Registration Failed",
          description: (error.data as any)?.error || "Ocorreu um erro.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-foreground font-semibold tracking-tight">New Customer</h1>
        <p className="text-muted-foreground mt-1">Register a new member to the loyalty program.</p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif">Customer Details</CardTitle>
          <CardDescription>Enter the primary contact info. Phone number is required for check-in.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <PhoneInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="912 000 000"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="birthMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birth Month</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="12" placeholder="1-12" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="birthDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birth Day</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="31" placeholder="1-31" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="consentData"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-primary/30 p-4 bg-primary/5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-semibold">Data Processing Consent *</FormLabel>
                      <FormDescription>
                        The customer authorises <strong>Origens</strong> to collect and process their personal data (name, phone, email and visit history) for the loyalty programme, in accordance with GDPR. Data will not be shared with third parties without consent. <span className="text-destructive font-medium">Required to register.</span>
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="consentMarketing"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4 bg-muted/30">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Marketing Consent <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                      <FormDescription>
                        Customer agrees to receive promotional messages and reward notifications.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setLocation('/customers')}>Cancel</Button>
                <Button type="submit" disabled={createCustomer.isPending}>
                  {createCustomer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Register Customer
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
