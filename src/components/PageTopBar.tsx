"use client";

import { useRouter } from "next/navigation";

type Props = {
  title: string;
  showBack?: boolean;
  fallbackHref?: string;
};

export default function PageTopBar({ title, showBack = false, fallbackHref = "/" }: Props) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white/80 hover:bg-white/10 active:bg-white/15"
            aria-label="Go back"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        <h1 className="text-xl font-semibold text-white">{title}</h1>
      </div>
    </div>
  );
}

