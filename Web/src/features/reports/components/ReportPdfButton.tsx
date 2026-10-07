"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { WEB_API_ROUTES } from "@/shared/config/routes";
import { t } from "@/shared/translations";
import { translateError } from "@/shared/utils/error-translator";

interface ReportPdfButtonProps {
  readonly url: string;
  readonly disabled?: boolean;
}

const withLang = (url: string, lang: string) =>
  `${url}${url.includes("?") ? "&" : "?"}lang=${encodeURIComponent(lang)}`;

const openInNewTab = (href: string) => {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
};

const readErrorMessage = async (response: Response, contentType: string): Promise<string> => {
  if (response.status === 401) {
    return t.common.sessionExpired;
  }
  if (response.status === 403) {
    return t.common.pdfForbidden;
  }
  if (contentType.includes("application/json")) {
    try {
      const data = (await response.json()) as { error?: unknown };
      if (typeof data.error === "string" && data.error) {
        return translateError(data.error);
      }
    } catch {
      // respuesta sin cuerpo JSON
    }
  }
  return t.common.pdfError;
};

export const ReportPdfButton = ({ url, disabled = false }: ReportPdfButtonProps) => {
  const locale = useLocale();
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetUrl = withLang(`${WEB_API_ROUTES.backend}${url}`, locale);

  const handleClick = async () => {
    if (isChecking || disabled) return;
    setError(null);

    const tab = window.open("about:blank", "_blank");

    setIsChecking(true);
    try {
      const response = await fetch(targetUrl, { cache: "no-store" });
      const contentType = response.headers.get("content-type") ?? "";

      if (response.ok && contentType.includes("application/pdf")) {
        if (tab) {
          tab.location.href = targetUrl;
          try {
            tab.opener = null;
          } catch {
            // el navegador puede bloquear la desconexión del opener
          }
        } else {
          openInNewTab(targetUrl);
        }
        return;
      }

      if (tab) {
        try {
          tab.close();
        } catch {
          // el navegador puede bloquear el cierre
        }
      }
      setError(await readErrorMessage(response, contentType));
    } catch {
      if (tab) {
        try {
          tab.close();
        } catch {
          // el navegador puede bloquear el cierre
        }
      }
      setError(t.common.pdfError);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={disabled || isChecking}
      >
        {isChecking ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Download />
        )}
        {isChecking ? t.common.generatingPdf : t.common.downloadPdf}
      </Button>
      {error && (
        <p role="alert" className="max-w-56 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};
