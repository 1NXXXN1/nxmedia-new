import React from 'react';

// ShimmerGrid strictly matches the main page poster grid: 14 items, 7 columns, 2 rows, responsive sizing
export default function ShimmerGrid() {
  const count = 14; // Number of shimmer items to match the grid
  return (
    <div className="grid grid-cols-2 md:grid-cols-7 md:grid-rows-2 gap-4 mb-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col items-center mx-auto group">
          <div
            className="w-[120px] h-[180px] md:w-[192px] md:h-[288px] bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 rounded-2xl animate-pulse shadow-lg border border-gray-800 object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="mt-3 h-4 w-3/4 bg-gray-700 rounded animate-pulse" />
          <div className="mt-2 h-3 w-1/2 bg-gray-700 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
