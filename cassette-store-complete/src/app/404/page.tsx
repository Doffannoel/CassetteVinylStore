import Link from 'next/link';
import { Search, Home, Disc3, Music, AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center px-4">
            <div className="max-w-2xl w-full">
                {/* Broken Vinyl Record Graphic */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        {/* Large 404 Number Background */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-['Bebas_Neue'] text-[280px] text-gray-200 leading-none select-none">
                                404
                            </span>
                        </div>

                        {/* Broken Record Icon */}
                        <div className="relative z-10 flex items-center justify-center py-12">
                            <div className="relative">
                                {/* Vinyl Record with "crack" effect */}
                                <Disc3 className="w-32 h-32 text-[#c9a961]" strokeWidth={1.5} />
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#f5f5f0] transform -rotate-12"></div>
                                <AlertCircle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-gray-900 bg-[#f5f5f0] rounded-full p-1" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="text-center">
                    {/* Error Badge */}
                    <div className="mb-4">
                        <span className="inline-block px-4 py-1 bg-gray-900 text-white text-sm font-semibold uppercase tracking-widest">
                            Page Not Found
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="font-['Bebas_Neue'] text-6xl md:text-7xl text-gray-900 mb-4 tracking-wide">
                        RECORD NOT FOUND
                    </h1>

                    {/* Description */}
                    <p className="text-xl text-gray-700 mb-3 max-w-lg mx-auto font-light">
                        The page you're looking for seems to have skipped a beat.
                    </p>

                    <p className="text-gray-600 mb-10 max-w-md mx-auto">
                        It might have been moved, deleted, or perhaps it never existed. Let's get you back on track with our collection.
                    </p>

                    {/* Divider */}
                    <div className="flex items-center justify-center mb-10">
                        <div className="h-px w-16 bg-gray-400"></div>
                        <Music className="w-5 h-5 text-[#c9a961] mx-4" />
                        <div className="h-px w-16 bg-gray-400"></div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
                        {/* Primary Button */}
                        <Link
                            href="/"
                            className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#c9a961] text-white px-8 py-4 hover:bg-[#b8934d] transition-all uppercase tracking-widest font-semibold text-sm"
                        >
                            <Home className="w-5 h-5" />
                            <span>Back to Home</span>
                        </Link>

                        {/* Secondary Button */}
                        <Link
                            href="/products"
                            className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-transparent text-gray-900 border-2 border-gray-900 px-8 py-4 hover:bg-gray-900 hover:text-white transition-all uppercase tracking-widest font-semibold text-sm"
                        >
                            <Disc3 className="w-5 h-5" />
                            <span>Browse Music</span>
                        </Link>
                    </div>

                    {/* Search Suggestion */}
                    <div className="mt-10">
                        <p className="text-sm text-gray-600 mb-4">
                            Looking for something specific?
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 text-[#c9a961] hover:text-[#b8934d] font-semibold"
                        >
                            <Search className="w-4 h-4" />
                            <span>Search our collection</span>
                        </Link>
                    </div>

                    {/* Additional Links */}
                    <div className="mt-12 pt-8 border-t border-gray-300">
                        <p className="text-sm text-gray-600 mb-3">Quick Links:</p>
                        <div className="flex flex-wrap justify-center gap-4 text-sm">
                            <Link href="/products?category=vinyl" className="text-gray-700 hover:text-[#c9a961] transition">
                                Vinyl Records
                            </Link>
                            <span className="text-gray-400">•</span>
                            <Link href="/products?category=cd" className="text-gray-700 hover:text-[#c9a961] transition">
                                CDs
                            </Link>
                            <span className="text-gray-400">•</span>
                            <Link href="/products?category=cassette" className="text-gray-700 hover:text-[#c9a961] transition">
                                Cassettes
                            </Link>
                            <span className="text-gray-400">•</span>
                            <Link href="/contact" className="text-gray-700 hover:text-[#c9a961] transition">
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="flex justify-center gap-2 mt-8 opacity-30">
                    <div className="w-2 h-2 bg-[#c9a961] rotate-45"></div>
                    <div className="w-2 h-2 bg-[#c9a961] rotate-45"></div>
                    <div className="w-2 h-2 bg-[#c9a961] rotate-45"></div>
                </div>
            </div>
        </div>
    );
}

export const metadata = {
    title: '404 - Page Not Found | Hysteria Music',
    description: 'The page you are looking for could not be found.',
};