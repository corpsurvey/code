'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
// Replace XLSX import with ExcelJS
import ExcelJS from 'exceljs';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

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

interface SurveyAnalytics {
  questionStats: {
    [key: string]: {
      totalAnswers: number;
      optionCounts?: { [key: string]: number }
    }
  }
}

export default function ViewSurvey({ params }: { params: Promise<{ id: string }> }) {
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
        const resolvedParams = await params;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/surveys/${resolvedParams.id}`, {
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
  }, [params]);

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (!survey) return <div className="text-center p-4 text-red-500">{error}</div>;

  const renderCharts = () => {
    if (!survey) return null;
  
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics</h2>
        <div className="mb-4 bg-blue-50 p-4 rounded-lg">
          <p className="text-lg font-medium text-blue-900">
            Total Responses: <span className="font-bold">{survey.responses.length}</span>
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {survey.questions.map((question) => {
            if (!question.options) return null;
  
            const responseCount = survey.responses.filter(response =>
              response.answers.some(answer => answer.questionId === question._id)
            ).length;
  
            const data = {
              labels: question.options,
              datasets: [
                {
                  data: question.options.map(option => 
                    survey.responses.filter(response => 
                      response.answers.some(answer => 
                        answer.questionId === question._id && 
                        (Array.isArray(answer.answer)
                          ? answer.answer.includes(option)
                          : answer.answer === option)
                      )
                    ).length
                  ),
                  backgroundColor: [
                    '#4F46E5',
                    '#10B981',
                    '#F59E0B',
                    '#EF4444',
                    '#8B5CF6',
                    '#EC4899',
                  ],
                },
              ],
            };
  
            return (
              <div key={question._id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-2">{question.questionText}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Responses: {responseCount} / {survey.responses.length}
                </p>
                <div className="h-64">
                  {question.options.length > 3 ? (
                    <Bar
                      data={data}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                        },
                      }}
                    />
                  ) : (
                    <Pie
                      data={data}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleExport = async () => {
    if (!survey) return;
  
    const workbook = new ExcelJS.Workbook();
    const detailsSheet = workbook.addWorksheet('Survey Responses');
  
    // Add headers
    const headers = ['Email', 'Submitted Date', ...survey.questions.map(q => q.questionText)];
    detailsSheet.addRow(headers);
  
    // Add all responses
    survey.responses.forEach(response => {
      const row = [
        response.email,
        new Date(response.submittedAt).toLocaleDateString(),
        ...survey.questions.map(question => {
          const answer = response.answers.find(a => a.questionId === question._id);
          return answer ? (Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer) : '';
        })
      ];
      detailsSheet.addRow(row);
    });
  
    // Set column widths for better readability
    detailsSheet.columns.forEach(column => {
      column.width = 30;
    });
  
    // Generate and download file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${survey.title}-responses.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  // In the return statement, add the export button next to the back button
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6 flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <button
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <span>Export to Excel</span>
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

          {/* Add charts section here */}
          {renderCharts()}

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
                    <React.Fragment key={response.email + '-' + index}>
                      <tr className="hover:bg-gray-50">
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
                                // Boş array veya boş string kontrolü ekleyelim
                                if (!answer.answer || (Array.isArray(answer.answer) && answer.answer.length === 0)) {
                                  return null;
                                }
                                return (
                                  <div key={i} className="ml-4">
                                    <p className="text-gray-700 font-medium">{question?.questionText}:</p>
                                    <p className="text-gray-900 ml-2">
                                      {question?.questionType === 'checkbox' ? (
                                        Array.isArray(answer.answer) ? (
                                          <span className="space-x-1">
                                            {answer.answer
                                              .filter(option => option && option.trim() !== '') // Boş option'ları filtrele
                                              .map((option, idx) => (
                                                <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                  {option}
                                                </span>
                                              ))}
                                            </span>
                                          ) : answer.answer
                                        ) : (
                                          Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer
                                        )}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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