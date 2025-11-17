import Link from 'next/link';
import { ShieldAlert, Home, Disc3, Music } from 'lucide-react';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center px-4">
            <div className="max-w-2xl w-full">
                {/* Vinyl Record Graphic with Shield */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        {/* Vinyl Record Background */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                            <Disc3 className="w-64 h-64 text-gray-900" strokeWidth={0.5} />
                        </div>

                        {/* Shield Icon */}
                        <div className="relative z-10 flex items-center justify-center py-12">
                            <div className="bg-[#c9a961] bg-opacity-20 rounded-full p-8">
                                <ShieldAlert className="w-24 h-24 text-[#c9a961]" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="text-center">
                    {/* Error Code */}
                    <div className="mb-4">
                        <span className="inline-block px-4 py-1 bg-[#c9a961] text-white text-sm font-semibold uppercase tracking-widest">
                            Error 403
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="font-['Bebas_Neue'] text-6xl md:text-7xl text-gray-900 mb-4 tracking-wide">
                        ACCESS DENIED
                    </h1>

                    {/* Description */}
                    <p className="text-xl text-gray-700 mb-3 max-w-lg mx-auto font-light">
                        You don't have permission to access this page.
                    </p>

                    <p className="text-gray-600 mb-10 max-w-md mx-auto">
                        This area is restricted to administrators only. If you believe this is a mistake, please contact our support team.
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

                    {/* Additional Info */}
                    <div className="mt-12 pt-8 border-t border-gray-300">
                        <p className="text-sm text-gray-600">
                            Need assistance?{' '}
                            <Link
                                href="/contact"
                                className="text-[#c9a961] hover:text-[#b8934d] font-semibold underline"
                            >
                                Contact Support
                            </Link>
                        </p>
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
    title: 'Access Denied - Hysteria Music',
    description: 'You do not have permission to access this page.',
};