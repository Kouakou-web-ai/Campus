import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Download, Upload, Mail, Users, CheckCircle, UserPlus, Award, X, Trash2, Copy } from 'lucide-react';
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
  const { students, addStudent, deleteStudent, updateStudent, loading, currentUniversity, classes } = useRealtimeDataStore();

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
        <div className="flex items-center gap-1.5 justify-end">
          <button
            onClick={() => handleOpenEditModal(row)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-all"
          >
            Modifier / Affecter
          </button>
          <a href={`mailto:${row.email}`} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-block" title="Envoyer email">
            <Mail size={14} />
          </a>
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

  const location = useLocation();
  const [search, setSearch] = useState(location.state?.search || '');
  const [filterFiliere, setFilterFiliere] = useState('tous');

  useEffect(() => {
    if (location.state?.search) {
      setSearch(location.state.search);
    }
  }, [location.state?.search]);
  const [filterStatus, setFilterStatus] = useState('tous');
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState<{studentId: string; tempStudentPassword: string; tempParentPassword: string; studentEmail: string; parentEmail: string; studentName: string; parentName: string} | null>(null);

  // Form states for new student
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [lieuNaissance, setLieuNaissance] = useState('');
  const [sexe, setSexe] = useState<'M' | 'F'>('M');
  const [classeId, setClasseId] = useState('');
  const [email, setEmail] = useState('');
  const [totalAmount, setTotalAmount] = useState(420000);
  const [paidAmount, setPaidAmount] = useState(0);
  const [matricule, setMatricule] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentName, setParentName] = useState('');

  // Auto-initialize class selections
  useEffect(() => {
    if (classes.length > 0 && !classeId) {
      setClasseId(classes[0].id);
    }
  }, [classes, classeId]);

  // Edit modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editNom, setEditNom] = useState('');
  const [editPrenom, setEditPrenom] = useState('');
  const [editDateNaissance, setEditDateNaissance] = useState('');
  const [editLieuNaissance, setEditLieuNaissance] = useState('');
  const [editSexe, setEditSexe] = useState<'M' | 'F'>('M');
  const [editClasseId, setEditClasseId] = useState('');

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setEditNom(student.nom || '');
    setEditPrenom(student.prenom || '');
    setEditDateNaissance(student.dateNaissance || '');
    setEditLieuNaissance(student.lieuNaissance || '');
    setEditSexe(student.sexe || 'M');
    setEditClasseId(student.classeId || '');
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !user?.universityId) return;

    const selectedClass = classes.find(c => c.id === editClasseId);
    const studentFiliere = selectedClass ? selectedClass.filiere : editingStudent.filiere;
    const studentAnnee = selectedClass ? selectedClass.annee : editingStudent.annee;

    try {
      await updateStudent(user.universityId, editingStudent.id, {
        nom: editNom.trim(),
        prenom: editPrenom.trim(),
        name: `${editPrenom.trim()} ${editNom.trim()}`,
        dateNaissance: editDateNaissance,
        lieuNaissance: editLieuNaissance,
        sexe: editSexe,
        classeId: editClasseId,
        filiere: studentFiliere,
        annee: studentAnnee
      });
      ToastSuccess("Profil de l'étudiant mis à jour avec succès.");
      setEditModalOpen(false);
      setEditingStudent(null);
    } catch (err) {
      ToastError("Impossible de mettre à jour le profil de l'étudiant.");
    }
  };

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
    if (!nom || !prenom || !email || !parentEmail || !parentName) {
      ToastError("Veuillez remplir tous les champs obligatoires (nom, prénoms, email étudiant, email parent, nom parent).");
      return;
    }

    const plan = currentUniversity?.plan || 'pro';
    const limit = plan === 'starter' ? 500 : plan === 'pro' ? 5000 : Infinity;
    if (students.length >= limit) {
      ToastError(`Limite d'étudiants atteinte. Votre abonnement ${plan === 'starter' ? 'Starter' : 'Pro'} est limité à ${limit} étudiants. Veuillez passer à un forfait supérieur.`);
      return;
    }

    const fullName = `${prenom.trim()} ${nom.trim()}`;
    const selectedClass = classes.find(c => c.id === classeId);
    const studentFiliere = selectedClass ? selectedClass.filiere : 'Informatique';
    const studentAnnee = selectedClass ? selectedClass.annee : 1;

    try {
      const creds = await addStudent(user.universityId, {
        name: fullName,
        nom: nom.trim(),
        prenom: prenom.trim(),
        dateNaissance,
        lieuNaissance,
        sexe,
        classeId,
        email,
        studentId: matricule ? matricule.trim() : undefined,
        filiere: studentFiliere,
        annee: studentAnnee,
        status: 'actif',
        average: 0,
        absences: 0,
        paidAmount: Number(paidAmount),
        totalAmount: Number(totalAmount),
        parentEmail: parentEmail.trim(),
        parentName: parentName.trim()
      });
      ToastSuccess("Étudiant et compte Parent créés avec succès !");
      setGeneratedCreds({
        ...creds,
        studentEmail: email,
        parentEmail: parentEmail.trim(),
        studentName: fullName,
        parentName: parentName.trim()
      });
      setNom('');
      setPrenom('');
      setDateNaissance('');
      setLieuNaissance('');
      setSexe('M');
      setEmail('');
      setMatricule('');
      setParentEmail('');
      setParentName('');
      setPaidAmount(0);
      setModalOpen(false);
    } catch (err: any) {
      ToastError(err.message || "Erreur lors de l'ajout.");
    }
  };

  const handleImportStudents = async (items: any[]) => {
    if (!user?.universityId) return;

    const plan = currentUniversity?.plan || 'pro';
    const limit = plan === 'starter' ? 500 : plan === 'pro' ? 5000 : Infinity;
    if (students.length + items.length > limit) {
      ToastError(`Importation impossible. La liste dépasse la limite de votre forfait (${limit} étudiants maximum).`);
      return;
    }

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
          totalAmount: Number(item.totalAmount || 420000),
          parentEmail: item.parentEmail || `parent.${item.email}`,
          parentName: item.parentName || `Parent de ${item.name}`
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-6">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 shadow-2xl relative animate-fade-up">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold text-slate-800 mb-6">Ajouter un étudiant</h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nom</label>
                  <input
                    type="text"
                    value={nom}
                    onChange={e => setNom(e.target.value)}
                    placeholder="ex: Yao"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Prénom(s)</label>
                  <input
                    type="text"
                    value={prenom}
                    onChange={e => setPrenom(e.target.value)}
                    placeholder="ex: Kouassi Serge"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date de naissance</label>
                  <input
                    type="date"
                    value={dateNaissance}
                    onChange={e => setDateNaissance(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Lieu de naissance</label>
                  <input
                    type="text"
                    value={lieuNaissance}
                    onChange={e => setLieuNaissance(e.target.value)}
                    placeholder="ex: Abidjan"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sexe</label>
                  <select
                    value={sexe}
                    onChange={e => setSexe(e.target.value as 'M' | 'F')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Classe</label>
                  <select
                    value={classeId}
                    onChange={e => setClasseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Matricule (Optionnel)</label>
                  <input
                    type="text"
                    value={matricule}
                    onChange={e => setMatricule(e.target.value)}
                    placeholder="ex: ETU-2026-9999"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Scolarité totale (FCFA)</label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={e => setTotalAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Montant versé (FCFA)</label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={e => setPaidAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <h4 className="text-xs font-bold text-indigo-600 mb-2 uppercase tracking-wider">Informations Parent</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nom du parent</label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={e => setParentName(e.target.value)}
                      placeholder="ex: Yao Kouassi Roger"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">E-mail du parent</label>
                    <input
                      type="email"
                      value={parentEmail}
                      onChange={e => setParentEmail(e.target.value)}
                      placeholder="ex: roger.yao@gmail.com"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
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

      {/* Credentials Modal */}
      {generatedCreds && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-6">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-100 shadow-2xl relative animate-fade-up">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-6 mx-auto">
              <CheckCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Comptes créés avec succès</h3>
            <p className="text-center text-slate-500 text-sm mb-6">
              Les identifiants temporaires ont été générés. Ils expireront dans 7 jours. Veuillez les transmettre.
            </p>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <UserPlus size={16} className="text-indigo-600" /> Accès Étudiant
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center"><span className="text-slate-500">Nom :</span><span className="font-medium text-slate-800">{generatedCreds.studentName}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500">Matricule :</span><span className="font-mono font-medium text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">{generatedCreds.studentId}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500">Email :</span><span className="font-medium text-slate-800">{generatedCreds.studentEmail}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500">Mot de passe provisoire :</span><span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{generatedCreds.tempStudentPassword}</span></div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <Users size={16} className="text-amber-600" /> Accès Parent
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center"><span className="text-slate-500">Nom :</span><span className="font-medium text-slate-800">{generatedCreds.parentName}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500">Email :</span><span className="font-medium text-slate-800">{generatedCreds.parentEmail}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500">Mot de passe provisoire :</span><span className="font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{generatedCreds.tempParentPassword}</span></div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  const text = `Accès Étudiant\nNom : ${generatedCreds.studentName}\nMatricule : ${generatedCreds.studentId}\nEmail : ${generatedCreds.studentEmail}\nMot de passe provisoire : ${generatedCreds.tempStudentPassword}\n\nAccès Parent\nNom : ${generatedCreds.parentName}\nEmail : ${generatedCreds.parentEmail}\nMot de passe provisoire : ${generatedCreds.tempParentPassword}`;
                  
                  const fallbackCopyTextToClipboard = (text: string) => {
                    const textArea = document.createElement("textarea");
                    textArea.value = text;
                    textArea.style.top = "0";
                    textArea.style.left = "0";
                    textArea.style.position = "fixed";
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    try {
                      const successful = document.execCommand('copy');
                      if (successful) ToastSuccess("Identifiants copiés dans le presse-papier");
                      else ToastError("Échec de la copie");
                    } catch (err) {
                      ToastError("Échec de la copie");
                    }
                    document.body.removeChild(textArea);
                  };

                  if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(text).then(() => {
                      ToastSuccess("Identifiants copiés dans le presse-papier");
                    }).catch(() => {
                      fallbackCopyTextToClipboard(text);
                    });
                  } else {
                    fallbackCopyTextToClipboard(text);
                  }
                }}
                className="w-full py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Copy size={16} /> Copier les identifiants
              </button>
              <button
                onClick={() => setGeneratedCreds(null)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Student Modal */}
      {editModalOpen && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-6">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-100 shadow-2xl relative animate-fade-up">
            <button
              onClick={() => {
                setEditModalOpen(false);
                setEditingStudent(null);
              }}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold text-slate-800 mb-6">Modifier / Affecter Étudiant</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nom</label>
                  <input
                    type="text"
                    value={editNom}
                    onChange={e => setEditNom(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Prénom(s)</label>
                  <input
                    type="text"
                    value={editPrenom}
                    onChange={e => setEditPrenom(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date de naissance</label>
                  <input
                    type="date"
                    value={editDateNaissance}
                    onChange={e => setEditDateNaissance(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Lieu de naissance</label>
                  <input
                    type="text"
                    value={editLieuNaissance}
                    onChange={e => setEditLieuNaissance(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Sexe</label>
                  <select
                    value={editSexe}
                    onChange={e => setEditSexe(e.target.value as 'M' | 'F')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Affecter Classe</label>
                  <select
                    value={editClasseId}
                    onChange={e => setEditClasseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Sélectionner une classe…</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors mt-6"
              >
                Sauvegarder les modifications
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
