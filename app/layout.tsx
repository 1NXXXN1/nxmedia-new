import './globals.css';
import Link from 'next/link';
import SearchBar from './search/SearchBar';
import Logo from '@/components/Logo';
import VisitorCounter from '@/components/VisitorCounter';
import ScrollToTop from '@/components/ScrollToTop';
import ClientProviders, { UserMenu } from '@/components/ClientProviders';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'MEDIA',
  description: 'Мини кинопортал',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Disable console in production
              if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
                const noop = () => {};
                const originalError = console.error;
                console.log = noop;
                console.warn = noop;
                console.info = noop;
                console.debug = noop;
                console.error = function(...args) {
                  const msg = args.join(' ');
                  if (!msg.includes('api.namy.ws') && !msg.includes('kinobox') && !msg.includes('ddbb.lol')) {
                    originalError.apply(console, args);
                  }
                };
                
                // Disable right-click on iframes
                document.addEventListener('DOMContentLoaded', function() {
                  document.addEventListener('contextmenu', function(e) {
                    if (e.target.tagName === 'IFRAME') {
                      e.preventDefault();
                      return false;
                    }
                  }, false);
                });
                
                // Clear console periodically
                setInterval(() => {
                  if (typeof console.clear === 'function') {
                    console.clear();
                  }
                }, 5000);
              }
            `,
          }}
        />
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="relative overflow-x-hidden bg-[#0b0b0f] text-white flex flex-col min-h-screen">
        <ClientProviders>
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          {/* Gradient orbs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-slow-float-1"></div>
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-slow-float-2"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl animate-slow-float-1" style={{ animationDelay: '30s' }}></div>
        </div>

        <ScrollToTop />
        
        {/* HEADER — FULL WIDTH */}
        <header
          className="sticky top-0 z-50 w-full
                     border-b border-white/5
                     bg-[#0b0b0f]/80 backdrop-blur"
        >
          <div
            className="mx-auto max-w-7xl px-4 py-3
                       grid grid-cols-3 items-center gap-4"
          >
            {/* Logo */}
            <div className="justify-self-start">
              <Link href="/">
                <Logo />
              </Link>
            </div>

            {/* Search */}
            <div className="justify-self-center w-full max-w-md">
              <SearchBar />
            </div>

            {/* Nav */}
            <nav className="justify-self-end flex gap-4 items-center">
              <Link
                href="/catalog"
                className="rounded-lg px-3 text-sm
                           text-gray-300 hover:bg-white/5
                           transition-colors"
              >
                Каталог
              </Link>
              <Link
                href="/favorites"
                className="rounded-lg px-3 py-1.5 text-sm
                           text-gray-300 hover:bg-white/5
                           transition-colors"
              >
                Избранное
              </Link>
              <UserMenu />
            </nav>
          </div>
        </header>

        {/* PAGE CONTENT — LIMITED WIDTH */}
        <div className="relative z-10 mx-auto max-w-[1600px] px-4 flex-grow flex flex-col">
          <main className="py-6 flex-grow">
            {children}
          </main>

          {/* FOOTER */}
          <footer className="py-6 text-center space-y-2 mt-auto">
            <VisitorCounter />
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} |{' '}
              <Link
                href="https://t.me/nodir_khajiev"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                NX
              </Link>
            </div>
          </footer>
        </div>
        </ClientProviders>
      </body>
    </html>
  );
}
