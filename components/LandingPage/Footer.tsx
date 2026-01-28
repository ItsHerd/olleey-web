import Link from "next/link";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-black pt-32 pb-6 overflow-hidden border-t border-white/5">
            {/* Background Massive Text */}
            <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none z-0">
                <h2 className="text-[30vw] font-bold tracking-tighter leading-none select-none text-transparent bg-clip-text bg-gradient-to-b from-zinc-200 via-zinc-500 to-black opacity-30">
                    OLLEEY
                </h2>
            </div>

            <div className="relative z-10 max-w-[1920px] mx-auto px-8 lg:px-16">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-6 border-b border-transparent pb-32">
                    {/* Left Side: Copyright & Logo */}
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-1">
                            <p className="text-zinc-500 text-[13px] font-medium tracking-tight">
                                © {currentYear} olleey, All rights reserved
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <img src="/logo-transparent.png" alt="olleey" className="h-12 w-auto brightness-0 invert" />
                        </div>
                    </div>

                    {/* Right Side: Links */}
                    <nav className="flex flex-wrap items-center gap-x-8 gap-y-4 text-[13px] font-medium text-zinc-400">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                        <a href="#team" className="hover:text-white transition-colors">Team</a>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <a href="#" className="text-white hover:opacity-80 transition-colors">Book a Demo</a>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
