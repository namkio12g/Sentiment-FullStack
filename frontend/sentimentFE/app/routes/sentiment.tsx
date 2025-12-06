import { useLoaderData } from 'react-router';
import type { Route } from './+types/sentiment';
import { SentimentForm } from '../components/SentimentForm';
import { HistoryList } from '../components/HistoryList';
import { useSentimentPageHook } from '../hooks/sentimentPageHook';

// Types
interface SentimentHistory {
  id: number;
  text: string;
  label: string;
  score?: number;
  created_at: string;
}

interface LoaderData {
  history: SentimentHistory[];
}

// Meta tags
export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Sentiment Analysis' },
    { name: 'description', content: 'Analyze sentiment and view history' },
  ];
}

export default function Sentiment() {
  // const loaderData = useLoaderData<typeof loader>();
  const {
    handleSubmit,
    isSubmitting,
    searchInput,
    setSearchInput,
    debouncedSearch,
    history,
  } = useSentimentPageHook();

  const getLabelColor = (label: string) => {
    const labelLower = label.toLowerCase();
    if (labelLower.includes('positive')) {
      return 'bg-[#c6f6d5] text-[#166534] border-[#86efac]';
    } else if (labelLower.includes('negative')) {
      return 'bg-[#fed7d7] text-[#9f1239] border-[#f9a8d4]';
    } else if (labelLower.includes('neutral')) {
      return 'bg-[#bee3f8] text-[#1e40af] border-[#93c5fd]';
    }
    return 'bg-[#e9d8fd] text-[#6b21a8] border-[#c084fc]';
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#e6e6fa] via-[#ffdab9] to-[#f0fff0] p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8 text-center'>
          <h1 className='text-4xl font-bold text-[#4a5568] mb-2'>
            Sentiment Detect
          </h1>
          <p className='text-[#718096] text-lg'>
            Analyze text sentiment and explore your history
          </p>
        </div>

        <div className='grid grid-cols-2 lg:grid-cols-2 gap-6'>
          <div className='space-y-6'>
            <SentimentForm
              isSubmitting={isSubmitting}
              getLabelColor={getLabelColor}
              handleSubmit={handleSubmit}
            />
          </div>
          {/* TODO: Add history list */}
          <HistoryList
            history={history}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            debouncedSearch={debouncedSearch}
            getLabelColor={getLabelColor}
          />
        </div>
      </div>
    </div>
  );
}
