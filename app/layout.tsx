import './globals.css';
import Link from 'next/link';
import Script from 'next/script';
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
        <meta name="referrer" content="no-referrer" />

        {/* Console control (production only) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && !location.hostname.includes('localhost')) {
                const noop = () => {};
                const originalError = console.error;

                console.log = noop;
                console.warn = noop;
                console.info = noop;
                console.debug = noop;
                console.error = function(...args) {
                  const msg = args.join(' ');
                  if (!msg.includes('api.namy.ws') &&
                      !msg.includes('kinobox') &&
                      !msg.includes('ddbb.lol')) {
                    originalError.apply(console, args);
                  }
                };

                document.addEventListener('contextmenu', e => {
                  if (e.target && e.target.tagName === 'IFRAME') {
                    e.preventDefault();
                  }
                });

                setInterval(() => {
                  console.clear?.();
                }, 5000);
              }
            `,
          }}
        />
      </head>

      <body className="relative overflow-x-hidden bg-[#0b0b0f] text-white flex flex-col min-h-screen">
        <ClientProviders>

          {/* Background */}
          <div className="fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-slow-float-1" />
            <div className="absolute top-1/3 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-slow-float-2" />
            <div
              className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-slow-float-1"
              style={{ animationDelay: '30s' }}
            />
          </div>

          <ScrollToTop />

          {/* HEADER */}
          <header className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-[#0b0b0f]/80 backdrop-blur">

            {/* Mobile */}
            <div className="block md:hidden px-4 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <Link href="/"><Logo /></Link>
                <nav className="flex gap-2 items-center">
                  <Link
                    href="/catalog"
                    className="rounded-lg px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30"
                  >
                    📚 Каталог
                  </Link>
                  <FavoritesLink />
                  <UserMenu />
                </nav>
              </div>
              <SearchBar />
            </div>

            {/* Desktop */}
            <div className="hidden md:grid md:grid-cols-3 items-center max-w-7xl mx-auto px-4 py-3">
              <Link href="/"><Logo /></Link>
              <div className="max-w-md mx-auto w-full">
                <SearchBar />
              </div>
              <nav className="flex gap-4 justify-end items-center">
                <Link
                  href="/catalog"
                  className="rounded-lg px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30"
                >
                  📚 Каталог
                </Link>
                <FavoritesLink />
                <UserMenu />
              </nav>
            </div>
          </header>

          {/* CONTENT */}
          <div className="relative z-10 mx-auto max-w-[1600px] px-4 flex-grow pt-[70px] md:pt-[76px]">
            <main className="py-6 flex-grow">{children}</main>

            {/* FOOTER */}
            <footer className="py-6 text-center space-y-2">
              <VisitorCounter />

              <div className="text-sm text-gray-500">
                © {new Date().getFullYear()} |{' '}
                <Link
                  href="https://t.me/nodir_khajiev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  NX
                </Link>
              </div>

              {/* LiveInternet counter */}
              <Script
                id="liveinternet"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: `
                    (function () {
                      var d = document;
                      var a = d.createElement('a');
                      a.href = '//www.liveinternet.ru/click';
                      a.target = '_blank';

                      var img = d.createElement('img');
                      img.src = '//counter.yadro.ru/hit?t14.6;r' +
                        encodeURIComponent(d.referrer) +
                        (screen ? ';s' + screen.width + '*' + screen.height + '*' +
                        (screen.colorDepth || screen.pixelDepth) : '') +
                        ';u' + encodeURIComponent(d.URL) +
                        ';' + Math.random();

                      img.width = 88;
                      img.height = 31;
                      img.border = 0;
                      img.alt = 'LiveInternet';

                      a.appendChild(img);
                      d.currentScript.parentNode.appendChild(a);
                    })();
                  `,
                }}
              />
            </footer>
          </div>

        </ClientProviders>
      </body>
    </html>
  );
}
