import { useState } from "react";
import { useListCustomers, getListCustomersQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, UserPlus, ArrowRight, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { FREE_MEAL_EVERY } from "@/lib/tiers";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const params = {
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  };

  const { data: customers, isLoading } = useListCustomers(params, {
    query: { queryKey: getListCustomersQueryKey(params) }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-foreground font-semibold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground mt-1">Gerir e pesquisar a base de dados de membros.</p>
        </div>
        <Button asChild className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/customers/new">
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome ou telemóvel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telemóvel</TableHead>
              <TableHead className="text-center">Progresso (/{FREE_MEAL_EVERY})</TableHead>
              <TableHead className="text-right">Total Refeições</TableHead>
              <TableHead className="text-center">Desconto 50% Disp.</TableHead>
              <TableHead className="text-center">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-md mx-auto" /></TableCell>
                </TableRow>
              ))
            ) : customers && customers.length > 0 ? (
              customers.map((customer) => (
                <TableRow key={customer.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium text-foreground">{customer.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{customer.phone}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {Array.from({ length: FREE_MEAL_EVERY }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2.5 h-2.5 rounded-full ${i < customer.freeMealProgress ? "bg-primary" : "bg-muted"}`}
                        />
                      ))}
                      <span className="ml-2 text-xs text-muted-foreground">{customer.freeMealProgress}/{FREE_MEAL_EVERY}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{customer.totalMeals}</TableCell>
                  <TableCell className="text-center">
                    {customer.freeMealsAvailable > 0 ? (
                      <div className="inline-flex items-center gap-1 text-amber-600 font-medium text-sm">
                        <Tag className="h-3.5 w-3.5" />
                        {customer.freeMealsAvailable}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/customers/${customer.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
