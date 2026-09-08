"use client";

import { Check, Copy, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface EventShareButtonsProps {
  title: string;
  url?: string;
}

export function EventShareButtons({ title, url }: EventShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(url || "");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, []);

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(
    `${title} — PortHarcourtSchools Events`,
  );

  const handleCopy = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1 flex items-center gap-1">
        <Share2 className="size-3.5" />
        Share:
      </span>

      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 text-xs font-semibold transition-colors"
        title="Share on WhatsApp"
      >
        <MessageCircle className="size-3.5" />
        <span>WhatsApp</span>
      </a>

      {/* X / Twitter */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-black/5 text-[#151B2E] hover:bg-black/10 text-xs font-semibold transition-colors"
        title="Share on X"
      >
        <span className="font-bold text-xs">𝕏</span>
        <span>Post</span>
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 text-xs font-semibold transition-colors"
        title="Share on Facebook"
      >
        <svg
          className="size-3.5 fill-current"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        <span>Facebook</span>
      </a>

      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 text-xs font-semibold transition-colors"
        title="Share on LinkedIn"
      >
        <svg
          className="size-3.5 fill-current"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
        <span>LinkedIn</span>
      </a>

      {/* Copy Link */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="h-8 text-xs border-[#D9DEEC] text-[#151B2E]"
      >
        {copied ? (
          <>
            <Check className="size-3.5 mr-1 text-[#2E8B57]" />
            <span className="text-[#2E8B57]">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="size-3.5 mr-1 text-muted-foreground" />
            <span>Copy</span>
          </>
        )}
      </Button>
    </div>
  );
}
