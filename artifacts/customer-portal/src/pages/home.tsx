import React, { useState } from "react";
import { useLocation } from "wouter";
import { useGetPortalMe, getGetPortalMeQueryKey, useGetPortalVisits, getGetPortalVisitsQueryKey, usePortalCheckin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { enUS } from "date-fns/locale";
import { useLang } from "@/lib/i18n";
import { Tag, Cake, Sunrise, Moon, Clock } from "lucide-react";

const FREE_MEAL_EVERY = 5;

type Period = "breakfast" | "dinner" | null;

function getCurrentPeriod(): Period {
  const h = new Date().getHours();
  const m = new Date().getMinutes();
  const total = h * 60 + m;
  if (total >= 7 * 60 + 30 && total < 11 * 60) return "breakfast";
  if (total >= 19 * 60 && total < 23 * 60) return "dinner";
  return null;
}

function isBirthdayToday(birthMonth: number | null | undefined, birthDay: number | null | undefined): boolean {
  if (!birthMonth || !birthDay) return false;
  const now = new Date();
  return now.getMonth() + 1 === birthMonth && now.getDate() === birthDay;
}

function formatMeals(n: number): string {
  if (n === 0) return "0";
  if (n % 1 === 0.5 && n < 1) return "½";
  if (n % 1 === 0.5) return `${Math.floor(n)}½`;
  return n.toString();
}

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { lang, t } = useLang();
  const T = t.home;
  const TR = t.rewards as unknown as Record<string, string[]>;
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const period = getCurrentPeriod();

  const { data: customer, isLoading: isLoadingCustomer } = useGetPortalMe({
    query: { queryKey: getGetPortalMeQueryKey() }
  });

  const { data: visits, isLoading: isLoadingVisits } = useGetPortalVisits({
    query: { queryKey: getGetPortalVisitsQueryKey() }
  });

  const checkinMutation = usePortalCheckin();

  const handleCheckin = () => {
    setIsCheckingIn(true);
    checkinMutation.mutate({ data: { notes: "Self check-in" } }, {
      onSuccess: (res: any) => {
        const params = new URLSearchParams();
        if (res?.freeMealEarned) params.set("freemeal", "true");
        setLocation(`/checkin-success?${params.toString()}`);
      },
      onError: () => {
        toast({ title: T.checkinErrorTitle, description: T.checkinErrorDesc, variant: "destructive" });
        setIsCheckingIn(false);
      }
    });
  };

  const logout = () => {
    localStorage.removeItem("portal_token");
    setLocation("/");
  };

  if (isLoadingCustomer) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6 text-center">
        <p>{T.loadError}</p>
        <Button onClick={logout} className="mt-4">{T.back}</Button>
      </div>
    );
  }

  const freeMealProgress = customer.freeMealProgress ?? 0;
  const freeMealsAvailable = customer.freeMealsAvailable ?? 0;
  const progressPercent = (freeMealProgress / FREE_MEAL_EVERY) * 100;
  const birthdayToday = isBirthdayToday(customer.birthMonth, customer.birthDay);
  const dateLocale = lang === "pt" ? ptBR : enUS;

  return (
    <div className="flex-1 flex flex-col bg-muted/30 pb-20">
      {/* Header Profile */}
      <div className="bg-card px-6 py-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{T.welcome}</p>
            <h1 className="text-3xl font-serif font-bold text-foreground mt-1">{customer.fullName}</h1>
          </div>
          {freeMealsAvailable > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-sm font-semibold shadow-sm">
              <Tag className="h-4 w-4" />
              {freeMealsAvailable}× 50%!
            </div>
          )}
        </div>

        <div className="mt-6 space-y-2 relative z-10">
          <div className="flex justify-between text-sm font-medium">
            <span>{formatMeals(freeMealProgress)}/{FREE_MEAL_EVERY} {T.meals}</span>
            <span className="text-muted-foreground">
              {formatMeals(FREE_MEAL_EVERY - freeMealProgress)} {T.meals} → 50%
            </span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <div className="flex justify-between pt-1">
            {Array.from({ length: FREE_MEAL_EVERY }).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  i < Math.floor(freeMealProgress)
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4 flex-1 overflow-y-auto">
        {/* Birthday Banner */}
        {birthdayToday && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
            <Cake className="h-6 w-6 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-amber-900">{T.birthdayBenefit}</p>
              <p className="text-sm text-amber-700 mt-0.5">{T.birthdayBenefitDesc}</p>
            </div>
          </div>
        )}

        <Button
          size="lg"
          className="w-full h-16 text-lg rounded-2xl shadow-md font-medium"
          onClick={handleCheckin}
          disabled={isCheckingIn || !period}
        >
          {isCheckingIn ? T.checkingIn : period ? T.checkIn : T.checkInClosed}
        </Button>

        {/* Hours info */}
        <div className="rounded-xl bg-card border border-border p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{T.checkInSectionTitle}</p>
          <div className="flex items-center gap-3 text-sm text-foreground/80">
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
              <Sunrise className="h-4 w-4 text-orange-600" />
            </div>
            <span>{T.checkInHoursBreakfast}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground/80">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <Moon className="h-4 w-4 text-indigo-600" />
            </div>
            <span>{T.checkInHoursDinner}</span>
          </div>
          {!period && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground pt-1 border-t border-border mt-2">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="font-medium">{T.checkInClosed}</span>
            </div>
          )}
        </div>

        <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3 border-b bg-card">
            <CardTitle className="text-lg font-serif">{T.benefits}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 bg-card">
            <ul className="space-y-3">
              {(TR["bronze"] ?? []).map((reward: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm font-medium text-muted-foreground">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${i === 1 ? "bg-amber-400" : "bg-primary/40"}`} />
                  {reward}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="font-serif text-xl px-1">{T.recentVisits}</h3>
          {isLoadingVisits ? (
            <Skeleton className="h-24 w-full" />
          ) : visits && visits.length > 0 ? (
            <div className="space-y-3">
              {visits.slice(0, 3).map((v: any) => (
                <Card key={v.id} className="border-none shadow-sm rounded-xl">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {format(new Date(v.visitDate), lang === "pt" ? "dd 'de' MMMM, yyyy" : "MMMM d, yyyy", { locale: dateLocale })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatMeals(v.mealsCount)} {T.meals}
                      </p>
                    </div>
                    <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-semibold">
                      +{formatMeals(v.mealsCount)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">{T.noVisits}</p>
          )}
        </div>
      </div>

      <div className="p-6 pt-0 mt-auto">
        <Button variant="ghost" onClick={logout} className="w-full text-muted-foreground">{T.logout}</Button>
      </div>
    </div>
  );
}
