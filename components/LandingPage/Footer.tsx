import { Instagram, Facebook, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-20 pb-12">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
                    {/* Brand Section */}
                    <div className="md:col-span-12 lg:col-span-5">
                        <div className="mb-6">
                            <span className="text-3xl font-medium tracking-tighter text-black">
                                olleey.com
                            </span>
                        </div>
                        <p className="text-base text-gray-500 mb-8 max-w-sm leading-relaxed">
                            One upload, endless languages. Reach global audiences instantly with AI-powered localization.
                        </p>
                        <div className="flex gap-6">
                            <a href="#" className="text-gray-400 hover:text-black transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-black transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-black transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-black transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links Sections */}
                    <div className="md:col-span-4 lg:col-span-2 lg:col-start-7">
                        <h4 className="text-sm font-semibold text-black mb-6 uppercase tracking-wider">Product</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-base text-gray-500 hover:text-black transition-colors">Overview</a></li>
                            <li><a href="#" className="text-base text-gray-500 hover:text-black transition-colors">Pricing</a></li>
                            <li><a href="#" className="text-base text-gray-500 hover:text-black transition-colors">Marketplace</a></li>
                            <li><a href="#" className="text-base text-gray-500 hover:text-black transition-colors">Features</a></li>
                        </ul>
                    </div>

                    <div className="md:col-span-4 lg:col-span-2">
                        <h4 className="text-sm font-semibold text-black mb-6 uppercase tracking-wider">Company</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-base text-gray-500 hover:text-black transition-colors">About</a></li>
                            <li><a href="#" className="text-base text-gray-500 hover:text-black transition-colors">Team</a></li>
                            <li><a href="#" className="text-base text-gray-500 hover:text-black transition-colors">Blog</a></li>
                            <li><a href="#" className="text-base text-gray-500 hover:text-black transition-colors">Careers</a></li>
                        </ul>
                    </div>

                    <div className="md:col-span-4 lg:col-span-2">
                        <h4 className="text-sm font-semibold text-black mb-6 uppercase tracking-wider">Resources</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-base text-gray-500 hover:text-black transition-colors">Help</a></li>
                            <li><a href="#" className="text-base text-gray-500 hover:text-black transition-colors">Sales</a></li>
                            <li><a href="#" className="text-base text-gray-500 hover:text-black transition-colors">Advertise</a></li>
                            <li><a href="#" className="text-base text-gray-500 hover:text-black transition-colors">Privacy</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} olleey.com. All rights reserved.
                    </p>
                    <div className="flex gap-8 text-sm text-gray-500">
                        <a href="#" className="hover:text-black transition-colors">Terms and Conditions</a>
                        <a href="#" className="hover:text-black transition-colors">Privacy Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
