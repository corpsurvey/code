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
        setLoading(false);
      } catch (error) {
        setError('Failed to load survey');
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [params]); // params'ı dependency olarak bırakıyoruz

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Add email state
  const [email, setEmail] = useState('');
  
  // Update handleSubmit
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
          email,
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
  
  // Add email input field to the form (before questions)
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-900 mb-2">
      Your Email
    </label>
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      required
    />
  </div>

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-center text-gray-500">Loading survey...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-center text-red-500">{error || 'Survey not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{survey.title}</h1>
          <p className="text-gray-900 mb-8">{survey.description}</p>
    
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
    
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* Email input */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <label className="block text-gray-900 font-medium mb-2">
                  Your Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                  required
                  placeholder="Enter your email"
                />
              </div>
    
              {/* Survey questions */}
              {survey.questions.map((question) => (
                <div key={question._id} className="bg-gray-50 p-6 rounded-lg">
                  <label className="block text-gray-900 font-medium mb-3">
                    {question.questionText} {question.required && <span className="text-red-500">*</span>}
                  </label>
    
                  {question.questionType === 'text' && (
                    <input
                      type="text"
                      onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
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
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                            required={question.required}
                          />
                          <label htmlFor={`${question._id}-${index}`} className="ml-3 text-gray-900">
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
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                            required={question.required && (answers[question._id] as string[] || []).length === 0}
                          />
                          <label
                            htmlFor={`${question._id}-${index}`}
                            className="ml-3 text-gray-900"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
    
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Submit Response
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}