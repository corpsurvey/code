'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Survey interface'ini güncelle
interface Question {
  _id: string;
  questionText: string;
  questionType: string;
  options: string[];
  required: boolean;
}

interface Survey {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  creator: {
    username: string;
  };
}

export default function RespondSurvey({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/surveys/${resolvedParams.id}`);
        if (!response.ok) throw new Error('Survey not found');
        const data = await response.json();
        setSurvey(data);
      } catch (error) {
        setError('Failed to load survey');
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [params]);

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }));
  
      const resolvedParams = await params;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/surveys/${resolvedParams.id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          answers: formattedAnswers
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit response');
      }
  
      router.push('/surveys/thank-you');
    } catch (error: any) {
      setError(error.message || 'Failed to submit response');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-xl rounded-2xl p-8">
            <div className="flex items-center justify-center h-32">
              <p className="text-lg text-gray-500">Loading survey...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-xl rounded-2xl p-8">
            <p className="text-center text-red-500">{error || 'Survey not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{survey.title}</h1>
          <p className="text-gray-600 mb-8">{survey.description}</p>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {survey.questions.map((question) => (
              <div key={question._id} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <label className="block text-gray-900 font-medium mb-4">
                  {question.questionText} {question.required && <span className="text-red-500">*</span>}
                </label>

                {question.questionType === 'text' && (
                  <input
                    type="text"
                    onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                    className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-200"
                    required={question.required}
                  />
                )}

                {question.questionType === 'multipleChoice' && (
                  <div className="space-y-3">
                    {question.options.map((option, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="radio"
                          id={`${question._id}-${index}`}
                          name={question._id}
                          value={option}
                          onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                          className="h-5 w-5 text-indigo-600 border-2 border-gray-300 focus:ring-indigo-500"
                          required={question.required}
                        />
                        <label htmlFor={`${question._id}-${index}`} className="ml-3 text-gray-700">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {question.questionType === 'checkbox' && (
                  <div className="space-y-3">
                    {question.options.map((option, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`${question._id}-${index}`}
                          value={option}
                          onChange={(e) => {
                            const currentAnswers = answers[question._id] as string[] || [];
                            const newAnswers = e.target.checked
                              ? [...currentAnswers, option]
                              : currentAnswers.filter(a => a !== option);
                            handleAnswerChange(question._id, newAnswers);
                          }}
                          className="h-5 w-5 text-indigo-600 border-2 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor={`${question._id}-${index}`} className="ml-3 text-gray-700">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
              >
                Submit Response
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}