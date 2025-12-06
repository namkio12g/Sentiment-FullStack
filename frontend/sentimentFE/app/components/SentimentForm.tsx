import { useState, useEffect } from 'react';
import { Form } from 'react-router';
import type { SentimentAnalyzeResponse } from '../hooks/sentimentPageHook';

interface SentimentFormProps {
  getLabelColor: (label: string) => string;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>
  ) => Promise<SentimentAnalyzeResponse | null>;
  isSubmitting: boolean;
}

const LoadingState = () => {
  return (
    <div className='h-full flex items-center justify-center'>
      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
    </div>
  );
};

interface ShowResultProps {
  result: SentimentAnalyzeResponse;
  getLabelColor: (label: string) => string;
  onBack: () => void;
}

const ShowResult = ({ result, getLabelColor, onBack }: ShowResultProps) => {
  return (
    <div className='h-full flex flex-col justify-center items-center space-y-6'>
      <div className='text-center space-y-4'>
        <h3 className='text-2xl font-bold text-[#4a5568]'>Analysis Result</h3>
        <div className='space-y-3'>
          <span
            className={`inline-block px-6 py-3 rounded-full text-lg font-semibold border-2 ${getLabelColor(
              result.label || 'Unknown'
            )}`}
          >
            {result.label || 'Unknown'}
          </span>
          {result.score !== undefined && (
            <div className='mt-4'>
              <p className='text-sm text-[#718096] mb-1'>Confidence Score</p>
              <p className='text-2xl font-bold text-[#4a5568]'>
                {result.score.toFixed(2)}
              </p>
            </div>
          )}
          {result.normalized_text && (
            <div className='mt-4 p-4 bg-[#f7fafc] rounded-xl border border-[#e2e8f0]'>
              <p className='text-xs text-[#718096] mb-1'>Normalized Text</p>
              <p className='text-sm text-[#4a5568]'>{result.normalized_text}</p>
            </div>
          )}
        </div>
      </div>
      <button
        onClick={onBack}
        className='cursor-pointer px-6 py-3 bg-gradient-to-r from-[#e9d8fd] to-[#bee3f8] text-white font-semibold rounded-xl hover:from-[#bee3f8] hover:to-[#e9d8fd] border-2 border-blue-300 transition-all duration-300 shadow-md hover:shadow-lg'
      >
        Back to Analyze
      </button>
    </div>
  );
};

export function SentimentForm({
  getLabelColor,
  handleSubmit,
  isSubmitting,
}: SentimentFormProps) {
  const [textInput, setTextInput] = useState('');
  const [result, setResult] = useState<SentimentAnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const response = await handleSubmit(e);

    if (response) {
      setResult(response);
      setShowResult(true);
      setTextInput('');
    } else {
      setError('Failed to analyze sentiment. Please try again.');
    }
  };

  const handleBack = () => {
    setShowResult(false);
    setResult(null);
    setError(null);
  };

  if (showResult && result) {
    return (
      <div className='bg-white/80 h-[500px] backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-[#e2e8f0]'>
        <ShowResult
          result={result}
          getLabelColor={getLabelColor}
          onBack={handleBack}
        />
      </div>
    );
  }

  return (
    <div className='bg-white/80 max-h-[500px] backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-[#e2e8f0]'>
      {isSubmitting ? (
        <div className='h-[400px] flex items-center justify-center'>
          <LoadingState />
        </div>
      ) : (
        <>
          <h2 className='text-2xl font-semibold text-[#4a5568] mb-4'>
            Analyze Text
          </h2>
          <Form method='post' onSubmit={handleFormSubmit}>
            <div className='mb-4'>
              <label
                htmlFor='text'
                className='block text-lg font-medium text-[#718096] mb-2'
              >
                Enter text to analyze:
              </label>
              <textarea
                id='text'
                name='text'
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={6}
                className='text-xl w-full h-full px-4 py-3 border-2 border-[#e2e8f0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e9d8fd] focus:border-transparent resize-none text-[#4a5568] placeholder-[#718096]'
                placeholder='Type your text here...'
                required
              />
            </div>
            <button
              type='submit'
              disabled={isSubmitting || !textInput.trim()}
              className='cursor-pointer w-full px-6 py-3 bg-gradient-to-r from-[#e9d8fd] to-[#bee3f8] text-lg font-bold text-white 
          font-semibold rounded-xl hover:from-[#bee3f8] hover:to-[#e9d8fd] border-2 border-[#e9d8fd] transition-all
           duration-300 disabled:border-none disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg'
            >
              {isSubmitting ? 'Analyzing...' : 'Analyze Sentiment'}
            </button>
          </Form>
        </>
      )}
    </div>
  );
}
