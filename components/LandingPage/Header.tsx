"use client";

import { useState } from "react";
import { Menu, X, Globe } from "lucide-react";

interface HeaderProps {
    onLoginClick: () => void;
    onGetStartedClick: () => void;
}

export default function Header({ onLoginClick, onGetStartedClick }: HeaderProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <div className="flex items-center gap-2">

                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#product" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Product</a>
                        <a href="#solutions" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Solutions</a>
                        <a href="#" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Resources</a>
                        <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Pricing</a>
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <button className="text-gray-600 hover:text-black transition-colors">
                            <Globe className="h-5 w-5" />
                        </button>
                        <button
                            onClick={onLoginClick}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                            Log In
                        </button>
                        <button
                            onClick={onGetStartedClick}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                        >
                            Get Started
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-900 focus:outline-none"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        <a href="#product" className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md">Product</a>
                        <a href="#solutions" className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md">Solutions</a>
                        <a href="#" className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md">Resources</a>
                        <a href="#pricing" className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md">Pricing</a>
                        <div className="border-t border-gray-100 my-2 pt-2">
                            <button
                                onClick={onLoginClick}
                                className="block w-full text-left px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md"
                            >
                                Log In
                            </button>
                            <button
                                onClick={onGetStartedClick}
                                className="block w-full text-center mt-3 bg-blue-600 text-white px-3 py-3 rounded-full text-base font-medium hover:bg-blue-700"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
