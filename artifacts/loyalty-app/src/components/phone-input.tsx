import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

export interface Country {
  flag: string;
  code: string;
  dialCode: string;
  name: string;
}

export const COUNTRIES: Country[] = [
  { flag: "🇵🇹", code: "PT", dialCode: "+351", name: "Portugal" },
  { flag: "🇧🇷", code: "BR", dialCode: "+55",  name: "Brasil" },
  { flag: "🇬🇧", code: "GB", dialCode: "+44",  name: "United Kingdom" },
  { flag: "🇪🇸", code: "ES", dialCode: "+34",  name: "España" },
  { flag: "🇫🇷", code: "FR", dialCode: "+33",  name: "France" },
  { flag: "🇩🇪", code: "DE", dialCode: "+49",  name: "Deutschland" },
  { flag: "🇮🇹", code: "IT", dialCode: "+39",  name: "Italia" },
  { flag: "🇳🇱", code: "NL", dialCode: "+31",  name: "Nederland" },
  { flag: "🇧🇪", code: "BE", dialCode: "+32",  name: "Belgique" },
  { flag: "🇨🇭", code: "CH", dialCode: "+41",  name: "Schweiz" },
  { flag: "🇦🇹", code: "AT", dialCode: "+43",  name: "Österreich" },
  { flag: "🇸🇪", code: "SE", dialCode: "+46",  name: "Sverige" },
  { flag: "🇳🇴", code: "NO", dialCode: "+47",  name: "Norge" },
  { flag: "🇩🇰", code: "DK", dialCode: "+45",  name: "Danmark" },
  { flag: "🇫🇮", code: "FI", dialCode: "+358", name: "Suomi" },
  { flag: "🇮🇪", code: "IE", dialCode: "+353", name: "Ireland" },
  { flag: "🇵🇱", code: "PL", dialCode: "+48",  name: "Polska" },
  { flag: "🇨🇿", code: "CZ", dialCode: "+420", name: "Česko" },
  { flag: "🇭🇺", code: "HU", dialCode: "+36",  name: "Magyarország" },
  { flag: "🇷🇴", code: "RO", dialCode: "+40",  name: "România" },
  { flag: "🇬🇷", code: "GR", dialCode: "+30",  name: "Ελλάδα" },
  { flag: "🇺🇦", code: "UA", dialCode: "+380", name: "Україна" },
  { flag: "🇷🇺", code: "RU", dialCode: "+7",   name: "Россия" },
  { flag: "🇺🇸", code: "US", dialCode: "+1",   name: "United States" },
  { flag: "🇨🇦", code: "CA", dialCode: "+1",   name: "Canada" },
  { flag: "🇲🇽", code: "MX", dialCode: "+52",  name: "México" },
  { flag: "🇦🇷", code: "AR", dialCode: "+54",  name: "Argentina" },
  { flag: "🇨🇴", code: "CO", dialCode: "+57",  name: "Colombia" },
  { flag: "🇦🇺", code: "AU", dialCode: "+61",  name: "Australia" },
  { flag: "🇯🇵", code: "JP", dialCode: "+81",  name: "日本" },
  { flag: "🇨🇳", code: "CN", dialCode: "+86",  name: "中国" },
  { flag: "🇮🇳", code: "IN", dialCode: "+91",  name: "India" },
  { flag: "🇦🇴", code: "AO", dialCode: "+244", name: "Angola" },
  { flag: "🇲🇿", code: "MZ", dialCode: "+258", name: "Moçambique" },
  { flag: "🇨🇻", code: "CV", dialCode: "+238", name: "Cabo Verde" },
  { flag: "🇸🇹", code: "ST", dialCode: "+239", name: "São Tomé" },
  { flag: "🇲🇦", code: "MA", dialCode: "+212", name: "Maroc" },
  { flag: "🇸🇦", code: "SA", dialCode: "+966", name: "السعودية" },
  { flag: "🇦🇪", code: "AE", dialCode: "+971", name: "الإمارات" },
  { flag: "🇮🇱", code: "IL", dialCode: "+972", name: "ישראל" },
];

function detectCountry(value: string): { country: Country; localNumber: string } {
  if (!value) return { country: COUNTRIES[0], localNumber: "" };
  for (const c of COUNTRIES) {
    if (value.startsWith(c.dialCode)) {
      return { country: c, localNumber: value.slice(c.dialCode.length) };
    }
  }
  return { country: COUNTRIES[0], localNumber: value };
}

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function PhoneInput({ value, onChange, placeholder, disabled, className }: PhoneInputProps) {
  const { country: initialCountry, localNumber: initialLocal } = detectCountry(value);
  const [country, setCountry] = useState<Country>(initialCountry);
  const [localNumber, setLocalNumber] = useState(initialLocal);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleCountrySelect = (c: Country) => {
    setCountry(c);
    setOpen(false);
    setSearch("");
    onChange(c.dialCode + localNumber);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/[^\d\s\-()]/g, "");
    setLocalNumber(num);
    onChange(country.dialCode + num);
  };

  return (
    <div ref={containerRef} className={`relative flex ${className ?? ""}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) setOpen((o) => !o); }}
        className="flex items-center gap-1.5 px-3 h-12 border border-input rounded-l-md bg-muted hover:bg-muted/70 border-r-0 text-sm font-medium whitespace-nowrap shrink-0 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span className="text-xl leading-none">{country.flag}</span>
        <span className="text-xs text-muted-foreground font-mono">{country.dialCode}</span>
        <svg className="h-3 w-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-72 rounded-xl border border-border bg-popover shadow-xl overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country..."
              className="w-full px-3 py-1.5 text-sm bg-muted rounded-lg outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="p-4 text-sm text-center text-muted-foreground">No results</p>
            )}
            {filtered.map((c) => (
              <button
                key={c.code + c.dialCode}
                type="button"
                onClick={() => handleCountrySelect(c)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted text-left transition-colors ${country.code === c.code && country.dialCode === c.dialCode ? "bg-primary/10 font-semibold" : ""}`}
              >
                <span className="text-lg leading-none">{c.flag}</span>
                <span className="flex-1 truncate">{c.name}</span>
                <span className="text-muted-foreground font-mono text-xs shrink-0">{c.dialCode}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <Input
        type="tel"
        value={localNumber}
        onChange={handleNumberChange}
        placeholder={placeholder ?? "912 000 000"}
        disabled={disabled}
        className="h-12 text-lg px-4 rounded-l-none flex-1"
      />
    </div>
  );
}
