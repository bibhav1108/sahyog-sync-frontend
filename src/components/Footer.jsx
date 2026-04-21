import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="py-8 px-6 bg-[#142424] text-white border-t border-white/5 font-outfit">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-12">
                {/* Social Icons */}
                <div className="flex gap-6 flex-wrap justify-center">
                    {[
                        {
                            id: "tg",
                            brand: "Telegram",
                            color: "text-[#0088cc]",
                            href: "https://t.me/SahyogSyncBot#",
                            icon: (
                                <path d="M22 2L2 10.5L9.5 13.5L12 21L22 2Z" fill="currentColor" />
                            )
                        },
                        {
                            id: "ig",
                            brand: "Instagram",
                            color: "text-[#ee2a7b]",
                            href: "#",
                            icon: (
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.332 2.633-1.308 3.608-.975.975-2.242 1.245-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.308-.975-.975-1.245-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.245 3.608-1.308 1.266-.058-1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.571.071-3.082.353-4.223 1.493-1.141 1.141-1.422 2.651-1.493 4.223-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.071 1.571.353 3.082 1.493 4.223 1.14 1.14 2.651 1.422 4.223 1.493 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.571-.071 3.082-.353 4.223-1.493 1.141-1.141 1.422-2.651 1.493-4.223.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.071-1.571-.353-3.082-1.493-4.223-1.141-1.141-2.651-1.422-4.223-1.493-1.28-.058-1.688-.072-4.947-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c0-.796.646-1.441 1.441-1.441s1.441.645 1.441 1.441c0 .795-.646 1.441-1.441 1.441s-1.441-.646-1.441-1.441z" fill="currentColor" />
                            )
                        },
                        {
                            id: "gm",
                            brand: "Email Support",
                            color: "text-[#D14836]",
                            href: "#",
                            icon: (
                                <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM18 18H6V6.75L12 11.25L18 6.75V18Z" fill="currentColor" />
                            )
                        },
                    ].map(({ id, brand, color, href, icon }) => (
                        <a
                            key={id}
                            href={href}
                            className={`w-12 h-12 rounded-full bg-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg group shadow-sm`}
                            aria-label={brand}
                        >
                            <svg viewBox="0 0 24 24" className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${color}`}>
                                {icon}
                            </svg>
                        </a>
                    ))}
                </div>

                {/* Navigation Links */}
                <nav className="flex gap-10 flex-wrap justify-center uppercase tracking-widest text-[10px] font-black">
                    <Link
                        to="/"
                        className="hover:text-primary transition-colors duration-300 relative group"
                    >
                        Home
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                    </Link>
                    <Link
                        to="/contact"
                        className="hover:text-primary transition-colors duration-300 relative group"
                    >
                        Contact Us
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                    </Link>
                </nav>

                {/* Copyright */}
                <div className="pt-8 border-t border-white/5 w-full text-blue-100/40 text-sm font-medium">
                    © {new Date().getFullYear()} Sahyog Sync — Platform for resource
                    coordination
                </div>
            </div>
        </footer>
    );
};

export default Footer;
