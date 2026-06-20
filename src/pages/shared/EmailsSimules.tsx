import { useState } from 'react';
import { Mail, Search, Calendar, User, Tag, FileText } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';

export default function EmailsSimules() {
  const { emailsSimules, loading } = useRealtimeDataStore();
  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState<'all' | 'welcome' | 'grade'>('all');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  const getEmailIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return <User className="text-emerald-500" size={16} />;
      case 'grade':
        return <FileText className="text-indigo-500" size={16} />;
      default:
        return <Mail className="text-slate-400" size={16} />;
    }
  };

  const getEmailBadgeColor = (type: string) => {
    switch (type) {
      case 'welcome':
        return 'badge-success bg-emerald-50 text-emerald-700';
      case 'grade':
        return 'badge-info bg-indigo-50 text-indigo-700';
      default:
        return 'badge-ghost';
    }
  };

  const getEmailLabel = (type: string) => {
    switch (type) {
      case 'welcome':
        return 'Activation';
      case 'grade':
        return 'Note publiée';
      default:
        return 'Système';
    }
  };

  // Sort by date desc
  const sortedEmails = [...emailsSimules].sort(
    (a, b) => new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime()
  );

  const filtered = sortedEmails.filter((email) => {
    const matchesSearch =
      email.to.toLowerCase().includes(search.toLowerCase()) ||
      (email.recipientName || '').toLowerCase().includes(search.toLowerCase()) ||
      email.subject.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = activeFolder === 'all' || email.type === activeFolder;
    return matchesSearch && matchesFolder;
  });

  const selectedEmail = filtered.find((e) => e.id === selectedEmailId) || (filtered.length > 0 ? filtered[0] : null);

  return (
    <div className="page-transition space-y-6 flex flex-col h-full">
      <PageHeader
        title="Journal des Emails Envoyés"
        description="Messagerie de simulation — Suivi des notifications automatiques expédiées par le système"
        breadcrumbs={[{ label: 'Admin' }, { label: 'Emails Envoyés' }]}
      />

      {loading ? (
        <div className="w-full flex justify-center py-20 flex-1">
          <span className="loading loading-spinner loading-lg text-indigo-600"></span>
        </div>
      ) : emailsSimules.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white border border-slate-100 rounded-3xl shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl mb-4">
            ✉️
          </div>
          <h3 className="text-lg font-bold text-slate-800">Aucun e-mail simulé</h3>
          <p className="text-slate-400 text-sm max-w-sm mt-1">
            Les e-mails de bienvenue et de notes apparaîtront ici dès que des actions automatisées auront lieu.
          </p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden min-h-0 h-[calc(100vh-250px)] min-h-[500px]">
          {/* Left pane: folders & list */}
          <div className="lg:col-span-1 flex flex-col space-y-4 overflow-hidden h-full">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher destinataire, sujet..."
                className="input-premium w-full pl-9 pr-4 py-2 text-sm bg-white"
              />
            </div>

            {/* Folders */}
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'all', label: 'Tous' },
                { id: 'welcome', label: 'Bienvenue' },
                { id: 'grade', label: 'Notes' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setActiveFolder(f.id as any);
                    setSelectedEmailId(null);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    activeFolder === f.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto bg-white border border-slate-100 rounded-3xl divide-y divide-slate-100 shadow-sm min-h-0">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">Aucun email correspondant.</div>
              ) : (
                filtered.map((email) => {
                  const isSelected = selectedEmail?.id === email.id;
                  const dateStr = email.sentAt ? new Date(email.sentAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '—';

                  return (
                    <div
                      key={email.id}
                      onClick={() => setSelectedEmailId(email.id)}
                      className={`p-4 cursor-pointer transition-all hover:bg-slate-50/50 flex flex-col gap-2 ${
                        isSelected ? 'bg-indigo-50/30 border-l-4 border-l-indigo-600 pl-3' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-mono font-medium truncate max-w-[120px]">
                          {email.universityName || 'Système'}
                        </span>
                        <span className="text-[10px] text-slate-400">{dateStr}</span>
                      </div>
                      <h4 className="font-semibold text-slate-800 text-sm truncate">{email.subject}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="font-medium text-slate-700 truncate">{email.recipientName || email.to}</span>
                        <span>·</span>
                        <span className={`badge badge-xs px-2 py-1.5 ${getEmailBadgeColor(email.type)}`}>
                          {getEmailLabel(email.type)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right pane: email body */}
          <div className="lg:col-span-2 flex flex-col h-full bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            {selectedEmail ? (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Header info */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getEmailIcon(selectedEmail.type)}
                        <span className={`badge text-xs px-2.5 py-1 ${getEmailBadgeColor(selectedEmail.type)}`}>
                          {getEmailLabel(selectedEmail.type)}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 mt-2">{selectedEmail.subject}</h2>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {selectedEmail.sentAt ? new Date(selectedEmail.sentAt).toLocaleString('fr-FR') : '—'}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-col gap-1 text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold w-12 text-slate-400">De:</span>
                      <span className="text-slate-800">noreply@campus.ci (Automate CAMPUS)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold w-12 text-slate-400">À:</span>
                      <span className="text-slate-800 font-medium">{selectedEmail.recipientName}</span>
                      <span className="text-slate-400 font-mono">&lt;{selectedEmail.to}&gt;</span>
                    </div>
                    {selectedEmail.universityName && (
                      <div className="flex items-center gap-1">
                        <span className="font-semibold w-12 text-slate-400">Univ:</span>
                        <span className="text-slate-700 font-semibold">{selectedEmail.universityName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Body */}
                <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm max-w-2xl mx-auto">
                    {/* Fake Header logo */}
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                      <img src="/images/logo-original.png" alt="Campus Logo" className="w-8 h-8 rounded-lg object-cover" />
                      <span className="font-bold text-sm text-slate-800 tracking-wider">CAMPUS ACADEMY</span>
                    </div>

                    {/* Content text */}
                    <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-sans">
                      {selectedEmail.body}
                    </div>

                    {/* Fake Footer */}
                    <div className="border-t border-slate-100 mt-6 pt-4 text-center text-xs text-slate-400">
                      Cet e-mail est une simulation système émise par le portail CAMPUS SaaS.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <Mail size={40} className="text-slate-200 mb-2" />
                <p className="text-sm">Sélectionnez un email dans la liste pour afficher son contenu.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
