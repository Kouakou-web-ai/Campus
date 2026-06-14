import { useState, useEffect } from 'react';
import { BookOpen, Award, RotateCcw, Check, ChevronRight, HelpCircle, Lock, BookOpenCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';
import { FILIERE_QUIZZES } from '../../constants/quizData';
import type { ChapterData } from '../../constants/quizData';

export default function LearningQuiz() {
  const { user } = useAuthStore();
  
  // Detect major (filière) with fallback to informatique
  const getFiliereKey = (filiere: string | undefined): string => {
    if (!filiere) return 'informatique';
    const low = filiere.toLowerCase();
    if (low.includes('logiciel') || low.includes('software')) return 'genie_logiciel';
    if (low.includes('réseaux') || low.includes('reseau') || low.includes('telecom') || low.includes('network')) return 'reseaux';
    return 'informatique';
  };

  const filiereKey = getFiliereKey(user?.filiere);
  const chapters: ChapterData[] = FILIERE_QUIZZES[filiereKey] || FILIERE_QUIZZES['informatique'];
  const filiereDisplayName = user?.filiere || 'Informatique';

  // State for unlocked level (1 to 10)
  const progressKey = `campus_quiz_progress_${user?.id || 'guest'}_${filiereKey}`;
  const [unlockedLevel, setUnlockedLevel] = useState<number>(() => {
    const saved = localStorage.getItem(progressKey);
    return saved ? parseInt(saved, 10) : 1;
  });

  // Current active quiz states
  const [activeChapter, setActiveChapter] = useState<ChapterData | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [qValidated, setQValidated] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    // Reset state if chapter changes
    setSelectedOpt(null);
    setQValidated(false);
    setScore(0);
    setQuizFinished(false);
    setQIndex(0);
  }, [activeChapter]);

  const handleValidateQuiz = () => {
    if (selectedOpt === null || !activeChapter) return;
    setQValidated(true);
    if (selectedOpt === activeChapter.quiz[qIndex].ans) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    if (!activeChapter) return;
    if (qIndex < activeChapter.quiz.length - 1) {
      setQIndex(prev => prev + 1);
      setSelectedOpt(null);
      setQValidated(false);
    } else {
      // Calculate final score percentage
      const scorePct = Math.round(( (score + (selectedOpt === activeChapter.quiz[qIndex].ans && !qValidated ? 1 : 0)) / activeChapter.quiz.length) * 100);
      
      // Let's compute final score correctly
      let finalScore = score;
      if (!qValidated && selectedOpt === activeChapter.quiz[qIndex].ans) {
        finalScore += 1;
      }
      const finalPct = Math.round((finalScore / activeChapter.quiz.length) * 100);

      setQuizFinished(true);
      
      // If 100%, unlock next chapter
      if (finalPct === 100) {
        if (activeChapter.id === unlockedLevel && unlockedLevel < 10) {
          const nextLevel = unlockedLevel + 1;
          setUnlockedLevel(nextLevel);
          localStorage.setItem(progressKey, nextLevel.toString());
          ToastSuccess(`Félicitations ! Chapitre ${activeChapter.id} validé. Chapitre ${nextLevel} débloqué !`);
        } else {
          ToastSuccess(`Félicitations ! Score parfait de 100% !`);
        }
      }
    }
  };

  const startQuiz = (chapter: ChapterData) => {
    if (chapter.id > unlockedLevel) {
      ToastError("Ce chapitre est verrouillé. Validez le chapitre précédent avec 100% !");
      return;
    }
    setActiveChapter(chapter);
  };

  const restartQuiz = () => {
    setQIndex(0);
    setSelectedOpt(null);
    setQValidated(false);
    setScore(0);
    setQuizFinished(false);
  };

  const handleNextChapter = () => {
    if (!activeChapter) return;
    const nextId = activeChapter.id + 1;
    const nextCh = chapters.find(c => c.id === nextId);
    if (nextCh && nextId <= unlockedLevel) {
      setActiveChapter(nextCh);
    } else {
      setActiveChapter(null);
    }
  };

  // Compute stats
  const completedCount = unlockedLevel - 1;
  const progressPercent = Math.round((completedCount / 10) * 100);

  if (activeChapter) {
    const currentQuestion = activeChapter.quiz[qIndex];
    const scorePercentage = Math.round((score / activeChapter.quiz.length) * 100);

    return (
      <div className="card-premium p-6 space-y-5 animate-fade-in bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        {/* Quiz header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">Chapitre {activeChapter.id}</span>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight mt-0.5">{activeChapter.name}</h3>
          </div>
          <button 
            type="button" 
            onClick={() => setActiveChapter(null)}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            Retour
          </button>
        </div>

        {!quizFinished ? (
          <div className="space-y-4">
            {/* Progress indicator */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Question {qIndex + 1} sur {activeChapter.quiz.length}</span>
                <span>Progression : {Math.round(((qIndex) / activeChapter.quiz.length) * 100)}%</span>
              </div>
              <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${((qIndex) / activeChapter.quiz.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/60">
              <p className="text-sm font-bold text-slate-850 dark:text-slate-100 leading-snug">{currentQuestion.q}</p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {currentQuestion.opts.map((opt, i) => {
                const isSelected = selectedOpt === i;
                const isCorrect = currentQuestion.ans === i;
                let optClass = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300';

                if (qValidated) {
                  if (isCorrect) {
                    optClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 font-semibold shadow-sm shadow-emerald-500/10';
                  } else if (isSelected) {
                    optClass = 'border-red-400 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400';
                  } else {
                    optClass = 'border-slate-100 dark:border-slate-800 opacity-50 text-slate-400 dark:text-slate-600';
                  }
                } else if (isSelected) {
                  optClass = 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/25 text-indigo-900 dark:text-indigo-300 font-bold';
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

            {/* Explanation Box */}
            {qValidated && (
              <div className="p-3 bg-indigo-50/40 dark:bg-indigo-950/10 rounded-xl text-xs text-indigo-950 dark:text-indigo-300 border border-indigo-100/50 dark:border-indigo-950/20 animate-fade-in leading-relaxed">
                <p className="font-bold text-indigo-650 dark:text-indigo-400 mb-0.5">💡 Explication :</p>
                <p className="text-slate-600 dark:text-slate-400">{currentQuestion.exp}</p>
              </div>
            )}

            {/* Actions */}
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
                  <span>{qIndex < activeChapter.quiz.length - 1 ? 'Suivant' : 'Terminer'}</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Quiz finished screen */
          <div className="py-6 text-center space-y-4 animate-fade-in">
            {scorePercentage === 100 ? (
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/25 flex items-center justify-center mx-auto text-emerald-500 shadow-inner">
                <Award size={32} />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/25 flex items-center justify-center mx-auto text-amber-500">
                <RotateCcw size={28} />
              </div>
            )}

            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                {scorePercentage === 100 ? 'Chapitre Validé !' : 'Score insuffisant'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Votre score : <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{scorePercentage}%</span>
              </p>
              {scorePercentage < 100 && (
                <p className="text-[10px] text-red-500 font-medium">Un score de 100% est requis pour valider et débloquer le niveau suivant.</p>
              )}
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
              {scorePercentage === 100 && activeChapter.id < 10 && activeChapter.id + 1 <= unlockedLevel && (
                <button 
                  type="button"
                  onClick={handleNextChapter} 
                  className="btn btn-xs btn-primary rounded-lg text-white"
                >
                  Chapitre suivant
                </button>
              )}
              <button 
                type="button"
                onClick={() => setActiveChapter(null)} 
                className="btn btn-xs btn-ghost rounded-lg"
              >
                Grille des chapitres
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card-premium p-6 space-y-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <BookOpen className="text-indigo-500" size={16} />
          <span>Innovations d'Apprentissage — Quiz par Filière</span>
        </h3>
        <span className="text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full">
          Filière : {filiereDisplayName}
        </span>
      </div>

      {/* Progress header bar */}
      <div className="bg-slate-50 dark:bg-slate-950/20 rounded-2xl p-4 flex items-center justify-between gap-4 border border-slate-100 dark:border-slate-800/40 text-xs">
        <div className="flex items-center gap-2">
          <BookOpenCheck className="text-indigo-500" size={18} />
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-200">Votre avancement global</p>
            <p className="text-[10px] text-slate-400">{completedCount} sur 10 chapitres validés</p>
          </div>
        </div>
        <div className="text-right">
          <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{progressPercent}%</span>
          <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-indigo-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {chapters.map((chapter) => {
          const isLocked = chapter.id > unlockedLevel;
          const isValidated = chapter.id < unlockedLevel;
          const isActive = chapter.id === unlockedLevel;

          return (
            <div 
              key={chapter.id} 
              onClick={() => !isLocked && startQuiz(chapter)}
              className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between h-28 cursor-pointer ${
                isLocked 
                  ? 'bg-slate-50/50 dark:bg-slate-950/10 border-slate-100 dark:border-slate-850 opacity-60 cursor-not-allowed'
                  : isValidated
                    ? 'bg-emerald-50/10 dark:bg-emerald-950/5 border-emerald-100 dark:border-emerald-950/20 hover:border-emerald-300 dark:hover:border-emerald-800'
                    : 'bg-indigo-50/10 dark:bg-indigo-950/5 border-indigo-100 dark:border-indigo-950/20 hover:border-indigo-300 dark:hover:border-indigo-800 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isLocked 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' 
                    : isValidated 
                      ? 'bg-emerald-100/60 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-indigo-100/60 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                }`}>
                  Chapitre {chapter.id}
                </span>

                {isLocked ? (
                  <Lock size={12} className="text-slate-400" />
                ) : isValidated ? (
                  <Check size={12} className="text-emerald-500 font-bold" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 mt-2">{chapter.name}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {isLocked 
                    ? 'Verrouillé' 
                    : isValidated 
                      ? 'Validé · 100%' 
                      : 'Disponible · Lancer le Quiz'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
