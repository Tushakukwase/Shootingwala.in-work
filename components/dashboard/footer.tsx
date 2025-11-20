export function Footer() {
    return (
        <footer className="border-t-2 border-yellow-200 mt-12 bg-yellow-50">
            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 grid gap-6 md:grid-cols-3 text-sm">
                <div className="space-y-2">
                    <p className="font-bold text-black text-lg">📸 PhotoBook</p>
                    <p className="text-gray-700 font-medium">
                        Find and book the right photographer for every moment.
                    </p>
                </div>

                <div className="space-y-2">
                    <p className="font-bold text-black">🏢 Company</p>
                    <ul className="space-y-1">
                        <li>
                            <a className="text-gray-700 hover:text-yellow-600 font-medium transition-colors" href="#">
                                About Us
                            </a>
                        </li>
                        <li>
                            <a className="text-gray-700 hover:text-yellow-600 font-medium transition-colors" href="#">
                                Terms & Conditions
                            </a>
                        </li>
                        <li>
                            <a className="text-gray-700 hover:text-yellow-600 font-medium transition-colors" href="#">
                                Privacy Policy
                            </a>
                        </li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <p className="font-bold text-black">📞 Contact</p>
                    <ul className="space-y-1">
                        <li>
                            <a className="text-gray-700 hover:text-yellow-600 font-medium transition-colors" href="#">
                                📧 support@photobook.app
                            </a>
                        </li>
                        <li className="text-gray-600 font-medium">
                            🌐 Twitter • Instagram • Facebook
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-yellow-200 py-4">
                <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
                    <p className="text-sm text-gray-600 font-medium">
                        © 2025 PhotoBook. All rights reserved. Made with ❤️ for photographers and clients.
                    </p>
                </div>
            </div>
        </footer>
    )
}