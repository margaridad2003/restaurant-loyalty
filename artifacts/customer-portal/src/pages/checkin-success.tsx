import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";

export default function CheckinSuccessPage() {
  const [, setLocation] = useLocation();
  const { t } = useLang();
  const T = t.checkinSuccess;
  const [discountEarned, setDiscountEarned] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setDiscountEarned(searchParams.get("freemeal") === "true");
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-primary text-primary-foreground text-center animate-in fade-in zoom-in duration-500">

      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-8 shadow-inner backdrop-blur-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>

      <h1 className="text-4xl font-serif font-bold mb-4 text-white">{T.title}</h1>
      <p className="text-xl opacity-90 mb-2">{T.visitRegistered}</p>

      {discountEarned && (
        <div className="mt-8 bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/20 w-full animate-in slide-in-from-bottom-8 delay-300">
          <p className="text-sm uppercase tracking-widest opacity-80 mb-2">{T.congrats}</p>
          <p className="text-2xl font-serif font-bold">{T.freeMealEarned}</p>
          <p className="text-sm opacity-75 mt-3 leading-relaxed">{T.freeMealDesc}</p>
        </div>
      )}

      <div className="mt-12 w-full">
        <Button
          onClick={() => setLocation("/home")}
          variant="secondary"
          className="w-full h-14 text-lg rounded-xl bg-white text-primary hover:bg-white/90"
        >
          {T.backHome}
        </Button>
      </div>
    </div>
  );
}
