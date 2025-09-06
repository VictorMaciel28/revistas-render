"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";

interface WizardLayoutProps {
  title: string;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  disableNext?: boolean;
  customActions?: ReactNode;
  fromWizard?: boolean; // Indica se é fluxo wizard
}

export default function WizardLayout({
  title,
  children,
  onBack,
  onNext,
  nextLabel = "Próxima etapa >",
  disableNext = false,
  customActions,
  fromWizard = false,
}: WizardLayoutProps) {
  const router = useRouter();

  return (
    <div className="d-flex justify-content-center py-5">
      <div className="w-100" style={{ maxWidth: "700px" }}>
        <h2 className="text-center mb-4">{title}</h2>
        <div>{children}</div>

        <div className="d-flex justify-content-between mt-4">
          <div className="d-flex">
            {fromWizard && onBack && (
              <button className="btn btn-secondary me-2" onClick={onBack}>
                Novo capitulo
              </button>
            )}

            {!fromWizard && (
              <button
                className="btn btn-primary"
                onClick={() => router.push("/documentation")}
              >
                Voltar
              </button>
            )}
          </div>
          

          <div className="d-flex ms-auto align-items-center">
            {customActions && <div className="me-2">{customActions}</div>}

            {fromWizard && onNext && (
              <button
                className="btn btn-success"
                onClick={onNext}
                disabled={disableNext}
              >
                {nextLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}