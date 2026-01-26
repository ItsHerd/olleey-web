import { Instagram, Facebook, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-black py-20">
            <div className="max-w-[1920px] mx-auto px-2 md:px-8 lg:px-[40px]">
                <div className="text-center">
                    <h2 className="text-[80px] md:text-[120px] lg:text-[160px] font-bold tracking-tighter text-white leading-none mb-8">
                        olleey.com
                    </h2>
                    <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                        One upload, endless languages. Reach global audiences instantly with AI-powered localization.
                    </p>
                    <div className="flex gap-6 justify-center">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                            <Instagram className="w-6 h-6" />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                            <Facebook className="w-6 h-6" />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                            <Twitter className="w-6 h-6" />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                            <Linkedin className="w-6 h-6" />
                        </a>
                    </div>

                    <div className="flex gap-8 justify-center mt-8 text-sm">
                        <a href="/terms" className="text-gray-400 hover:text-white transition-colors">
                            Terms & Conditions
                        </a>
                        <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                            Privacy Policy
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
