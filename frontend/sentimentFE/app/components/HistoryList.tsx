import { useState, useEffect } from 'react';
import type { SentimentHistory } from '../hooks/sentimentPageHook';

interface HistoryListProps {
  history?: SentimentHistory[];
  getLabelColor: (label: string) => string;
  searchInput: string;
  setSearchInput: (input: string) => void;
  debouncedSearch: string;
}

export function HistoryList({
  history = [],
  getLabelColor,
  searchInput,
  setSearchInput,
  debouncedSearch,
}: HistoryListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className='space-y-6'>
      <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-[#e2e8f0]'>
        <h2 className='text-xl font-semibold text-[#4a5568] mb-4'>
          Search History
        </h2>
        <input
          type='text'
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder='Search by text, label, or date...'
          className='w-full px-4 py-3 border-2 border-[#e2e8f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e9d8fd] focus:border-transparent text-[#4a5568] placeholder-[#718096]'
        />
        {searchInput && (
          <p className='mt-2 text-sm text-[#718096]'>
            {debouncedSearch !== searchInput ? 'Searching...' : ''}
          </p>
        )}
      </div>

      <div className='bg-white/80 py-4 max-h-[450px] overflow-hidden backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-[#e2e8f0]'>
        <h2 className='text-xl font-semibold text-[#4a5568] mb-4'>
          History ({history.length})
        </h2>
        <div className='space-y-3 overflow-y-auto max-h-[350px]'>
          {history.length === 0 ? (
            <div className='text-center py-8 text-[#718096]'>
              <p>No history found</p>
              {searchInput && (
                <p className='text-sm mt-2'>Try adjusting your search query</p>
              )}
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className='p-4 bg-gradient-to-r from-white to-[#fffaf0] border-2 border-[#e2e8f0] rounded-xl hover:shadow-md transition-shadow duration-200'
              >
                <p className='text-[#4a5568] text-lg mb-3 line-clamp-2'>
                  {item.normalized_text}
                </p>

                <div className='flex items-center justify-between flex-wrap gap-2'>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getLabelColor(
                      item.label
                    )}`}
                  >
                    {item.label}
                  </span>
                  <span className='text-xs text-[#718096]'>
                    {formatDate(item.created_at)}
                  </span>
                </div>
                {item.score !== undefined && (
                  <p className='text-xs text-[#718096] mt-2'>
                    Score: {item.score.toFixed(2)}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
