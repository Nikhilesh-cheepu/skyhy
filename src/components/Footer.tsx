"use client";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/90 px-4 py-3">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-4 text-xs text-white/70 md:justify-between">
        <div className="flex items-center gap-3">
          <a
            href="https://www.instagram.com/skyhylive?utm_source=ig_web_button_share_sheet&igsh=MW0zZGtreHRnMHh2ag=="
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 hover:bg-white/10"
          >
            <span>📸</span>
            <span>Instagram</span>
          </a>
          <a
            href="https://wa.me/7013884485"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 hover:bg-white/10"
          >
            <span>💬</span>
            <span>WhatsApp</span>
          </a>
          <a
            href="https://maps.app.goo.gl/8izvX92jtyZyJnUV9?g_st=ic"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 hover:bg-white/10"
          >
            <span>📍</span>
            <span>Location</span>
          </a>
        </div>
        <p className="text-[10px] text-white/50">
          © 2024 SKYHY Live · Feel the Sky, Live the Music.
        </p>
      </div>
    </footer>
  );
}

