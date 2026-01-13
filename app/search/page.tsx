import { Suspense } from 'react';
import SearchPageClient from './search-page-client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Search - NXMEDIA',
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-400">Загрузка...</div>}>
      <SearchPageClient />
    </Suspense>
  );
}
