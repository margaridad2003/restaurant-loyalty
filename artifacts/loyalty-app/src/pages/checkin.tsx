import { useState } from "react";
import { useGetCustomerByPhone, useRegisterVisit, getGetCustomerByPhoneQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Search, CheckCircle2, UserPlus, Tag, Sunrise, Moon, Clock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { FREE_MEAL_EVERY } from "@/lib/tiers";

type Period = "breakfast" | "dinner" | null;

function getCurrentPeriod(): Period {
  const h = new Date().getHours();
  const m = new Date().getMinutes();
  const total = h * 60 + m;
  if (total >= 7 * 60 + 30 && total < 11 * 60) return "breakfast";
  if (total >= 19 * 60 && total < 23 * 60) return "dinner";
  return null;
}

function formatMeals(n: number): string {
  if (n === 0) return "0";
  if (n % 1 === 0.5 && n < 1) return "½";
  if (n % 1 === 0.5) return `${Math.floor(n)}½`;
  return n.toString();
}

const PERIOD_CONFIG = {
  breakfast: { label: "Pequeno-almoço", hours: "7h30–11h00", credit: 0.5, creditLabel: "½ refeição", Icon: Sunrise, color: "text-orange-600 bg-orange-50 border-orange-200" },
  dinner: { label: "Jantar", hours: "19h00–23h00", credit: 1, creditLabel: "1 refeição", Icon: Moon, color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
};

export default function CheckIn() {
  const { toast } = useToast();
  const [phoneInput, setPhoneInput] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [notes, setNotes] = useState("");
  const period = getCurrentPeriod();
  const config = period ? PERIOD_CONFIG[period] : null;

  const { data: customer, isLoading: isSearching, isError } = useGetCustomerByPhone(searchPhone, {
    query: { enabled: !!searchPhone, retry: false, queryKey: getGetCustomerByPhoneQueryKey(searchPhone) }
  });

  const registerVisit = useRegisterVisit();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.trim().length >= 9) {
      setSearchPhone(phoneInput.trim());
    } else {
      toast({ title: "Número inválido", description: "Introduza um número válido.", variant: "destructive" });
    }
  };

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    registerVisit.mutate({
      data: { customerId: customer.id, mealsCount: 1, notes: notes || undefined }
    }, {
      onSuccess: (result) => {
        const credit = result.visit.mealsCount;
        const msg = result.freeMealEarned
          ? `🎉 ${result.customer.fullName} ganhou 50% de desconto na próxima refeição!`
          : `Visita registada (+${formatMeals(credit as number)} refeição). ${formatMeals(result.customer.freeMealProgress as number)}/${FREE_MEAL_EVERY} para o próximo desconto.`;
        toast({ title: "Check-in registado!", description: msg });
        setSearchPhone("");
        setPhoneInput("");
        setNotes("");
      },
      onError: (err) => {
        toast({ title: "Erro no Check-in", description: (err.data as any)?.error || "Ocorreu um erro.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-serif text-foreground font-bold tracking-tight">Quick Check-in</h1>
        <p className="text-muted-foreground">Registar visitas de clientes.</p>
      </div>

      {/* Period / Hours Info */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Horário de Funcionamento</p>
          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-lg border p-3 ${period === "breakfast" ? "border-orange-300 bg-orange-50" : "border-border bg-muted/30"}`}>
              <div className="flex items-center gap-2 mb-1">
                <Sunrise className={`h-4 w-4 ${period === "breakfast" ? "text-orange-600" : "text-muted-foreground"}`} />
                <span className={`text-sm font-semibold ${period === "breakfast" ? "text-orange-700" : "text-foreground"}`}>Pequeno-almoço</span>
              </div>
              <p className="text-xs text-muted-foreground">7h30 – 11h00</p>
              <p className={`text-xs font-medium mt-1 ${period === "breakfast" ? "text-orange-600" : "text-muted-foreground"}`}>conta ½ refeição</p>
            </div>
            <div className={`rounded-lg border p-3 ${period === "dinner" ? "border-indigo-300 bg-indigo-50" : "border-border bg-muted/30"}`}>
              <div className="flex items-center gap-2 mb-1">
                <Moon className={`h-4 w-4 ${period === "dinner" ? "text-indigo-600" : "text-muted-foreground"}`} />
                <span className={`text-sm font-semibold ${period === "dinner" ? "text-indigo-700" : "text-foreground"}`}>Jantar</span>
              </div>
              <p className="text-xs text-muted-foreground">19h00 – 23h00</p>
              <p className={`text-xs font-medium mt-1 ${period === "dinner" ? "text-indigo-600" : "text-muted-foreground"}`}>conta 1 refeição</p>
            </div>
          </div>
          {period ? (
            <div className={`mt-3 rounded-lg px-3 py-2 text-sm font-medium ${config!.color} border`}>
              ✓ Período ativo: <strong>{config!.label}</strong> · crédito: <strong>{config!.creditLabel}</strong>
            </div>
          ) : (
            <div className="mt-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground bg-muted/30 border border-border flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Fora do horário — check-in manual será registado com 1 refeição de crédito.
            </div>
          )}
        </CardContent>
      </Card>

      {!customer ? (
        <Card className="border-border shadow-md">
          <CardHeader>
            <CardTitle className="font-serif">Encontrar Cliente</CardTitle>
            <CardDescription>Introduza o número de telemóvel para começar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="ex: +351912345678"
                  className="pl-10 h-12 text-lg bg-background"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  autoFocus
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8" disabled={isSearching || phoneInput.length < 9}>
                {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : "Pesquisar"}
              </Button>
            </form>

            {isError && (
              <div className="mt-6 p-6 border border-dashed border-border rounded-xl text-center bg-muted/30">
                <p className="text-muted-foreground mb-4">Cliente não encontrado com este número.</p>
                <Button asChild variant="outline">
                  <Link href={`/customers/new?phone=${encodeURIComponent(phoneInput)}`}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Registar Novo Cliente
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-primary/20 shadow-md overflow-hidden bg-primary/5">
            <div className="h-1.5 w-full bg-primary" />
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">Cliente Encontrado</p>
                  <h2 className="text-2xl font-serif font-bold text-foreground">{customer.fullName}</h2>
                  <p className="text-muted-foreground text-sm">{customer.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Progresso</p>
                  <p className="text-lg font-bold font-serif text-primary">{formatMeals(customer.freeMealProgress)}/{FREE_MEAL_EVERY}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                {customer.freeMealsAvailable > 0 && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-3 py-1.5 text-sm font-medium">
                    <Tag className="h-4 w-4" />
                    {customer.freeMealsAvailable}× desconto de 50% disponível!
                  </div>
                )}
                <Button variant="ghost" size="sm" onClick={() => setSearchPhone("")} className="text-muted-foreground hover:text-foreground ml-auto">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-md">
            <form onSubmit={handleCheckIn}>
              <CardHeader>
                <CardTitle className="font-serif">Confirmar Visita</CardTitle>
                <CardDescription>
                  {config
                    ? `${config.label} · crédito automático: ${config.creditLabel}`
                    : "Fora do horário · crédito: 1 refeição (registo manual)"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas (Opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="ex: Mesa 4, aniversário..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="resize-none h-20"
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t border-border p-6">
                <Button type="submit" size="lg" className="w-full text-lg h-14 bg-primary hover:bg-primary/90" disabled={registerVisit.isPending}>
                  {registerVisit.isPending ? (
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-6 w-6" />
                  )}
                  Confirmar Visita
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
