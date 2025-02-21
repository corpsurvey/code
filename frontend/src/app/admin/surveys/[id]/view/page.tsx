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

// Önce interface'i güncelle
interface Response {
  ipAddress: string; // email yerine ipAddress
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
  
    // Update headers
    const headers = ['IP Address', 'Submitted Date', ...survey.questions.map(q => q.questionText)];
    detailsSheet.addRow(headers);
  
    // Update row data
    survey.responses.forEach(response => {
      const row = [
        response.ipAddress,
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl p-8">
          {/* Header Section */}
          <div className="mb-8 flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <button
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export to Excel
            </button>
          </div>
  
          {/* Survey Title Section */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{survey.title}</h1>
            <p className="text-gray-600 text-lg">{survey.description}</p>
          </div>
  
          {/* Analytics Section */}
          {renderCharts()}
  
          {/* Questions Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions</h2>
            <div className="grid gap-4">
              {survey.questions.map((question) => (
                <div key={question._id} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 rounded-lg p-2">
                      <span className="text-indigo-600 font-medium">{question.questionType === 'text' ? 'Aa' : '☑'}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{question.questionText}</p>
                      {question.options && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {question.options.map((option, idx) => (
                            <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                              {option}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          {/* Responses Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Responses</h2>
              <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-medium">
                Total: {survey.responses.length}
              </span>
            </div>
  
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">IP Address</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Submitted Date</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {survey.responses.map((response, index) => (
                    <React.Fragment key={response.ipAddress + '-' + index}>
                      <tr className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                            {response.ipAddress}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(response.submittedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setExpandedResponse(expandedResponse === index ? null : index)}
                            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
                          >
                            {expandedResponse === index ? 'Hide Details' : 'View Details'}
                            <svg className={`ml-2 w-4 h-4 transform transition-transform duration-200 ${expandedResponse === index ? 'rotate-180' : ''}`} 
                                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                      {expandedResponse === index && (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-4">
                              {response.answers.map((answer, i) => {
                                const question = survey.questions.find(q => q._id === answer.questionId);
                                if (!answer.answer || (Array.isArray(answer.answer) && answer.answer.length === 0)) {
                                  return null;
                                }
                                return (
                                  <div key={i} className="bg-white p-4 rounded-xl border border-gray-200">
                                    <p className="text-gray-700 font-medium mb-2">{question?.questionText}</p>
                                    <div className="ml-4">
                                      {question?.questionType === 'checkbox' ? (
                                        Array.isArray(answer.answer) ? (
                                          <div className="flex flex-wrap gap-2">
                                            {answer.answer
                                              .filter(option => option && option.trim() !== '')
                                              .map((option, idx) => (
                                                <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                                                  {option}
                                                </span>
                                              ))}
                                          </div>
                                        ) : (
                                          <span className="text-gray-900">{answer.answer}</span>
                                        )
                                      ) : (
                                        <span className="text-gray-900">
                                          {Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer}
                                        </span>
                                      )}
                                    </div>
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
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No responses yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}