'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string;
}

export default function TheoryTestPage() {
  const t = useTranslations('Theory');
  const [mode, setMode] = useState<'selection' | 'practice' | 'mock'>('selection');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(1800); // 30 mins
  const [finished, setFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== 'selection') {
      fetchQuestions();
    }
    if (mode === 'mock') {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            finishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [mode]);

  const fetchQuestions = async () => {
    // Mock questions for now
    const mockQuestions: Question[] = [
      {
        id: '1',
        question: 'What does a red circular sign with a white horizontal bar mean?',
        options: ['No entry', 'Stop', 'Yield', 'No parking'],
        answer: 'No entry',
      },
      {
        id: '2',
        question: 'When should you use your fog lights?',
        options: ['When visibility is less than 100m', 'At night', 'In heavy rain', 'Always'],
        answer: 'When visibility is less than 100m',
      },
    ];
    setQuestions(mockQuestions);
  };

  const handleOptionClick = (option: string) => {
    if (finished) return;
    setSelectedOption(option);

    if (mode === 'practice') {
      if (option === questions[currentIndex].answer) {
        setFeedback('correct');
        setScore(score + 1);
      } else {
        setFeedback('incorrect');
      }
    }
  };

  const handleNext = () => {
    if (mode === 'mock' && selectedOption === questions[currentIndex].answer) {
      setScore(score + 1);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setFeedback(null);
    } else {
      finishTest();
    }
  };

  const finishTest = async () => {
    setFinished(true);
    // Save results to API
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/theory/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: 'test-student-id',
          score,
          total: questions.length,
          mode,
        }),
      });
    } catch (error) {
      console.error('Failed to save theory results:', error);
    }
  };

  if (mode === 'selection') {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
        <div className="space-y-4">
          <button
            onClick={() => setMode('practice')}
            className="w-full p-6 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 transition"
          >
            <h2 className="text-xl font-bold text-blue-700">{t('practiceMode')}</h2>
            <p className="text-sm text-blue-600">{t('practiceDesc')}</p>
          </button>
          <button
            onClick={() => setMode('mock')}
            className="w-full p-6 bg-purple-50 border-2 border-purple-200 rounded-xl hover:bg-purple-100 transition"
          >
            <h2 className="text-xl font-bold text-purple-700">{t('mockMode')}</h2>
            <p className="text-sm text-purple-600">{t('mockDesc')}</p>
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">{t('resultTitle')}</h1>
        <div className="text-5xl font-bold text-blue-600 mb-4">
          {score} / {questions.length}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          {t('tryAgain')}
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <span className="text-sm font-medium text-gray-500">
          Question {currentIndex + 1} of {questions.length}
        </span>
        {mode === 'mock' && (
          <span className="text-lg font-bold text-red-600">
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </span>
        )}
      </div>

      {currentQuestion && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{currentQuestion.question}</h2>
          <div className="grid gap-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionClick(option)}
                className={`p-4 border-2 rounded-xl text-left transition ${
                  selectedOption === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-200'
                } ${
                  mode === 'practice' && feedback && option === currentQuestion.answer
                    ? 'border-green-500 bg-green-50'
                    : ''
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {feedback === 'correct' && <p className="text-green-600 font-bold">{t('correct')}</p>}
          {feedback === 'incorrect' && (
            <p className="text-red-600 font-bold">
              {t('incorrect')}. {t('theAnswerIs')}: {currentQuestion.answer}
            </p>
          )}

          <button
            onClick={handleNext}
            disabled={!selectedOption}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold disabled:opacity-50"
          >
            {currentIndex === questions.length - 1 ? t('finish') : t('next')}
          </button>
        </div>
      )}
    </div>
  );
}
