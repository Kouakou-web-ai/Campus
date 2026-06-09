import { useState } from 'react';
import { Plus, Download, Upload, Mail, Users, CheckCircle, UserPlus, Award, X, Trash2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import SearchBar from '../../components/ui/SearchBar';
import { Avatar } from '../../components/ui/AvatarGroup';
import type { Student, TableColumn } from '../../types';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { useAuthStore } from '../../store/authStore';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';
import ImportModal from '../../components/ui/ImportModal';

export default function GestionEtudiants() {
  const { user } = useAuthStore();
  const { students, addStudent, deleteStudent, loading } = useRealtimeDataStore();

  const handleDelete = async (studentId: string) => {
    if (!user?.universityId) return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ? Cette action est irréversible et supprimera également son compte utilisateur.")) {
      try {
        await deleteStudent(user.universityId, studentId);
        ToastSuccess("Étudiant supprimé avec succès.");
      } catch (err) {
        ToastError("Erreur lors de la suppression de l'étudiant.");
      }
    }
  };

  const columns: TableColumn<Student>[] = [
    {
      key: 'name',
      label: 'Étudiant',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <div>
            <p className="font-medium text-slate-800 text-sm">{row.name}</p>
            <p className="text-xs text-slate-400">{row.studentId}</p>
          </div>
        </div>
      ),
    },
    { key: 'filiere', label: 'Filière', sortable: true, render: (v) => <span className="text-sm text-slate-600">{String(v)}</span> },
    {
      key: 'annee',
      label: 'Année',
      sortable: true,
      render: (v) => <span className="text-sm font-medium text-slate-700">{String(v)}ème</span>,
    },
    {
      key: 'average',
      label: 'Moyenne',
      sortable: true,
      render: (v) => {
        const avg = Number(v || 0);
        return (
          <span className={`font-bold text-sm ${avg >= 14 ? 'text-emerald-600' : avg >= 10 ? 'text-amber-600' : 'text-red-500'}`}>
            {avg.toFixed(1)}/20
          </span>
        );
      },
    },
    {
      key: 'paidAmount',
      label: 'Paiement',
      render: (_, row) => {
        const total = row.totalAmount || 420000;
        const pct = Math.min(100, Math.round(((row.paidAmount || 0) / total) * 100));
        return (
          <div className="flex items-center gap-2 min-w-24">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
              <div
                className={`h-full rounded-full ${pct === 100 ? 'bg-emerald-400' : pct > 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 flex-shrink-0">{pct}%</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Statut',
      render: (v) => <StatusBadge status={v as never} />,
    },
    {
      key: 'id',
      label: '',
      render: (_, row) => (
        <div className="flex items-center gap-1 justify-end">
          <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Envoyer email">
            <Mail size={14} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const [search, setSearch] = useState('');
  const [filterFiliere, setFilterFiliere] = useState('tous');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Form states for new student
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [filiere, setFiliere] = useState('Informatique');
  const [annee, setAnnee] = useState(1);
  const [totalAmount, setTotalAmount] = useState(420000);
  const [paidAmount, setPaidAmount] = useState(0);

  const filieres = [...new Set(students.map(s => s?.filiere).filter(Boolean))];

  const filtered = students.filter(s => {
    if (!s) return false;
    const nameLower = (s.name || '').toLowerCase();
    const emailLower = (s.email || '').toLowerCase();
    const studentIdLower = (s.studentId || '').toLowerCase();
    const searchLower = (search || '').toLowerCase();

    const matchSearch = nameLower.includes(searchLower) ||
      emailLower.includes(searchLower) ||
      studentIdLower.includes(searchLower);
    const matchFiliere = filterFiliere === 'tous' || s.filiere === filterFiliere;
    const matchStatus = filterStatus === 'tous' || s.status === filterStatus;
    return matchSearch && matchFiliere && matchStatus;
  });

  const activeStudents = students.filter(s => s && s.status === 'actif').length;
  const avgGrade = students.length > 0 ? (students.reduce((sum, s) => sum + ((s && s.average) || 0), 0) / students.length) : 0;

  const STATS = [
    { title: 'Total étudiants', value: students.length, change: 5, trend: 'up' as const, icon: <Users size={20} className="text-indigo-600" />, gradient: 'bg-indigo-100' },
    { title: 'Actifs', value: activeStudents, change: 3, trend: 'up' as const, icon: <CheckCircle size={20} className="text-emerald-600" />, gradient: 'bg-emerald-100' },
    { title: 'Nouveaux ce mois', value: students.length > 0 ? Math.ceil(students.length * 0.1) : 0, change: 20, trend: 'up' as const, icon: <UserPlus size={20} className="text-blue-600" />, gradient: 'bg-blue-100' },
    { title: 'Moyenne générale', value: `${avgGrade.toFixed(1)}/20`, change: 1.2, trend: 'up' as const, icon: <Award size={20} className="text-amber-600" />, gradient: 'bg-amber-100' },
  ];

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.universityId) return;
    if (!name || !email) {
      ToastError("Veuillez remplir les champs obligatoires.");
      return;
    }
    try {
      const studentId = 'ETU-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
      await addStudent(user.universityId, {
        name,
        email,
        studentId,
        filiere,
        annee: Number(annee),
        status: 'en_attente',
        average: 0,
        absences: 0,
        paidAmount: Number(paidAmount),
        totalAmount: Number(totalAmount)
      });
      ToastSuccess("Étudiant ajouté. Il pourra créer son mot de passe depuis la page de connexion.");
      setName('');
      setEmail('');
      setPaidAmount(0);
      setModalOpen(false);
    } catch (err: any) {
      ToastError(err.message || "Erreur lors de l'ajout.");
    }
  };

  const handleImportStudents = async (items: any[]) => {
    if (!user?.universityId) return;
    try {
      for (const item of items) {
        await addStudent(user.universityId, {
          name: item.name,
          email: item.email,
          studentId: item.studentId,
          filiere: item.filiere,
          annee: Number(item.annee),
          status: 'en_attente',
          average: 0,
          absences: 0,
          paidAmount: Number(item.paidAmount || 0),
          totalAmount: Number(item.totalAmount || 420000)
        });
      }
      ToastSuccess("Tous les étudiants ont été importés et les invitations envoyées.");
    } catch (err: any) {
      ToastError("Une erreur est survenue lors de l'importation.");
      throw err;
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
        title="Gestion des étudiants"
        description="Gérez les dossiers, notes et paiements de tous les étudiants"
        breadcrumbs={[{ label: 'Admin' }, { label: 'Étudiants' }]}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => setImportModalOpen(true)} className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
              <Upload size={14} />
              Importer liste
            </button>
            <button className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
              <Download size={14} />
              Exporter
            </button>
            <button onClick={() => setModalOpen(true)} className="btn-gradient text-sm px-4 py-2 rounded-full font-semibold text-white flex items-center gap-1.5">
              <Plus size={14} />
              Ajouter étudiant
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <StatCard key={i} {...s} className={`delay-${i * 75}`} />
        ))}
      </div>

      {/* Table card */}
      <div className="card-premium overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-6 py-4 border-b border-slate-100">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Chercher étudiant, ID…"
            className="w-full sm:w-64"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterFiliere}
              onChange={e => setFilterFiliere(e.target.value)}
              className="input-premium px-3 py-2 text-sm"
            >
              <option value="tous">Toutes filières</option>
              {filieres.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="input-premium px-3 py-2 text-sm"
            >
              <option value="tous">Tous statuts</option>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
              <option value="en_attente">En attente</option>
            </select>
          </div>
          <span className="ml-auto text-xs text-slate-400 flex-shrink-0">{filtered.length} résultat(s)</span>
        </div>

        <DataTable
          data={filtered}
          columns={columns}
          emptyMessage="Aucun étudiant inscrit"
          emptyDescription="Ajoutez un nouvel étudiant pour commencer à piloter la scolarité."
        />
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
            <h3 className="text-xl font-bold text-slate-800 mb-6">Ajouter un étudiant</h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nom complet</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="ex: Yao Kouassi Serge"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Adresse Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ex: serge.yao@gmail.com"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Filière</label>
                  <select
                    value={filiere}
                    onChange={e => setFiliere(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Informatique">Informatique</option>
                    <option value="Mathématiques">Mathématiques</option>
                    <option value="Économie">Économie</option>
                    <option value="Droit">Droit</option>
                    <option value="Physique">Physique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Année</label>
                  <select
                    value={annee}
                    onChange={e => setAnnee(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value={1}>1ère année (Licence 1)</option>
                    <option value={2}>2ème année (Licence 2)</option>
                    <option value={3}>3ème année (Licence 3)</option>
                    <option value={4}>4ème année (Master 1)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Scolarité totale (FCFA)</label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={e => setTotalAmount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Montant versé (FCFA)</label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={e => setPaidAmount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors mt-4"
              >
                <Plus size={16} />
                Inscrire l'étudiant
              </button>
            </form>
          </div>
        </div>
      )}

      {importModalOpen && (
        <ImportModal
          type="student"
          onClose={() => setImportModalOpen(false)}
          onImport={handleImportStudents}
        />
      )}
    </div>
  );
}
