import { QRCodeSVG } from "qrcode.react";
import { Printer, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

function getPortalUrl(): string {
  const origin = window.location.origin;
  return `${origin}/portal/`;
}

export default function QrCodes() {
  const url = getPortalUrl();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold font-serif">QR Code do Restaurante</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Imprima e coloque nas mesas para os clientes acederem ao programa de fidelização.
          </p>
        </div>
        <Button onClick={() => window.print()} className="gap-2 shrink-0">
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
      </div>

      {/* Single QR card */}
      <div className="flex justify-center py-6">
        <div className="qr-card border border-border rounded-2xl p-10 flex flex-col items-center gap-6 bg-card shadow-sm max-w-xs w-full print:border print:shadow-none print:rounded-none print:max-w-full print:p-8">
          {/* Logo */}
          <div className="flex justify-center">
            <img src="/logo.png" alt="Origens Restaurante" className="w-52 object-contain" />
          </div>

          {/* Divider */}
          <div className="w-full border-t border-border/50" />

          {/* QR Code */}
          <div className="p-4 bg-white rounded-xl border border-border shadow-sm">
            <QRCodeSVG
              value={url}
              size={200}
              level="M"
              includeMargin={false}
            />
          </div>

          {/* Instructions */}
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-foreground">Programa de Fidelização</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Leia o QR code com o seu telemóvel para aceder ao portal e registar a sua visita
            </p>
          </div>

          {/* URL - only visible when printing */}
          <p className="text-[9px] text-muted-foreground/60 font-mono break-all text-center hidden print:block">
            {url}
          </p>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .qr-card, .qr-card * { visibility: visible; }
          .qr-card { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        }
      `}</style>
    </div>
  );
}
