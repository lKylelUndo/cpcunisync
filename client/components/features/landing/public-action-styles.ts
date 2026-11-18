// Action styles shared by the landing and auth navs across the server/client
// boundary. Keep this module dependency-free — both graphs import it.
export const PRIMARY_ACTION =
  "bg-[#1e3a8a] text-white shadow-[0_12px_28px_-12px_rgba(34,58,143,0.7)] transition-all hover:bg-[#223a8f] hover:shadow-[0_16px_32px_-12px_rgba(34,58,143,0.75)] motion-reduce:transition-none dark:bg-[#223a8f] dark:hover:bg-[#2b46a3]";

export const OUTLINE_ACTION =
  "border-[#1e3a8a]/25 bg-white text-[#101f4e] transition-all hover:bg-[#eef2fb] hover:text-[#101f4e] motion-reduce:transition-none dark:border-white/20 dark:bg-transparent dark:text-slate-100 dark:hover:bg-white/10 dark:hover:text-white";

export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f9fc] dark:focus-visible:ring-[#f0c14b] dark:focus-visible:ring-offset-[#0a1024]";
