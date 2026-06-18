import React, { useState, useEffect } from 'react';
import { BookOpen, Award, RotateCcw, Check, ChevronRight, HelpCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import EmptyState from '../ui/EmptyState';

export default function StudentQuizzes() {
  const { user } = useAuthStore();
  const { courses, quizzes, loading, students } = useRealtimeDataStore();

  // Selected active quiz states
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [qValidated, setQValidated] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('tous');

  // Find student profile to get filiere
  const currentStudent = students.find((s) => s.id === user?.id || s.email === user?.email);
  const studentFiliere = currentStudent?.filiere || user?.filiere || 'Informatique';

  // Filter student's courses by filière
  const studentCourses = courses.filter((c) => c.filiere === studentFiliere);
  const studentCourseIds = studentCourses.map((c) => c.id);

  // Filter quizzes that belong to the student's courses
  const myQuizzes = quizzes.filter((q) => studentCourseIds.includes(q.courseId));

  const filteredQuizzes = myQuizzes.filter(
    (q) => selectedCourseFilter === 'tous' || q.courseId === selectedCourseFilter
  );

  useEffect(() => {
    setSelectedOpt(null);
    setQValidated(false);
    setScore(0);
    setQuizFinished(false);
    setQIndex(0);
  }, [activeQuiz]);

  const handleValidateQuiz = () => {
    if (selectedOpt === null || !activeQuiz) return;
    setQValidated(true);
    if (selectedOpt === activeQuiz.quiz[qIndex].ans) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    if (!activeQuiz) return;
    if (qIndex < activeQuiz.quiz.length - 1) {
      setQIndex((prev) => prev + 1);
      setSelectedOpt(null);
      setQValidated(false);
    } else {
      let finalScore = score;
      if (!qValidated && selectedOpt === activeQuiz.quiz[qIndex].ans) {
        finalScore += 1;
      }
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setQIndex(0);
    setSelectedOpt(null);
    setQValidated(false);
    setScore(0);
    setQuizFinished(false);
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center py-10">
        <span className="loading loading-spinner loading-md text-indigo-600"></span>
      </div>
    );
  }

  if (activeQuiz) {
    const currentQuestion = activeQuiz.quiz[qIndex];
    const totalQuestions = activeQuiz.quiz.length;
    const progressPct = Math.round((qIndex / totalQuestions) * 100);
    const scorePercentage = Math.round((score / totalQuestions) * 100);

    return (
      <div className="card-premium p-6 space-y-5 animate-fade-in bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
              {activeQuiz.courseCode} — Évaluation
            </span>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-0.5">
              {activeQuiz.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setActiveQuiz(null)}
            className="text-xs text-slate-400 hover:text-slate-650 transition-colors"
          >
            Quitter
          </button>
        </div>

        {!quizFinished ? (
          <div className="space-y-4">
            {/* Progress indicator */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Question {qIndex + 1} sur {totalQuestions}</span>
                <span>Progression : {progressPct}%</span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/60">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">{currentQuestion.q}</p>
            </div>

            {/* Options list */}
            <div className="space-y-2">
              {currentQuestion.opts.map((opt: string, i: number) => {
                const isSelected = selectedOpt === i;
                const isCorrect = currentQuestion.ans === i;
                let optClass = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700';

                if (qValidated) {
                  if (isCorrect) {
                    optClass = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold shadow-sm';
                  } else if (isSelected) {
                    optClass = 'border-red-400 bg-red-50 text-red-800';
                  } else {
                    optClass = 'border-slate-100 opacity-55 text-slate-400';
                  }
                } else if (isSelected) {
                  optClass = 'border-indigo-500 bg-indigo-50/45 text-indigo-900 font-bold';
                }

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={qValidated}
                    onClick={() => setSelectedOpt(i)}
                    className={`w-full text-left text-xs px-4 py-3 rounded-xl border transition-all ${optClass}`}
                  >
                    <span className="font-bold mr-2 opacity-50">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Explanation box */}
            {qValidated && currentQuestion.exp && (
              <div className="p-3 bg-indigo-50/40 rounded-xl text-xs text-indigo-950 border border-indigo-100/50 animate-fade-in leading-relaxed">
                <p className="font-bold text-indigo-750 mb-0.5">💡 Explication :</p>
                <p className="text-slate-600">{currentQuestion.exp}</p>
              </div>
            )}

            {/* Validate/Next button */}
            <div className="flex justify-end pt-2">
              {!qValidated ? (
                <button
                  type="button"
                  disabled={selectedOpt === null}
                  onClick={handleValidateQuiz}
                  className="btn btn-sm btn-primary rounded-xl text-xs px-5 text-white"
                >
                  Valider
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextQuiz}
                  className="btn btn-sm btn-primary rounded-xl text-xs px-5 text-white flex items-center gap-1.5"
                >
                  <span>{qIndex < totalQuestions - 1 ? 'Suivant' : 'Terminer'}</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Finished screen */
          <div className="py-6 text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mx-auto text-indigo-650 shadow-inner">
              <Award size={32} />
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-base">Quiz Terminé !</h4>
              <p className="text-xs text-slate-500">
                Votre score final : <span className="font-bold text-indigo-600 text-sm">{score} / {totalQuestions} ({scorePercentage}%)</span>
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={restartQuiz}
                className="btn btn-xs btn-primary btn-outline rounded-lg flex items-center gap-1"
              >
                <RotateCcw size={10} />
                <span>Réessayer</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveQuiz(null)}
                className="btn btn-xs btn-ghost rounded-lg"
              >
                Retour aux quiz
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="card-premium p-6 space-y-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850 pb-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <HelpCircle className="text-indigo-500" size={16} />
            <span>Quiz de vos cours</span>
          </h3>
          <span className="text-xs text-slate-500">Quizz d'entraînement officiels créés par vos professeurs</span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full">
          <label className="text-xs font-semibold text-slate-600">Filtrer par cours :</label>
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="input-premium px-3 py-1.5 text-xs max-w-xs"
          >
            <option value="tous">Tous les cours</option>
            {studentCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredQuizzes.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="Aucun quiz disponible"
          description="Vos professeurs n'ont publié aucun quiz pour ce cours."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredQuizzes.map((q) => (
            <div
              key={q.id}
              onClick={() => setActiveQuiz(q)}
              className="card-premium p-5 flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md transition-all cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                  {q.courseCode}
                </span>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mt-2 group-hover:text-indigo-600 transition-colors">
                  {q.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1">{q.courseTitle}</p>
                <p className="text-[10px] text-slate-450 mt-1 flex items-center gap-1">
                  <AlertCircle size={10} className="text-slate-400" />
                  {q.quiz?.length || 0} questions · Proposé par Prof. {q.teacherName}
                </p>
              </div>
              <span className="text-[10px] text-indigo-600 font-bold text-right mt-4 flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                Démarrer le Quiz <ChevronRight size={12} />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
