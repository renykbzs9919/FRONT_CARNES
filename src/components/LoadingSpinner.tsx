import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-[9999]">
      <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-lg font-semibold">
          Recuperando datos guardados, espere un momento...
        </p>
      </div>
    </div>
  );
}
