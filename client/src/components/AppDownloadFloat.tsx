import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Smartphone, Download, X } from "lucide-react";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.gharsansar";

const AppDownloadFloat = () => {
  const location = useLocation();
  const [dismissed, setDismissed] = useState(false);

  const shouldHideOnRoute = useMemo(() => {
    const pathname = location.pathname.toLowerCase();
    return pathname.startsWith("/admin") || pathname.startsWith("/vendor");
  }, [location.pathname]);

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (dismissed || shouldHideOnRoute) {
    return null;
  }

  return (
    <div className="fixed right-3 md:right-5 bottom-24 md:bottom-6 z-[60] flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Hide app download button"
        className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-500 shadow hover:text-blue-700"
      >
        <X className="h-4 w-4" />
      </button>

      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="MGSA Download the app"
        className="group"
      >
        <div className="flex items-center gap-2 rounded-full border border-blue-500 bg-gradient-to-r from-blue-600 to-cyan-500 px-2 py-2 pr-3 shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white">
            <Smartphone className="h-4 w-4" />
          </div>
          <div className="block leading-tight">
            <p className="text-[10px] sm:text-[11px] font-semibold text-white">
              MGSA
            </p>
            <p className="text-[10px] sm:text-[11px] text-blue-50">
              Download the app
            </p>
          </div>
          <Download className="h-4 w-4 text-white sm:ml-1" />
        </div>
      </a>
    </div>
  );
};

export default AppDownloadFloat;
