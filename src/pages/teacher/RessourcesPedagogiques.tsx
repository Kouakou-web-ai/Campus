import { useState } from 'react';
import { Upload, FileText, Video, Link2, Image, Archive, Download, ExternalLink, X, Plus } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { useAuthStore } from '../../store/authStore';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';

const TYPE_CONFIG = {
  pdf: { icon: FileText, color: 'text-red-500', bg: 'bg-red-50', label: 'PDF' },
  video: { icon: Video, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Vidéo' },
  link: { icon: Link2, color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Lien' },
  image: { icon: Image, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Image' },
  archive: { icon: Archive, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Archive' },
};

export default function RessourcesPedagogiques() {
  const { user } = useAuthStore();
  const { resources, courses, addResource, loading } = useRealtimeDataStore();
  const [modalOpen, setModalOpen] = useState(false);

  const myCourses = courses.filter(c => c.teacherId === user?.id);
  const myCoursesIds = myCourses.map(c => c.id);
  const myResources = resources.filter(r => myCoursesIds.includes(r.courseId));

  // Form states for new resource
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'pdf' | 'video' | 'link' | 'image' | 'archive'>('pdf');
  const [courseId, setCourseId] = useState('');
  const [size, setSize] = useState('1.5 Mo');

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.universityId) return;
    if (!title || !courseId) {
      ToastError("Veuillez remplir les champs obligatoires.");
      return;
    }
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    try {
      await addResource(user.universityId, {
        title,
        type,
        courseId,
        courseTitle: course.title,
        size: type === 'link' ? undefined : size,
        uploadedAt: new Date().toISOString().split('T')[0],
        downloadCount: 0
      });

      ToastSuccess("Ressource ajoutée avec succès !");
      setTitle('');
      setModalOpen(false);
    } catch (err: any) {
      ToastError(err.message || "Erreur lors de l'ajout.");
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-indigo-600"></span>
      </div>
    );
  }

  return (
    <div className="page-transition space-y-6">
      <PageHeader
        title="Ressources pédagogiques"
        description="Bibliothèque de ressources pour vos cours en temps réel"
        breadcrumbs={[{ label: 'Enseignant' }, { label: 'Ressources' }]}
        actions={
          <button onClick={() => setModalOpen(true)} className="btn-gradient text-sm px-4 py-2 rounded-full font-semibold text-white flex items-center gap-1.5">
            <Plus size={14} />
            Ajouter ressource
          </button>
        }
      />

      {/* Zone de dépôt simulée */}
      <div onClick={() => setModalOpen(true)} className="border-2 border-dashed border-indigo-200 rounded-3xl p-8 text-center bg-indigo-50/30 hover:bg-indigo-50/60 hover:border-indigo-300 transition-all cursor-pointer group">
        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
          <Upload size={24} className="text-indigo-500" />
        </div>
        <p className="text-slate-700 font-semibold text-sm">Glissez-déposez vos fichiers ici</p>
        <p className="text-xs text-slate-400 mt-1">PDF, Vidéo, Images, Archives — Max 100Mo par fichier</p>
        <button className="mt-4 text-xs text-indigo-600 font-semibold border border-indigo-200 bg-white px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors">
          Parcourir les fichiers
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(TYPE_CONFIG).map(([tKey, config]) => {
          const Icon = config.icon;
          const count = myResources.filter(r => r.type === tKey).length;
          return (
            <div key={tKey} className="card-premium p-4 flex items-center gap-3 animate-fade-up">
              <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center`}>
                <Icon size={16} className={config.color} />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800">{count}</div>
                <div className="text-xs text-slate-400">{config.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Liste ressources */}
      <div className="card-premium overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">Bibliothèque ({myResources.length})</h3>
        </div>
        
        {myResources.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Aucune ressource pédagogique dans votre bibliothèque.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myResources.map(resource => {
              const config = TYPE_CONFIG[resource.type] ?? TYPE_CONFIG.pdf;
              const Icon = config.icon;

              return (
                <div key={resource.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group animate-fade-up">
                  <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{resource.title}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="font-semibold text-indigo-600">{resource.courseTitle}</span>
                      {resource.size && <span>· {resource.size}</span>}
                      <span>· {new Date(resource.uploadedAt).toLocaleDateString('fr-FR')}</span>
                      <span>· {resource.downloadCount || 0} téléch.</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      {resource.type === 'link' ? <ExternalLink size={15} /> : <Download size={15} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-100 shadow-2xl relative animate-fade-up">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold text-slate-800 mb-6">Ajouter une ressource</h3>
            <form onSubmit={handleAddResource} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nom du document / ressource</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="ex: Support de cours Chapitre 1"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="pdf">Document PDF</option>
                    <option value="video">Vidéo MP4 / Lien</option>
                    <option value="link">Lien internet</option>
                    <option value="image">Illustration / Image</option>
                    <option value="archive">Archive .zip / .rar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Taille simulée</label>
                  <input
                    type="text"
                    value={size}
                    disabled={type === 'link'}
                    onChange={e => setSize(e.target.value)}
                    placeholder="ex: 2.4 Mo"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Associer au cours</label>
                <select
                  value={courseId}
                  onChange={e => setCourseId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Sélectionner le cours…</option>
                  {myCourses.map(c => (
                    <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors mt-4"
              >
                <Plus size={16} />
                Ajouter à la bibliothèque
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
