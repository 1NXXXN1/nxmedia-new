import './globals.css';
import Link from 'next/link';
import SearchBar from './search/SearchBar';
import Logo from '@/components/Logo';
import VisitorCounter from '@/components/VisitorCounter';
import ScrollToTop from '@/components/ScrollToTop';
import ClientProviders, { UserMenu, FavoritesLink } from '@/components/ClientProviders';

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
          className="fixed top-0 left-0 w-full z-50
                     border-b border-white/5
                     bg-[#0b0b0f]/80 backdrop-blur"
        >
          {/* Mobile: Stacked layout */}
          <div className="block md:hidden px-4 py-3 space-y-3">
            {/* Logo and Menu row */}
            <div className="flex items-center justify-between">
              <Link href="/">
                <Logo />
              </Link>
              <nav className="flex gap-2 items-center">
                <Link
                  href="/catalog"
                  className="rounded-lg px-4 py-1.5 text-sm font-medium
                             bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30
                             text-blue-200 hover:text-blue-100
                             border border-blue-500/30 hover:border-blue-500/50
                             transition-all duration-200 whitespace-nowrap
                             flex items-center gap-1"
                >
                  <span>📚</span>
                  Каталог
                </Link>
                <FavoritesLink />
                <UserMenu />
              </nav>
            </div>
            {/* Search full width */}
            <div className="w-full">
              <SearchBar />
            </div>
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden md:grid md:grid-cols-3 md:items-center md:gap-4 mx-auto max-w-7xl px-4 py-3">
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
                className="rounded-lg px-4 py-1.5 text-sm font-medium
                           bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30
                           text-blue-200 hover:text-blue-100
                           border border-blue-500/30 hover:border-blue-500/50
                           transition-all duration-200
                           flex items-center gap-2"
              >
                <span>📚</span>
                Каталог
              </Link>
              <FavoritesLink />
              <UserMenu />
            </nav>
          </div>
        </header>

        {/* PAGE CONTENT — LIMITED WIDTH */}
        <div className="relative z-10 mx-auto max-w-[1600px] px-4 flex-grow flex flex-col pt-[70px] md:pt-[76px]">
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
            <div dangerouslySetInnerHTML={{ __html: `
              <!--LiveInternet counter-->
              <script type="text/javascript">
                document.write('<a href="//www.liveinternet.ru/click" target="_blank"><img src="//counter.yadro.ru/hit?t14.6;r' +
                escape(document.referrer) + ((typeof(screen)=='undefined')?'':'
                + ';s' + screen.width + '*' + screen.height + '*' + (screen.colorDepth?
                screen.colorDepth:screen.pixelDepth)) + ';u' + escape(document.URL) +
                ';' + Math.random() +
                '" border="0" width="88" height="31" alt="LiveInternet" /></a>');
              </script>
              <!--/LiveInternet-->
            ` }} />
          </footer>
        </div>
        </ClientProviders>
      </body>
    </html>
  );
}
