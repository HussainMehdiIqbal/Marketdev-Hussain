"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#05060a] px-6 text-center text-white">
        <span className="font-mono text-sm text-red-400">Something went wrong</span>
        <h1 className="mt-3 text-2xl font-semibold">We hit an unexpected error</h1>
        <p className="mt-2 max-w-sm text-sm text-white/50">
          Nothing you did caused this. Please try again — if it keeps happening, contact support.
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 rounded-full bg-[#63f2c0] px-6 py-3 text-sm font-semibold text-black"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
