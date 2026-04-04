'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
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
  const [studyMode, setStudyMode] = useState(true);

  useEffect(() => {
    if (mode !== 'selection') {
      fetchQuestions();
    }
    if (mode === 'mock') {
      setStudyMode(false);
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
    const mockQuestions: Question[] = [
      {
        id: '1',
        question: 'What does a red circular sign with a white horizontal bar mean?',
        options: ['No entry', 'Stop', 'Yield', 'No parking'],
        answer: 'No entry',
        explanation: 'The "No Entry" sign indicates that entry for all vehicles is prohibited. This is typically used at one-way streets and other areas where traffic flow must be restricted.'
      },
      {
        id: '2',
        question: 'When should you use your fog lights?',
        options: ['When visibility is less than 100m', 'At night', 'In heavy rain', 'Always'],
        answer: 'When visibility is less than 100m',
        explanation: 'Rear fog lights should only be used when visibility is significantly reduced (less than 100 meters) to avoid dazzling other drivers.'
      },
      {
        id: '13',
        question: 'When encountering this specific road marking, what is the mandatory action for a driver intending to turn left?',
        options: [
          'Come to a complete stop before the marking and wait for a clear gap.',
          'Yield to oncoming traffic and only proceed when the way is clear.',
          'Maintain speed and merge immediately without stopping.',
          'Sound horn to alert other drivers before making the turn.'
        ],
        answer: 'Yield to oncoming traffic and only proceed when the way is clear.',
        explanation: 'The "Yield" marking indicates that drivers must give right-of-way to other road users. Unlike a "Stop" sign, you are not required to stop if the road is clear, but you must be prepared to do so.'
      }
    ];
    setQuestions(mockQuestions);
  };

  const handleOptionClick = (option: string) => {
    if (finished) return;
    setSelectedOption(option);

    if (studyMode) {
      if (option === questions[currentIndex].answer) {
        setFeedback('correct');
        setScore(score + 1);
      } else {
        setFeedback('incorrect');
      }
    }
  };

  const handleNext = () => {
    if (!studyMode && selectedOption === questions[currentIndex].answer) {
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
    } catch (error) {}
  };

  if (mode === 'selection') {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center mt-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-8">{t('title')}</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => setMode('practice')}
            className="w-full p-8 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl hover:border-secondary transition-all shadow-sm flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 bg-secondary-container/30 rounded-full flex items-center justify-center text-on-secondary-container mb-6 group-hover:scale-110 transition-transform">
               <span className="material-symbols-outlined text-3xl">psychology</span>
            </div>
            <h2 className="text-xl font-bold mb-2">{t('practiceMode')}</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">{t('practiceDesc')}</p>
          </button>
          <button
            onClick={() => setMode('mock')}
            className="w-full p-8 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl hover:border-primary transition-all shadow-sm flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 bg-primary-container text-white rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <span className="material-symbols-outlined text-3xl">timer</span>
            </div>
            <h2 className="text-xl font-bold mb-2">{t('mockMode')}</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">{t('mockDesc')}</p>
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="max-w-md mx-auto p-8 text-center mt-20">
        <div className="w-24 h-24 bg-secondary-container/20 text-secondary rounded-full flex items-center justify-center mx-auto mb-8">
           <span className="material-symbols-outlined text-5xl">military_tech</span>
        </div>
        <h1 className="text-3xl font-extrabold mb-4">{t('resultTitle')}</h1>
        <div className="text-7xl font-black text-secondary mb-8">
          {score} / {questions.length}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary-container text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
        >
          {t('tryAgain')}
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header Stats & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">{t('title')}</h1>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 bg-secondary-container/30 text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              {t('mockExam')} #14
            </span>
            <span className="text-on-surface-variant text-sm font-medium">{t('progress')}: {currentIndex + 1} / {questions.length} {t('questions')}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-surface-container-high px-4 py-2.5 rounded-xl gap-6">
            {mode === 'mock' && (
              <>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline text-lg">timer</span>
                  <span className="font-bold tabular-nums">
                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="w-[1px] h-4 bg-outline-variant"></div>
              </>
            )}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold tracking-widest uppercase text-on-surface-variant">{t('studyMode')}</span>
              <button
                onClick={() => setStudyMode(!studyMode)}
                className={`relative w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${studyMode ? 'bg-teal-500' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${studyMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </div>
          <button onClick={finishTest} className="bg-primary-container text-white px-6 py-2.5 rounded-xl font-bold hover:scale-95 transition-transform">
            {t('submitExam')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Question Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
            {currentQuestion && (
              <>
                <div className="mb-8">
                  <span className="text-on-surface-variant text-xs font-bold tracking-widest uppercase block mb-4">{t('questions')} {currentIndex + 1}</span>
                  <h3 className="text-2xl font-bold leading-snug">{currentQuestion.question}</h3>
                </div>

                {/* Simulated Image for Q13 */}
                {currentQuestion.id === '13' && (
                  <div className="aspect-video w-full rounded-xl overflow-hidden mb-10 bg-slate-100 group">
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Road marking" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAirfBXxDXZzsSaPLG2NYOUNcOyI9suzYMf7GW0pJtExA33G_1AYrxxDBCn7GntDtapOM2KbPE8da150tcuK9bKtylR15srhoSfD84Wd_ntg9x1dMWpSVKLu4C8z_7271Ry_o-VgdMogET7Z51x5AjETTvexrqRQSd7gxWSliP1-ddMpNF8Gko35tb77yxJ3-NWTIA8hCWEyedQ60YqlQQbf7meXLdgR0OrGFWl9DU1emm7NBq_p6f6PoSJOOCegtzG-NZ_UAFz9Q"/>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedOption === option;
                    const isCorrect = option === currentQuestion.answer;
                    const letters = ['A', 'B', 'C', 'D'];

                    let bgClass = "bg-surface-container-lowest border-outline-variant hover:bg-surface-container-low";
                    let letterClass = "bg-surface-container-high text-on-surface";

                    if (studyMode && feedback) {
                      if (isCorrect) {
                        bgClass = "bg-teal-50 border-teal-500";
                        letterClass = "bg-teal-500 text-white";
                      } else if (isSelected) {
                        bgClass = "bg-error-container/20 border-error";
                        letterClass = "bg-error text-white";
                      }
                    } else if (isSelected) {
                      bgClass = "border-primary-container bg-surface-container-low";
                      letterClass = "bg-primary-container text-white";
                    }

                    return (
                      <button
                        key={option}
                        onClick={() => handleOptionClick(option)}
                        className={`flex items-center gap-6 p-6 rounded-xl border transition-all text-left group ${bgClass}`}
                      >
                        <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${letterClass}`}>
                          {letters[idx]}
                        </span>
                        <span className={`flex-1 font-medium text-lg ${studyMode && feedback && isCorrect ? 'text-teal-900 font-bold' : ''}`}>
                          {option}
                        </span>
                        {studyMode && feedback && isCorrect && (
                          <span className="material-symbols-outlined text-teal-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Intelligence Pane (Explanation) */}
          {studyMode && feedback && currentQuestion && (
            <div className="glass-panel rounded-xl p-8 border-l-4 border-teal-400 bg-surface-container-lowest shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-teal-100 p-2 rounded-lg text-teal-600">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                </div>
                <h4 className="font-bold text-lg">{t('intelligenceInsight')}</h4>
              </div>
              <p className="text-on-surface-variant leading-relaxed mb-4">
                {currentQuestion.explanation}
              </p>
              <div className="flex gap-2">
                <span className="bg-surface-container px-3 py-1 rounded-md text-[10px] font-bold tracking-tighter uppercase text-outline">Road Rules</span>
                <span className="bg-surface-container px-3 py-1 rounded-md text-[10px] font-bold tracking-tighter uppercase text-outline">Difficulty: Medium</span>
              </div>
            </div>
          )}

          {/* Navigation Footer */}
          <div className="flex justify-between items-center px-4">
            <button
              disabled={currentIndex === 0}
              onClick={() => {
                setCurrentIndex(currentIndex - 1);
                setSelectedOption(null);
                setFeedback(null);
              }}
              className="flex items-center gap-2 text-on-surface-variant font-bold hover:text-on-surface transition-colors disabled:opacity-30"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              {t('previous')}
            </button>
            <button
              onClick={handleNext}
              disabled={!selectedOption}
              className="bg-secondary-container text-on-secondary-container px-8 py-3 rounded-xl font-bold flex items-center gap-3 hover:scale-95 transition-transform disabled:opacity-50"
            >
              {currentIndex === questions.length - 1 ? t('finish') : t('nextQuestion')}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Right Column: Question Navigator */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-low rounded-xl p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold">{t('examNavigator')}</h4>
              <span className="text-xs bg-surface-container-highest px-2 py-1 rounded font-bold">{questions.length} {t('questions')}</span>
            </div>
            {/* Legend */}
            <div className="flex gap-4 mb-8">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">{t('correct')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-error"></div>
                <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">{t('incorrect')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-surface-container-highest"></div>
                <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">{t('pending')}</span>
              </div>
            </div>
            {/* Grid */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-10 w-full rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                    currentIndex === idx
                      ? 'ring-2 ring-primary-container ring-offset-2'
                      : ''
                  } ${
                    studyMode && idx < currentIndex ? 'bg-teal-500 text-white' : 'bg-surface-container-highest text-on-surface-variant'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              {[...Array(27)].map((_, i) => (
                <button key={i} className="h-10 w-full rounded-lg bg-surface-container-highest text-on-surface-variant text-xs font-bold flex items-center justify-center opacity-40 cursor-not-allowed">
                  {questions.length + i + 1}
                </button>
              ))}
            </div>
            <button className="w-full mt-8 flex items-center justify-center gap-2 text-on-surface-variant text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">
              {t('viewAll')}
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
          </div>
          {/* Tip Card */}
          <div className="bg-primary-container text-white rounded-xl p-6 relative overflow-hidden group shadow-lg">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-8xl">school</span>
            </div>
            <h5 className="text-xs font-black uppercase tracking-[0.2em] mb-2 opacity-70">{t('proTip')}</h5>
            <p className="text-sm font-medium leading-relaxed relative z-10">
              "Always look twice for motorcyclists when turning right at junctions. Their speed can be deceptive."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
