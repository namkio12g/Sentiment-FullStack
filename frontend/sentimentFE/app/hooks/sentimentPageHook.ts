import { useState, useEffect } from 'react';
import { useLoaderData, useActionData, useNavigation } from 'react-router';
import axios from 'axios';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { API_URL } from './config';

export interface SentimentAnalyzeResponse {
  label: string;
  score: number;
  normalized_text: string;
}

export interface HistoryResponse {
  history: SentimentHistory[];
}
export interface ErrorResponse extends Error {
  detail: string;
}

export interface SentimentHistory {
  id: number;
  text: string;
  label: string;
  score?: number;
  created_at: string;
  normalized_text: string;
}

const MySwal = withReactContent(Swal);

function showPopup(
  title: string,
  text: string,
  icon: 'success' | 'error' | 'warning' | 'info' | 'question'
) {
  MySwal.fire({
    title,
    text,
    icon,
  });
}

export const useSentimentPageHook = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [history, setHistory] = useState<SentimentHistory[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get<HistoryResponse>(
          `${API_URL}/sentiment-history?search=${encodeURIComponent(debouncedSearch)}`
        );

        if (response.status === 200) {
          setHistory(response.data.history || []);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
        showPopup('Error', "Can't fetch history", 'error');
      }
    };
    fetchHistory();
  }, [debouncedSearch]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const text = formData.get('text') as string;
      const response = await axios.post<SentimentAnalyzeResponse>(
        `${API_URL}/sentiment-analyze`,
        { text }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error submitting sentiment analysis:', error);
      showPopup('Error', error.response.data.detail, 'error');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
    searchInput,
    setSearchInput,
    debouncedSearch,
    history,
  };
};
