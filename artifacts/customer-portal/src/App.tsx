import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { setAuthTokenGetter } from "@workspace/api-client-react/custom-fetch";
import axios from "axios";
import { LangProvider, useLang, type Lang } from "@/lib/i18n";

// Pages
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";
import HomePage from "@/pages/home";
import CheckinSuccessPage from "@/pages/checkin-success";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Configure API clients with token
const getToken = () => localStorage.getItem("portal_token");
setAuthTokenGetter(getToken);

axios.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers["Authorization"] = `Bearer ${t}`;
  return config;
});

const LANGS: { code: Lang; label: string }[] = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
  { code: "fr", label: "FR" },
];

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="absolute top-4 right-4 z-50 flex rounded-2xl border-2 border-primary/20 bg-card shadow-lg overflow-hidden">
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={`px-4 py-2 text-sm font-bold tracking-wide transition-colors ${
            lang === code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Router() {
  return (
    <div className="min-h-[100dvh] w-full bg-background flex justify-center">
      <div className="w-full max-w-[430px] bg-card shadow-xl overflow-hidden relative flex flex-col">
        <LangToggle />
        <Switch>
          <Route path="/" component={AuthPage} />
          <Route path="/home" component={HomePage} />
          <Route path="/checkin-success" component={CheckinSuccessPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LangProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </LangProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
