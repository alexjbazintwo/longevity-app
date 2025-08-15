// src/components/Footer.tsx
import { useVertical } from "@/context/verticalContext";

export default function Footer() {
  const { pack } = useVertical();
  return (
    <footer className="border-t border-white/10 bg-black/80 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 sm:flex-row sm:px-8">
        <div className="text-sm text-white/75">
          © {new Date().getFullYear()} {pack.brand.name}. All rights reserved.
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-white/75">
          <a href="#" className="hover:text-white">
            Privacy
          </a>
          <a href="#" className="hover:text-white">
            Terms
          </a>
          <a href="#" className="hover:text-white">
            Security
          </a>
        </div>
      </div>
    </footer>
  );
}
