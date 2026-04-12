"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export default function TheoryTestPage() {
  const t = useTranslations("Theory");
  const params = useParams();
  const locale = params.locale as string;

  const [mode, setMode] = useState<"selection" | "practice" | "mock">(
    "selection",
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(1800); // 30 mins
  const [finished, setFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [studyMode, setStudyMode] = useState(true);

  useEffect(() => {
    if (mode !== "selection") {
      fetchQuestions();
    }
    if (mode === "mock") {
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
    try {
      const studentId = localStorage.getItem("student_id") || "demo-student-id";
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/theory/questions?studentId=${studentId}`);
      const data = await response.json();

      if (data && data.length > 0) {
        setQuestions(data);
      } else {
        // Fallback mock questions if API fails or no questions for country
        const mockQuestions: Question[] = [
          {
            id: "1",
            question: locale === 'cs' ? "Jaká je maximální povolená rychlost v obci?" : "What is the maximum speed limit in a built-up area?",
            options: ["30 km/h", "50 km/h", "70 km/h", "90 km/h"],
            answer: "50 km/h",
            explanation: locale === 'cs' ? "V obci je standardně povolena rychlost 50 km/h." : "The standard speed limit in built-up areas is 50 km/h.",
          }
        ];
        setQuestions(mockQuestions);
      }
    } catch (error) {
      console.error("Failed to fetch questions", error);
    }
  };

  const handleOptionClick = (option: string) => {
    if (feedback && studyMode) return;
    setSelectedOption(option);
    setUserAnswers({ ...userAnswers, [questions[currentIndex].id]: option });

    if (studyMode) {
      if (option === questions[currentIndex].answer) {
        setScore(score + 1);
        setFeedback("correct");
      } else {
        setFeedback("incorrect");
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      const nextQId = questions[currentIndex + 1].id;
      setSelectedOption(userAnswers[nextQId] || null);
      setFeedback(null);
    } else {
      finishTest();
    }
  };

  const finishTest = async () => {
    setFinished(true);

    let finalScore = 0;
    if (!studyMode) {
        questions.forEach(q => {
            if (userAnswers[q.id] === q.answer) finalScore++;
        });
    } else {
        finalScore = score;
    }

    const passed = (finalScore / questions.length) >= 0.85;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/theory/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: localStorage.getItem("student_id") || "demo-student-id",
          score: finalScore,
          total: questions.length,
          passed,
          answers: userAnswers,
          mode
        }),
      });
    } catch (error) {
        console.error("Failed to save results", error);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (mode === "selection") {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center mt-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-8">
          {t("title")}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setMode("practice")}
            className="p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-teal-500 hover:shadow-xl transition-all group"
          >
            <span className="material-symbols-outlined text-4xl mb-4 text-teal-600 group-hover:scale-110 transition-transform">
              menu_book
            </span>
            <h3 className="text-xl font-bold mb-2">{t("practiceMode")}</h3>
            <p className="text-slate-500 text-sm">{t("practiceDesc")}</p>
          </button>
          <button
            onClick={() => setMode("mock")}
            className="p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-error hover:shadow-xl transition-all group"
          >
            <span className="material-symbols-outlined text-4xl mb-4 text-error group-hover:scale-110 transition-transform">
              timer
            </span>
            <h3 className="text-xl font-bold mb-2">{t("mockExam")}</h3>
            <p className="text-slate-500 text-sm">{t("mockDesc")}</p>
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    const finalScore = !studyMode ? questions.filter(q => userAnswers[q.id] === q.answer).length : score;
    const percentage = Math.round((finalScore / questions.length) * 100);
    const passed = percentage >= 85;

    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white rounded-3xl shadow-2xl mt-12 border border-slate-100">
        <div
          className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-8 ${passed ? "bg-teal-100 text-teal-600" : "bg-error-container/20 text-error"}`}
        >
          <span className="material-symbols-outlined text-5xl">
            {passed ? "check_circle" : "cancel"}
          </span>
        </div>
        <h2 className="text-4xl font-black mb-2">
          {passed ? t("passed") : t("failed")}
        </h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-12">
          {t("yourScore")}: {finalScore} / {questions.length} ({percentage}%)
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-slate-900 text-white px-10 py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors"
        >
          {t("tryAgain")}
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <span className="bg-slate-900 text-white w-10 h-10 rounded-lg flex items-center justify-center font-black">
                {currentIndex + 1}
              </span>
              <div>
                <h2 className="font-bold text-slate-900">
                  {mode === "mock" ? t("mockExam") : t("practiceMode")}
                </h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">
                  {currentIndex + 1} / {questions.length} {t("questions")}
                </p>
              </div>
            </div>
            {mode === "mock" && (
              <div className="flex items-center gap-2 bg-error-container/10 px-4 py-2 rounded-xl text-error">
                <span className="material-symbols-outlined text-sm">timer</span>
                <span className="font-mono font-bold">{formatTime(timer)}</span>
              </div>
            )}
          </div>

          <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col justify-center">
            {currentQuestion && (
              <>
                <div className="mb-10">
                  <h3 className="text-2xl font-bold text-slate-900 leading-snug">
                    {currentQuestion.question}
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {(currentQuestion.options as any).map((option: string, idx: number) => {
                    const isSelected = selectedOption === option;
                    const isCorrect = option === currentQuestion.answer;
                    const letters = ["A", "B", "C", "D"];

                    let bgClass = "bg-slate-50 border-slate-200 hover:bg-slate-100";
                    let letterClass = "bg-slate-200 text-slate-600";

                    if (studyMode && feedback) {
                      if (isCorrect) {
                        bgClass = "bg-teal-50 border-teal-500";
                        letterClass = "bg-teal-500 text-white";
                      } else if (isSelected) {
                        bgClass = "bg-error-container/20 border-error";
                        letterClass = "bg-error text-white";
                      }
                    } else if (isSelected) {
                      bgClass = "border-slate-900 bg-slate-900 text-white";
                      letterClass = "bg-white/20 text-white";
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
                        <span className="flex-1 font-medium text-lg">
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between items-center px-4">
            <button
              disabled={currentIndex === 0}
              onClick={() => {
                setCurrentIndex(currentIndex - 1);
                const prevQId = questions[currentIndex - 1].id;
                setSelectedOption(userAnswers[prevQId] || null);
                setFeedback(null);
              }}
              className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors disabled:opacity-30"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              {t("previous")}
            </button>
            <button
              onClick={handleNext}
              disabled={!selectedOption}
              className="bg-teal-500 text-slate-900 px-8 py-3 rounded-xl font-bold flex items-center gap-3 hover:scale-95 transition-transform disabled:opacity-50"
            >
              {currentIndex === questions.length - 1 ? t("finish") : t("nextQuestion")}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-4">
           <div className="bg-white rounded-2xl p-6 border border-slate-100 sticky top-24">
              <h4 className="font-bold mb-4">{t("examNavigator")}</h4>
              <div className="grid grid-cols-5 gap-2">
                 {questions.map((q, idx) => (
                    <button
                       key={q.id}
                       onClick={() => {
                          setCurrentIndex(idx);
                          setSelectedOption(userAnswers[q.id] || null);
                          setFeedback(null);
                       }}
                       className={`h-10 rounded-lg text-xs font-bold transition-all ${currentIndex === idx ? 'ring-2 ring-teal-500 ring-offset-2' : ''} ${userAnswers[q.id] ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-400'}`}
                    >
                       {idx + 1}
                    </button>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
