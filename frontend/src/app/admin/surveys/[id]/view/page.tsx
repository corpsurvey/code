'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Answer {
  questionId: string;
  answer: string | string[];
}

interface Response {
  email: string;
  answers: Answer[];
  submittedAt: string;
}

interface Question {
  _id: string;
  questionText: string;
  questionType: string;
  options: string[];
}

interface Survey {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  responses: Response[];
}

export default function ViewSurvey({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add this state for tracking expanded responses
  const [expandedResponse, setExpandedResponse] = useState<number | null>(null);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/surveys/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch survey');
        const data = await response.json();
        setSurvey(data);
      } catch (error) {
        setError('Failed to load survey');
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [params.id]);

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (!survey) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">{survey.title}</h1>
          <p className="text-gray-600 mb-8">{survey.description}</p>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Questions</h2>
            {survey.questions.map((question) => (
              <div key={question._id} className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="font-medium text-gray-900">{question.questionText}</p>
                {question.options && (
                  <div className="mt-2 text-gray-600">
                    Options: {question.options.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Responses ({survey.responses.length})</h2>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Submitted Date</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {survey.responses.map((response, index) => (
                    <>
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{response.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(response.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setExpandedResponse(expandedResponse === index ? null : index)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            {expandedResponse === index ? 'Hide Details' : 'View Details'}
                          </button>
                        </td>
                      </tr>
                      {expandedResponse === index && (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-2">
                              {response.answers.map((answer, i) => {
                                const question = survey.questions.find(q => q._id === answer.questionId);
                                return (
                                  <div key={i} className="ml-4">
                                    <p className="text-gray-700 font-medium">{question?.questionText}:</p>
                                    <p className="text-gray-900 ml-2">
                                      {Array.isArray(answer.answer) 
                                        ? answer.answer.join(', ') 
                                        : answer.answer}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
              {survey.responses.length === 0 && (
                <p className="text-gray-600 text-center p-4">No responses yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}