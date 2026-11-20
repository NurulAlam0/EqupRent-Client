import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="grid min-h-screen place-items-center bg-[#f5f7fb] px-5 py-12"
    >
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-[#071a9e] text-white shadow-lg shadow-blue-900/20">
          <LoaderCircle
            aria-hidden="true"
            className="size-8 animate-spin text-cyan-300"
            strokeWidth={2.5}
          />
        </div>
        <p className="text-xl font-extrabold tracking-tight text-[#071a9e]">
          Rent<span className="text-cyan-600">ora</span>
        </p>
        <p className="mt-2 text-sm text-slate-500">Getting things ready…</p>
        <div className="mt-8 space-y-3" aria-hidden="true">
          <div className="mx-auto h-2.5 w-3/4 animate-pulse rounded-full bg-blue-100" />
          <div className="mx-auto h-2.5 w-1/2 animate-pulse rounded-full bg-slate-200" />
        </div>
        <span className="sr-only">Loading page</span>
      </div>
    </main>
  );
}
