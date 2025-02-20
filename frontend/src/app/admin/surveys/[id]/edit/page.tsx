'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Question {
  text: string;
  type: 'text' | 'multipleChoice' | 'checkbox';
  options: string[];
  required: boolean; // Yeni eklenen alan
}

interface Survey {
  _id: string;
  title: string;
  description: string;
  questions: {
    _id: string;
    questionText: string;
    questionType: string;
    options: string[];
    required: boolean; // Yeni eklenen alan
  }[];
}

export default function EditSurvey() {
  const router = useRouter();
  const params = useParams();
  const surveyId = params?.id as string;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!surveyId) return;

    const fetchSurvey = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/surveys/${surveyId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch survey');
        }

        const data: Survey = await response.json();
        setTitle(data.title);
        setDescription(data.description);
        // fetchSurvey içinde mapping güncelleme
        setQuestions(data.questions.map(q => ({
          text: q.questionText,
          type: q.questionType as any,
          options: q.options || [],
          required: q.required || false // Varsayılan false
        })));
        
        // Yeni soru ekleme fonksiyonu güncelleme
        const addQuestion = () => {
          setQuestions([...questions, { 
            text: '', 
            type: 'text', 
            options: [],
            required: false // Varsayılan false
          }]);
        };
        
        // handleSubmit içinde formattedQuestions güncelleme
        const formattedQuestions = questions.map(q => ({
          questionText: q.text,
          questionType: q.type,
          options: q.options.filter(opt => opt.trim() !== ''),
          required: q.required
        }));
        
        // Soru form alanında required checkbox ekleme
        {questions.map((question, questionIndex) => (
          <div key={questionIndex} className="bg-gray-50 p-4 rounded-lg mb-4">
            // Question alanında required checkbox'ı ekleyelim
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900">Question Text</label>
                  <input
                    type="text"
                    value={question.text}
                    onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                    required
                  />
                </div>
                <div className="ml-4 flex items-center mt-6">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id={`required-${questionIndex}`}
                      checked={question.required}
                      onChange={(e) => updateQuestion(questionIndex, 'required', e.target.checked)}
                      className="h-5 w-5 rounded border-2 border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer transition-colors duration-200"
                    />
                    <label 
                      htmlFor={`required-${questionIndex}`} 
                      className="ml-3 text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900 transition-colors duration-200"
                    >
                      Required
                    </label>
                  </div>
                </div>
              </div>
              
              {/* ... mevcut question type ve options kodu ... */}
            </div>
          </div>
        ))}
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [surveyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation for checkbox questions
    const hasInvalidCheckbox = questions.some(q => {
      if (q.type === 'checkbox') {
        // En az bir option olmalı ve boş option olmamalı
        return q.options.length === 0 || q.options.some(opt => !opt.trim());
      }
      return false;
    });
    
    if (hasInvalidCheckbox) {
      setError('Checkbox questions must have at least one non-empty option');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const formattedQuestions = questions.map(q => ({
        questionText: q.text,
        questionType: q.type,
        options: q.options.filter(opt => opt.trim() !== '') // Boş optionları filtrele
      }));
    
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/surveys/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          questions: formattedQuestions
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update survey');
      }

      router.push('/admin');
    } catch (error: any) {
      setError(error.message || 'Failed to update survey');
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: '', type: 'text', options: [], required: false }]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  // Option ekleme ve güncelleme fonksiyonlarını da güncelleyelim
  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    const currentQuestion = updatedQuestions[questionIndex];
    
    // Checkbox için sadece bir option'a izin ver
    if (currentQuestion.type === 'checkbox' && currentQuestion.options.length >= 1) {
      return;
    }
    
    currentQuestion.options.push('');
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuestions(updatedQuestions);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg rounded-xl p-8">
            <div className="flex items-center justify-center h-32">
              <p className="text-lg text-gray-500">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">Edit Survey</h1>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              <div className="bg-gray-50 p-6 rounded-xl">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Survey Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 px-4 py-3 bg-white"
                  required
                  placeholder="Enter survey title"
                />
              </div>

              <div className="bg-gray-50 p-6 rounded-xl">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Survey Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 px-4 py-3 min-h-[120px] bg-white resize-y"
                  rows={3}
                  placeholder="Enter survey description"
                />
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="inline-flex items-center px-4 py-2 border-2 border-indigo-500 text-sm font-medium rounded-xl text-indigo-600 bg-white hover:bg-indigo-50 transition-colors duration-200"
                  >
                    + Add Question
                  </button>
                </div>

                {questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="space-y-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Question Text {question.required && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="text"
                            value={question.text}
                            onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                            className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 px-4 py-3 bg-white"
                            required
                            placeholder="Enter your question"
                          />
                        </div>
                        <div className="flex items-center mt-8">
                          <input
                            type="checkbox"
                            id={`required-${questionIndex}`}
                            checked={question.required}
                            onChange={(e) => updateQuestion(questionIndex, 'required', e.target.checked)}
                            className="h-5 w-5 rounded border-2 border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer transition-colors duration-200"
                          />
                          <label 
                            htmlFor={`required-${questionIndex}`} 
                            className="ml-3 text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900 transition-colors duration-200"
                          >
                            Required
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Question Type</label>
                        <select
                          value={question.type}
                          onChange={(e) => updateQuestion(questionIndex, 'type', e.target.value)}
                          className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 px-4 py-3 bg-white"
                        >
                          <option value="text">Text Answer</option>
                          <option value="multipleChoice">Multiple Choice</option>
                          <option value="checkbox">Checkbox</option>
                        </select>
                      </div>

                      {(question.type === 'multipleChoice' || question.type === 'checkbox') && (
                        <div className="space-y-4">
                          <label className="block text-sm font-semibold text-gray-900">Options</label>
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                                className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 px-4 py-3 bg-white"
                                placeholder={`Option ${optionIndex + 1}`}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => removeOption(questionIndex, optionIndex)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors duration-200"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addOption(questionIndex)}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            + Add Option
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => router.push('/admin/surveys')}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 border-2 border-transparent rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                >
                  Update Survey
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}