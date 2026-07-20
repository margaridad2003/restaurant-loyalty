import { useState } from "react";
import { useGetCustomer, useGetCustomerVisits, useGetCustomerRedemptions, useRedeemReward, useUpdateCustomer, getGetCustomerQueryKey, getGetCustomerVisitsQueryKey, getGetCustomerRedemptionsQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Gift, History, Star, Phone, Mail, Calendar, Edit, Tag, Cake, Sunrise, Moon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FREE_MEAL_EVERY } from "@/lib/tiers";
import { Badge } from "@/components/ui/badge";

function isBirthdayToday(birthMonth: number | null | undefined, birthDay: number | null | undefined): boolean {
  if (!birthMonth || !birthDay) return false;
  const now = new Date();
  return now.getMonth() + 1 === birthMonth && now.getDate() === birthDay;
}

function rewardLabel(rewardType: string): string {
  if (rewardType === "desconto_50") return "50% de Desconto";
  if (rewardType === "aniversario") return "Oferta de Aniversário";
  if (rewardType === "refeicao_gratis") return "Refeição Grátis";
  return rewardType;
}

function formatMeals(n: number): string {
  if (n === 0) return "0";
  if (n % 1 === 0.5 && n < 1) return "½";
  if (n % 1 === 0.5) return `${Math.floor(n)}½`;
  return n.toString();
}

export default function CustomerProfile() {
  const { id } = useParams();
  const customerId = parseInt(id || "0", 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customer, isLoading: loadingCustomer } = useGetCustomer(customerId, { query: { enabled: !!customerId, queryKey: getGetCustomerQueryKey(customerId) } });
  const { data: visits, isLoading: loadingVisits } = useGetCustomerVisits(customerId, { query: { enabled: !!customerId, queryKey: getGetCustomerVisitsQueryKey(customerId) } });
  const { data: redemptions, isLoading: loadingRedemptions } = useGetCustomerRedemptions(customerId, { query: { enabled: !!customerId, queryKey: getGetCustomerRedemptionsQueryKey(customerId) } });

  const updateMutation = useUpdateCustomer();
  const redeemMutation = useRedeemReward();
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [isBirthdayRedeemOpen, setIsBirthdayRedeemOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editBirthMonth, setEditBirthMonth] = useState("");
  const [editBirthDay, setEditBirthDay] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  const handleEditOpen = () => {
    if (customer) {
      setEditName(customer.fullName);
      setEditEmail(customer.email || "");
      setEditBirthMonth(customer.birthMonth?.toString() || "");
      setEditBirthDay(customer.birthDay?.toString() || "");
      setEditIsActive(customer.isActive);
      setIsEditOpen(true);
    }
  };

  const handleUpdate = () => {
    updateMutation.mutate({
      id: customerId,
      data: {
        fullName: editName || undefined,
        email: editEmail || undefined,
        birthMonth: editBirthMonth ? parseInt(editBirthMonth) : undefined,
        birthDay: editBirthDay ? parseInt(editBirthDay) : undefined,
        isActive: editIsActive,
      }
    }, {
      onSuccess: () => {
        toast({ title: "Cliente Atualizado", description: "Informações guardadas com sucesso." });
        setIsEditOpen(false);
        queryClient.invalidateQueries({ queryKey: getGetCustomerQueryKey(customerId) });
      },
      onError: (error) => {
        toast({ title: "Erro ao Atualizar", description: (error.data as any)?.error || "Falha ao atualizar perfil", variant: "destructive" });
      }
    });
  };

  if (loadingCustomer) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!customer) {
    return <div>Cliente não encontrado.</div>;
  }

  const progressPercent = (customer.freeMealProgress / FREE_MEAL_EVERY) * 100;
  const birthdayToday = isBirthdayToday(customer.birthMonth, customer.birthDay);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getGetCustomerRedemptionsQueryKey(customerId) });
    queryClient.invalidateQueries({ queryKey: getGetCustomerQueryKey(customerId) });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
  };

  const handleRedeem = () => {
    redeemMutation.mutate({ data: { customerId, rewardType: "desconto_50" } }, {
      onSuccess: () => {
        toast({ title: "Desconto de 50% Utilizado!", description: "A recompensa foi registada com sucesso." });
        setIsRedeemOpen(false);
        invalidateAll();
      },
      onError: (error) => {
        toast({ title: "Erro", description: (error.data as any)?.error || "Falha ao registar recompensa", variant: "destructive" });
      }
    });
  };

  const handleBirthdayRedeem = () => {
    redeemMutation.mutate({ data: { customerId, rewardType: "aniversario" } }, {
      onSuccess: () => {
        toast({ title: "Oferta de Aniversário Registada! 🎂", description: "Refeição grátis + bolo de porção individual registados." });
        setIsBirthdayRedeemOpen(false);
        invalidateAll();
      },
      onError: (error) => {
        toast({ title: "Erro", description: (error.data as any)?.error || "Falha ao registar oferta de aniversário", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Birthday Banner */}
      {birthdayToday && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
          <Cake className="h-6 w-6 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-amber-900">🎂 Hoje é o aniversário de {customer.fullName}!</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Oferta: <strong>refeição grátis + bolo de porção individual</strong>.<br />
              <span className="text-xs">Condição obrigatória: mínimo 1 acompanhante.</span>
            </p>
          </div>
          <Dialog open={isBirthdayRedeemOpen} onOpenChange={setIsBirthdayRedeemOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white">
                <Cake className="mr-1.5 h-4 w-4" />
                Usar Oferta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif">Confirmar Oferta de Aniversário</DialogTitle>
                <DialogDescription asChild>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Confirmar que <strong>{customer.fullName}</strong> está a usar a oferta de aniversário hoje.</p>
                    <p><strong>Inclui:</strong> refeição grátis + bolo de porção individual.</p>
                    <p className="text-amber-700 font-medium">⚠️ Condição obrigatória: o cliente deve estar acompanhado de pelo menos 1 pessoa.</p>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsBirthdayRedeemOpen(false)}>Cancelar</Button>
                <Button onClick={handleBirthdayRedeem} disabled={redeemMutation.isPending} className="bg-amber-600 hover:bg-amber-700">
                  {redeemMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirmar Oferta
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Header Card */}
      <Card className="border-border shadow-sm overflow-hidden">
        <div className="h-24 bg-primary/10"></div>
        <CardContent className="pt-0 relative px-6 sm:px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 -mt-10 mb-6">
            <div className="flex items-end gap-4">
              <div className="h-20 w-20 rounded-full bg-card border-4 border-card flex items-center justify-center text-2xl font-serif font-bold text-primary shadow-sm">
                {customer.fullName.substring(0, 2).toUpperCase()}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-serif font-bold text-foreground">{customer.fullName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  {customer.isActive === false && (
                    <Badge variant="destructive" className="uppercase tracking-wider text-xs">Inativo</Badge>
                  )}
                  {customer.freeMealsAvailable > 0 && (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 uppercase tracking-wider text-xs">
                      {customer.freeMealsAvailable}× 50% Desconto!
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="shadow-sm" onClick={handleEditOpen}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-serif">Editar Perfil</DialogTitle>
                    <DialogDescription>Atualizar dados do cliente.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Nome Completo</Label>
                      <Input value={editName} onChange={e => setEditName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={editEmail} onChange={e => setEditEmail(e.target.value)} type="email" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Mês de Nascimento (1-12)</Label>
                        <Input value={editBirthMonth} onChange={e => setEditBirthMonth(e.target.value)} type="number" min="1" max="12" />
                      </div>
                      <div className="space-y-2">
                        <Label>Dia de Nascimento (1-31)</Label>
                        <Input value={editBirthDay} onChange={e => setEditBirthDay(e.target.value)} type="number" min="1" max="31" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox id="active" checked={editIsActive} onCheckedChange={(checked) => setEditIsActive(!!checked)} />
                      <Label htmlFor="active">Conta Ativa</Label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
                    <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                      {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Guardar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isRedeemOpen} onOpenChange={setIsRedeemOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                    disabled={customer.freeMealsAvailable <= 0}
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    Usar 50% Desconto
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-serif">Confirmar 50% de Desconto</DialogTitle>
                    <DialogDescription>
                      {customer.fullName} tem <strong>{customer.freeMealsAvailable}</strong> desconto(s) de 50% disponível(is).
                      Este desconto aplica-se na próxima refeição no Restaurante.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsRedeemOpen(false)}>Cancelar</Button>
                    <Button onClick={handleRedeem} disabled={redeemMutation.isPending}>
                      {redeemMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirmar Desconto
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{customer.phone}</span>
              </div>
              {customer.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{customer.email}</span>
                </div>
              )}
              {(customer.birthMonth && customer.birthDay) ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Aniversário: {customer.birthDay}/{customer.birthMonth}</span>
                </div>
              ) : null}
            </div>

            <div className="md:col-span-2 bg-muted/20 p-4 rounded-xl border border-border">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Progresso para Desconto 50%</p>
                  <p className="text-2xl font-bold font-serif text-foreground">
                    {formatMeals(customer.freeMealProgress)}
                    <span className="text-sm font-normal font-sans text-muted-foreground">/{FREE_MEAL_EVERY} refeições</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-sm font-semibold">{formatMeals(customer.totalMeals)} refeições</p>
                </div>
              </div>
              <Progress value={progressPercent} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                {formatMeals(FREE_MEAL_EVERY - customer.freeMealProgress)} refeição(ões) até ao próximo desconto de 50% na próxima refeição no Restaurante
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="visits" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted/50">
          <TabsTrigger value="visits" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Histórico</TabsTrigger>
          <TabsTrigger value="redemptions" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Recompensas</TabsTrigger>
          <TabsTrigger value="info" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">Benefícios</TabsTrigger>
        </TabsList>

        <TabsContent value="visits" className="mt-4">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Histórico de Visitas
              </CardTitle>
              <CardDescription>Todas as visitas registadas.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingVisits ? (
                <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
              ) : visits && visits.length > 0 ? (
                <div className="space-y-4">
                  {visits.map((visit) => (
                    <div key={visit.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border">
                      <div>
                        <p className="font-medium text-sm">{new Date(visit.visitDate).toLocaleDateString("pt-PT")} às {new Date(visit.visitDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                        <p className="text-xs text-muted-foreground">{formatMeals(visit.mealsCount as number)} refeição • {visit.notes || "Sem notas"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">+{formatMeals(visit.mealsCount as number)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">Sem visitas registadas.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="redemptions" className="mt-4">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Histórico de Recompensas
              </CardTitle>
              <CardDescription>Descontos e ofertas utilizados.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingRedemptions ? (
                <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
              ) : redemptions && redemptions.length > 0 ? (
                <div className="space-y-4">
                  {redemptions.map((redemption) => (
                    <div key={redemption.id} className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card shadow-sm">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${redemption.rewardType === "aniversario" ? "bg-amber-100 text-amber-600" : "bg-primary/10 text-primary"}`}>
                        {redemption.rewardType === "aniversario" ? <Cake className="h-5 w-5" /> : <Tag className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{rewardLabel(redemption.rewardType)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(redemption.redeemedAt).toLocaleString("pt-PT")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">Sem recompensas utilizadas.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="mt-4">
          <div className="space-y-4">
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Programa de Fidelização</CardTitle>
                <CardDescription>Todos os benefícios do cliente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Tag className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">50% de Desconto a cada {FREE_MEAL_EVERY} Refeições</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Por cada {FREE_MEAL_EVERY} refeições, o cliente ganha automaticamente <strong>50% de desconto na próxima refeição no Restaurante</strong>. Depois recomeça do zero.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Cake className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Oferta de Aniversário</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      No dia do seu aniversário, o cliente recebe a <strong>sua refeição grátis</strong> e um <strong>bolo de porção individual</strong>.
                    </p>
                    <p className="text-xs text-amber-700 mt-1 font-medium">⚠️ Condição: deve estar acompanhado de pelo menos 1 pessoa.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Funcionamento Aplicação Fidelidade</CardTitle>
                <CardDescription>Crédito automático consoante o período.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 p-3 rounded-xl border border-orange-100 bg-orange-50">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Sunrise className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">Pequeno-almoço · 7h30–11h00</p>
                    <p className="text-xs text-muted-foreground">Conta como <strong>½ refeição</strong> no programa de fidelização</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-xl border border-indigo-100 bg-indigo-50">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <Moon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">Jantar · 19h00–23h00</p>
                    <p className="text-xs text-muted-foreground">Conta como <strong>1 refeição completa</strong> no programa de fidelização</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
