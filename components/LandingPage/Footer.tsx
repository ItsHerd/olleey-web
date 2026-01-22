"use client";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-12">
            <div className="max-w-[1920px] mx-auto px-5 md:px-12 lg:px-[90px]">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
                    <div className="col-span-2 lg:col-span-1">
                        <div className="mb-6 flex items-center gap-2">
                            <img src="/logo.png" alt="logo" className="w-40 h-24" />
                            <span className="text-2xl font-normal tracking-tighter text-black">olleey</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-6 max-w-xs">
                            olleey.com is a platform that helps you create and grow your online presence.
                        </p>
                        <div className="flex gap-4">
                            {/* Social icons placeholders */}
                            <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                            <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                            <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                        </div>
                    </div>

                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        &copy; 2026 Olleey.com, Inc. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-gray-500">
                        <a href="#" className="hover:text-black">Terms</a>
                        <a href="#" className="hover:text-black">Privacy</a>
                        <a href="#" className="hover:text-black">Sitemap</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
