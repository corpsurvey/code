'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  _id: string;
  text: string;
  type: string;
  options?: string[];
}

interface Survey {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
}

type PageProps = {
  params: {
    id: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function SurveyDetail({ params }: PageProps) {
  const router = useRouter();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchSurveyDetails = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/surveys/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
    
        if (!response.ok) {
          throw new Error('Failed to fetch survey details');
        }
    
        const data = await response.json();
        setSurvey(data);
      } catch (error: unknown) {
        console.error('Error fetching survey details:', error);
        setError('Failed to load survey details');
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyDetails();
  }, [router, params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 text-red-500 p-4 rounded-md">
            {error || 'Survey not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
            <div className="space-x-2">
              <button
                onClick={() => router.push(`/admin/surveys/${survey._id}/edit`)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Edit Survey
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Back to List
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Description</h2>
            <p className="text-gray-600">{survey.description}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Questions</h2>
            <div className="space-y-4">
              {survey.questions.map((question, index) => (
                <div key={question._id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {index + 1}. {question.text}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">Type: {question.type}</p>
                    </div>
                  </div>
                  {question.options && question.options.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-700">Options:</h4>
                      <ul className="mt-1 space-y-1">
                        {question.options.map((option, optionIndex) => (
                          <li key={optionIndex} className="text-sm text-gray-600">
                            • {option}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}