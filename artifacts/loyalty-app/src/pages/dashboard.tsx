import { useGetDashboardStats, useGetRecentActivity, useGetBirthdaysToday, getGetDashboardStatsQueryKey, getGetRecentActivityQueryKey, getGetBirthdaysTodayQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Utensils, Tag, Activity, Cake, Phone } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });
  const { data: activities, isLoading: activitiesLoading } = useGetRecentActivity({ query: { queryKey: getGetRecentActivityQueryKey() } });
  const { data: birthdays } = useGetBirthdaysToday({ query: { queryKey: getGetBirthdaysTodayQueryKey() } });

  const todayLabel = new Date().toLocaleDateString("pt-PT", { day: "numeric", month: "long" });

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-serif text-foreground font-semibold tracking-tight">Resumo</h1>
        <p className="text-muted-foreground mt-1">Estado atual do programa de fidelização.</p>
      </div>

      {/* Birthday alert */}
      {birthdays && birthdays.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-amber-100 p-2">
              <Cake className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-900">
                {birthdays.length === 1
                  ? "1 cliente faz anos hoje"
                  : `${birthdays.length} clientes fazem anos hoje`} — {todayLabel}
              </p>
              <p className="text-sm text-amber-700 mt-0.5 mb-1">
                🎂 Oferta: <strong>refeição grátis + bolo de porção individual</strong>.
              </p>
              <p className="text-xs text-amber-600 mb-3">
                Condição obrigatória: o cliente deve estar acompanhado de pelo menos 1 pessoa.
              </p>
              <div className="flex flex-col gap-2">
                {birthdays.map((c) => (
                  <Link key={c.id} href={`/customers/${c.id}`}>
                    <div className="flex items-center justify-between rounded-lg bg-white border border-amber-100 px-3 py-2.5 hover:border-amber-300 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-700 font-semibold text-sm">
                          {c.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{c.fullName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{c.phone}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-amber-600 font-medium shrink-0 ml-2">Ver perfil →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
        ) : stats ? (
          <>
            <StatCard title="Clientes Ativos" value={stats.activeCustomers} icon={Users} trend={`${stats.totalCustomers} total`} />
            <StatCard title="Visitas Hoje" value={stats.visitsToday} icon={Utensils} trend={`${stats.visitsThisMonth} este mês`} />
            <StatCard title="Descontos Utilizados" value={stats.totalRedemptions} icon={Tag} trend="Acumulado total" />
            <StatCard title="Total Visitas" value={stats.totalVisitsAllTime} icon={Activity} trend="Acumulado total" />
          </>
        ) : null}
      </div>

      {/* Activity Feed */}
      <Card className="border-border shadow-sm flex flex-col">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          {activitiesLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-6">
              {activities.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-0.5 relative">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-primary" />
                    {i !== activities.length - 1 && (
                      <div className="absolute top-4 left-1 w-px h-full bg-border -ml-[0.5px]" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {item.customerName} <span className="font-normal text-muted-foreground">{item.description}</span>
                    </p>
                    <span className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString("pt-PT")}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground text-sm">
              Sem atividade recente.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend }: { title: string, value: number, icon: any, trend: string }) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex items-baseline space-x-2">
          <h2 className="text-3xl font-serif font-bold text-foreground">{value}</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{trend}</p>
      </CardContent>
    </Card>
  );
}
