import { Link } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { useState, useEffect, useRef } from "react";
import LogoutConfirmDialog from "./LogoutConfirmDialog";

const Navbar = () => {
    const { auth, auth: { signOut } } = usePuterStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
        setIsMobileMenuOpen(false); // Close mobile menu
    };

    const handleLogoutConfirm = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target as Node) &&
                mobileMenuButtonRef.current &&
                !mobileMenuButtonRef.current.contains(event.target as Node)
            ) {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileMenuOpen]);

    // Close mobile menu on escape key
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isMobileMenuOpen]);

    return (
        <>
            <nav className="navbar relative">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2">
                        <p 
                            className="text-2xl font-bold"
                            style={{
                                background: 'linear-gradient(to right, #AB8C95, #000000, #8E97C5)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}
                        >
                            RESUMIND
                        </p>
                    </Link>
                    
                    {/* Desktop Navigation */}
                    {auth.isAuthenticated && (
                        <div className="hidden md:flex items-center gap-6">
                            <Link 
                                to="/" 
                                className="text-gray-600 hover:text-gray-800 transition-colors font-medium"
                            >
                                Dashboard
                            </Link>
                            <Link 
                                to="/upload" 
                                className="text-gray-600 hover:text-gray-800 transition-colors font-medium"
                            >
                                Upload Resume
                            </Link>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {auth.isAuthenticated ? (
                        <>
                            {/* Desktop User Profile Section */}
                            <div className="hidden md:flex items-center gap-3">
                                <div className="flex flex-col items-end">
                                    <p className="text-sm font-medium text-gray-700">
                                        {auth.user?.username || 'User'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {auth.user?.email || 'Signed in'}
                                    </p>
                                </div>
                                
                                {/* User Avatar */}
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                    {auth.user?.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            </div>

                            {/* Desktop Logout Button */}
                            <button
                                onClick={handleLogoutClick}
                                className="hidden md:flex secondary-button px-4 py-2 text-sm"
                                aria-label="Sign out"
                            >
                                <div className="flex items-center gap-2">
                                    <img src="/icons/cross.svg" alt="logout" className="w-4 h-4" />
                                    <span>Sign Out</span>
                                </div>
                            </button>

                            {/* Mobile Menu Button */}
                            <button
                                ref={mobileMenuButtonRef}
                                onClick={toggleMobileMenu}
                                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                aria-label="Toggle mobile menu"
                                aria-expanded={isMobileMenuOpen}
                            >
                                <div className="w-6 h-6 flex flex-col justify-center items-center">
                                    <span className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
                                        isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''
                                    }`} />
                                    <span className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 mt-1 ${
                                        isMobileMenuOpen ? 'opacity-0' : ''
                                    }`} />
                                    <span className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 mt-1 ${
                                        isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''
                                    }`} />
                                </div>
                            </button>
                        </>
                    ) : (
                        <Link to="/auth" className="primary-button w-fit">
                            Sign In
                        </Link>
                    )}
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && auth.isAuthenticated && (
                    <div 
                        ref={mobileMenuRef}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 md:hidden animate-in slide-in-from-top-2 duration-200"
                    >
                        <div className="p-4 space-y-4">
                            {/* Mobile User Profile */}
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                    {auth.user?.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-700">
                                        {auth.user?.username || 'User'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {auth.user?.email || 'Signed in'}
                                    </p>
                                </div>
                            </div>

                            {/* Mobile Navigation Links */}
                            <div className="space-y-2">
                                <Link 
                                    to="/" 
                                    className="block w-full p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <Link 
                                    to="/upload" 
                                    className="block w-full p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Upload Resume
                                </Link>
                            </div>

                            {/* Mobile Logout Button */}
                            <button
                                onClick={handleLogoutClick}
                                className="w-full p-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                            >
                                <div className="flex items-center gap-2">
                                    <img src="/icons/cross.svg" alt="logout" className="w-4 h-4" />
                                    <span>Sign Out</span>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Logout Confirmation Dialog */}
            <LogoutConfirmDialog
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleLogoutConfirm}
                username={auth.user?.username}
            />
        </>
    );
};

export default Navbar;
