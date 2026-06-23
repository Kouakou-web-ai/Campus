import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import PageHeader from '../../components/ui/PageHeader';
import { Star, Send, MessageSquare, ShieldAlert, Award, FileText, CheckCircle2 } from 'lucide-react';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';
import { db } from '../../../firebase-config';
import { ref, push, onValue } from 'firebase/database';

type CriterionKey = 'enseignement' | 'infrastructures' | 'administration' | 'services';

export default function EvaluationSuggestions() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'evaluation' | 'suggestion' | 'historique'>('evaluation');

  // Evaluation form state
  const [ratings, setRatings] = useState<Record<CriterionKey, number>>({
    enseignement: 5,
    infrastructures: 5,
    administration: 5,
    services: 5,
  });
  const [evalComment, setEvalComment] = useState('');
  const [evalAnonymous, setEvalAnonymous] = useState(false);
  const [submittingEval, setSubmittingEval] = useState(false);

  // Suggestion form state
  const [suggCategory, setSuggCategory] = useState('Cours et Pédagogie');
  const [suggSubject, setSuggSubject] = useState('');
  const [suggContent, setSuggContent] = useState('');
  const [suggAnonymous, setSuggAnonymous] = useState(false);
  const [submittingSugg, setSubmittingSugg] = useState(false);

  // Past submissions state
  const [myEvaluations, setMyEvaluations] = useState<any[]>([]);
  const [mySuggestions, setMySuggestions] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const criteriaLabels: Record<CriterionKey, string> = {
    enseignement: "Qualité de l'enseignement",
    infrastructures: "Infrastructures et équipements",
    administration: "Administration et accompagnement",
    services: "Services et vie étudiante",
  };

  const categories = [
    'Planning et Calendrier',
    'Cafétéria et Restauration',
    'Cours et Pédagogie',
    'Équipements et Locaux',
    'Activités et Vie Étudiante',
    'Autre',
  ];

  // Fetch past submissions
  useEffect(() => {
    if (!user?.universityId || !user?.id) return;

    const evalsRef = ref(db, `universites/${user.universityId}/evaluations`);
    const suggsRef = ref(db, `universites/${user.universityId}/suggestions`);

    const unsubEvals = onValue(evalsRef, (snapshot) => {
      const data = snapshot.val();
      const list: any[] = [];
      if (data) {
        Object.entries(data).forEach(([key, val]: [string, any]) => {
          if (val.userId === user.id) {
            list.push({ id: key, ...val });
          }
        });
      }
      setMyEvaluations(list.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)));
    });

    const unsubSuggs = onValue(suggsRef, (snapshot) => {
      const data = snapshot.val();
      const list: any[] = [];
      if (data) {
        Object.entries(data).forEach(([key, val]: [string, any]) => {
          if (val.userId === user.id) {
            list.push({ id: key, ...val });
          }
        });
      }
      setMySuggestions(list.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)));
      setLoadingHistory(false);
    });

    return () => {
      unsubEvals();
      unsubSuggs();
    };
  }, [user]);

  const handleRatingChange = (criterion: CriterionKey, value: number) => {
    setRatings(prev => ({ ...prev, [criterion]: value }));
  };

  const getAverageScore = () => {
    const total = Object.values(ratings).reduce((acc, curr) => acc + curr, 0);
    return (total / Object.keys(ratings).length).toFixed(1);
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return { label: 'Excellent', color: 'text-emerald-500 bg-emerald-50 border-emerald-100' };
    if (score >= 3.5) return { label: 'Très bon', color: 'text-teal-500 bg-teal-50 border-teal-100' };
    if (score >= 2.5) return { label: 'Satisfaisant', color: 'text-amber-500 bg-amber-50 border-amber-100' };
    if (score >= 1.5) return { label: 'Passable', color: 'text-orange-500 bg-orange-50 border-orange-100' };
    return { label: 'Insuffisant', color: 'text-rose-500 bg-rose-50 border-rose-100' };
  };

  const submitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.universityId) return;

    setSubmittingEval(true);
    try {
      const avg = parseFloat(getAverageScore());
      const evalData = {
        userId: user.id,
        userName: evalAnonymous ? 'Anonyme' : user.name,
        userRole: user.role,
        ratings,
        average: avg,
        comment: evalComment,
        isAnonymous: evalAnonymous,
        submittedAt: new Date().toISOString(),
      };

      const evalsRef = ref(db, `universites/${user.universityId}/evaluations`);
      await push(evalsRef, evalData);

      ToastSuccess("Votre évaluation a été soumise avec succès ! Merci de votre contribution.");
      setEvalComment('');
      setRatings({
        enseignement: 5,
        infrastructures: 5,
        administration: 5,
        services: 5,
      });
      setActiveTab('historique');
    } catch (err: any) {
      ToastError("Erreur lors de la soumission de l'évaluation.");
    } finally {
      setSubmittingEval(false);
    }
  };

  const submitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.universityId) return;
    if (!suggSubject.trim() || !suggContent.trim()) {
      ToastError("Veuillez remplir l'objet et le contenu de la suggestion.");
      return;
    }

    setSubmittingSugg(true);
    try {
      const suggestionData = {
        userId: user.id,
        userName: suggAnonymous ? 'Anonyme' : user.name,
        userRole: user.role,
        category: suggCategory,
        subject: suggSubject,
        content: suggContent,
        isAnonymous: suggAnonymous,
        submittedAt: new Date().toISOString(),
        status: 'nouveau', // nouveau, en_cours, traite
      };

      const suggsRef = ref(db, `universites/${user.universityId}/suggestions`);
      await push(suggsRef, suggestionData);

      ToastSuccess("Votre suggestion a bien été transmise à la boîte à suggestions.");
      setSuggSubject('');
      setSuggContent('');
      setActiveTab('historique');
    } catch (err: any) {
      ToastError("Erreur lors de la soumission de la suggestion.");
    } finally {
      setSubmittingSugg(false);
    }
  };

  const average = parseFloat(getAverageScore());
  const scoreBadge = getScoreLabel(average);

  return (
    <div className="page-transition space-y-6">
      <PageHeader
        title="Évaluation & Suggestions"
        description="Contribuez à l'amélioration continue de votre établissement universitaire."
        breadcrumbs={[{ label: 'Partagé' }, { label: 'Évaluations & Suggestions' }]}
      />

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('evaluation')}
          className={`pb-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'evaluation'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Award size={16} />
          Évaluer l'école
        </button>
        <button
          onClick={() => setActiveTab('suggestion')}
          className={`pb-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'suggestion'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <MessageSquare size={16} />
          Boîte à suggestions
        </button>
        <button
          onClick={() => setActiveTab('historique')}
          className={`pb-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'historique'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText size={16} />
          Mes contributions ({myEvaluations.length + mySuggestions.length})
        </button>
      </div>

      {activeTab === 'evaluation' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rating Forms */}
          <form onSubmit={submitEvaluation} className="lg:col-span-2 space-y-6">
            <div className="card-premium p-6 space-y-6">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                ⭐ Critères d'évaluation
              </h3>
              
              <div className="space-y-5">
                {(Object.keys(criteriaLabels) as CriterionKey[]).map((criterion) => (
                  <div key={criterion} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl hover:bg-slate-50/50 transition-all border border-transparent hover:border-slate-100">
                    <span className="text-sm font-semibold text-slate-700">{criteriaLabels[criterion]}</span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(criterion, star)}
                          className="p-1 focus:outline-none transition-all hover:scale-110 active:scale-95"
                        >
                          <Star
                            size={20}
                            className={`transition-colors ${
                              star <= ratings[criterion]
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-350 dark:text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-400 ml-2 w-4 text-center">
                        {ratings[criterion]}/5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-premium p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                💬 Commentaire général
              </h3>
              <div className="space-y-2">
                <textarea
                  value={evalComment}
                  onChange={(e) => setEvalComment(e.target.value)}
                  placeholder="Partagez votre avis détaillé sur les aspects positifs et les points d'amélioration de l'établissement..."
                  className="textarea textarea-bordered textarea-premium w-full min-h-[120px] text-sm"
                  rows={4}
                  required
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={evalAnonymous}
                    onChange={(e) => setEvalAnonymous(e.target.checked)}
                    className="checkbox checkbox-indigo checkbox-sm rounded-md"
                  />
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <ShieldAlert size={14} className="text-slate-400" />
                    Soumettre de façon anonyme
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={submittingEval}
                  className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md font-semibold text-sm gap-2 transition-all active:scale-95 border-none h-11 min-h-0"
                >
                  {submittingEval ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <>
                      <Send size={15} />
                      Envoyer l'évaluation
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Average visualizer sidebar */}
          <div className="space-y-6">
            <div className="card-premium p-6 text-center space-y-4 bg-gradient-to-b from-indigo-50/20 to-white dark:from-slate-800/20 border-indigo-100/50">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Moyenne Générale</h4>
              <div className="inline-flex items-center justify-center w-28 h-28 rounded-full border-4 border-indigo-100 bg-white dark:bg-slate-900 shadow-lg relative">
                <span className="text-3xl font-black text-indigo-655 font-mono">{average}</span>
                <span className="text-xs font-bold text-slate-400 absolute bottom-3">/ 5</span>
              </div>
              <div className="space-y-1">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${scoreBadge.color}`}>
                  {scoreBadge.label}
                </span>
                <p className="text-slate-400 text-[11px] px-4 pt-2">
                  Calculée automatiquement à partir des 4 critères ci-contre.
                </p>
              </div>
            </div>

            <div className="card-premium p-5 space-y-3 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                💡 Pourquoi évaluer ?
              </h4>
              <p className="text-xs text-slate-550 leading-relaxed">
                Les évaluations recueillies permettent à l'administration universitaire d'identifier les axes d'amélioration critiques et de mesurer la satisfaction générale de la communauté universitaire.
              </p>
              <div className="border-t border-slate-200/60 pt-3 text-[11px] text-slate-400 italic">
                * Vos retours sont confidentiels et traités avec le plus grand respect.
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'suggestion' ? (
        <form onSubmit={submitSuggestion} className="max-w-3xl mx-auto space-y-6">
          <div className="card-premium p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              📝 Formuler une suggestion
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Thématique</label>
                <select
                  value={suggCategory}
                  onChange={(e) => setSuggCategory(e.target.value)}
                  className="select select-bordered select-premium w-full text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Objet de la suggestion</label>
                <input
                  type="text"
                  value={suggSubject}
                  onChange={(e) => setSuggSubject(e.target.value)}
                  placeholder="Ex: Réaménagement des horaires de la cafétéria"
                  className="input input-bordered input-premium w-full text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Description de votre suggestion</label>
              <textarea
                value={suggContent}
                onChange={(e) => setSuggContent(e.target.value)}
                placeholder="Décrivez précisément votre idée, le problème rencontré, et la solution que vous proposez..."
                className="textarea textarea-bordered textarea-premium w-full min-h-[150px] text-sm"
                rows={5}
                required
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={suggAnonymous}
                  onChange={(e) => setSuggAnonymous(e.target.checked)}
                  className="checkbox checkbox-indigo checkbox-sm rounded-md"
                />
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <ShieldAlert size={14} className="text-slate-400" />
                  Soumission anonyme (votre nom ne sera pas visible par l'administration)
                </span>
              </label>

              <button
                type="submit"
                disabled={submittingSugg}
                className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md font-semibold text-sm gap-2 transition-all active:scale-95 border-none h-11 min-h-0"
              >
                {submittingSugg ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <>
                    <Send size={15} />
                    Soumettre la suggestion
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* HISTORIQUE / MY CONTRIBUTIONS */
        <div className="space-y-6 max-w-5xl mx-auto">
          {loadingHistory ? (
            <div className="w-full flex justify-center py-20">
              <span className="loading loading-spinner loading-lg text-indigo-650"></span>
            </div>
          ) : myEvaluations.length === 0 && mySuggestions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-md">
              <MessageSquare className="mx-auto text-slate-300 mb-3" size={48} />
              <h3 className="text-lg font-semibold text-slate-700">Aucune contribution pour le moment</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto mt-1">
                Vos évaluations de l'école et suggestions envoyées s'afficheront ici.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Evaluations List */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 px-1">
                  ⭐ Mes évaluations ({myEvaluations.length})
                </h3>
                
                {myEvaluations.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-white p-6 rounded-3xl border border-slate-100">Aucune évaluation soumise.</p>
                ) : (
                  myEvaluations.map((item) => (
                    <div key={item.id} className="card-premium p-5 space-y-4 hover:border-slate-200 transition-all">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(item.submittedAt).toLocaleDateString('fr-FR')} à {new Date(item.submittedAt).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.isAnonymous ? 'bg-slate-100 text-slate-650' : 'bg-indigo-50 text-indigo-700'}`}>
                          {item.isAnonymous ? 'Anonyme' : 'Nominatif'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(item.ratings).map(([key, rating]: [string, any]) => (
                          <div key={key} className="flex items-center justify-between bg-slate-50/50 p-2 rounded-xl">
                            <span className="text-slate-500 font-medium truncate max-w-[120px]">{criteriaLabels[key as CriterionKey] || key}</span>
                            <span className="font-bold text-amber-500 flex items-center gap-0.5">
                              {rating} <Star size={11} className="fill-amber-450 text-amber-450" />
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between bg-indigo-50/30 p-2.5 rounded-xl border border-indigo-50">
                        <span className="text-xs font-semibold text-slate-600">Note globale :</span>
                        <span className="text-xs font-bold text-indigo-700 font-mono">{item.average} / 5</span>
                      </div>

                      <p className="text-xs text-slate-600 italic bg-slate-50/40 p-3 rounded-xl border border-slate-100 leading-relaxed">
                        &ldquo;{item.comment}&rdquo;
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Suggestions List */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 px-1">
                  💡 Mes suggestions ({mySuggestions.length})
                </h3>

                {mySuggestions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-white p-6 rounded-3xl border border-slate-100">Aucune suggestion soumise.</p>
                ) : (
                  mySuggestions.map((item) => (
                    <div key={item.id} className="card-premium p-5 space-y-3 hover:border-slate-200 transition-all">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(item.submittedAt).toLocaleDateString('fr-FR')} à {new Date(item.submittedAt).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.status === 'traite' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : item.status === 'en_cours'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {item.status === 'traite' ? 'Traité' : item.status === 'en_cours' ? 'En cours' : 'Nouveau'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          {item.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 mt-2">{item.subject}</h4>
                      </div>

                      <p className="text-xs text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                        {item.content}
                      </p>

                      {item.status === 'traite' && (
                        <div className="flex items-start gap-2 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100 text-emerald-800 text-xs">
                          <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5 text-emerald-600" />
                          <div>
                            <span className="font-semibold">Réponse de l'administration :</span>
                            <p className="mt-0.5 text-slate-600 italic">Cette suggestion a été prise en compte et traitée par les équipes académiques. Merci !</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
