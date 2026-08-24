import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
              <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
              MarketDev | Hussain
            </div>
            <p className="text-sm text-white/50">
              Production-ready source code, sold directly by the developer who built it.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium text-white">Product</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><Link href="/projects" className="hover:text-white">Projects</Link></li>
              <li><Link href="/about" className="hover:text-white">About</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium text-white">Company</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><Link href="/terms" className="hover:text-white">Terms &amp; Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/refund" className="hover:text-white">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/40">
          © {new Date().getFullYear()} MarketDev | Hussain. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
