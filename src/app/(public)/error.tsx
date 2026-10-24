"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function PublicError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="w-full bg-[#F5F4F0] text-[#151B2E] py-20 sm:py-28">
      <div className="mx-auto max-w-xl px-4 text-center space-y-6">
        <h1 className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-tight">
          This page is temporarily unavailable
        </h1>
        <p className="text-sm sm:text-base text-[#35362B] leading-relaxed">
          We&rsquo;re having trouble loading this content right now. Please try
          again in a few minutes.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="cta-button cta-primary inline-flex font-bold"
          >
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="font-display text-xs font-bold uppercase tracking-widest text-[#184098] hover:underline"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
