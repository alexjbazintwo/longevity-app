// src/pages/planPreview.tsx
import LoadingOverlay from "@/components/ui/loadingOverlay";
import { usePlanPreviewData } from "@/hooks/usePlanPreviewData";

export default function PlanPreview() {
  const { isLoading } = usePlanPreviewData();

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-gradient-to-b from-[#0a1024] via-[#0a1024] to-black">
      <LoadingOverlay show={isLoading} />
      {!isLoading && (
        <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-8 text-white">
          {/* Intentionally blank for now — we'll add the preview UI next */}
        </div>
      )}
    </div>
  );
}
