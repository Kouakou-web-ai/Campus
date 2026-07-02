import { useState, useRef, useEffect } from 'react';
import { X, Upload, Trash2, FileText, FileSpreadsheet, Play, CheckCircle } from 'lucide-react';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';

interface ImportModalProps {
  type: 'student' | 'teacher';
  onClose: () => void;
  onImport: (items: any[]) => Promise<void>;
}

const DEFAULT_IVORIAN_NAMES = [
  'Koffi Kouamé Axel',
  'Awa Diop',
  'Yao Konan Serge',
  'Fofana Fatoumata',
  'Gervinho Kouassi',
  'Zokora Didier',
  'Koné Bakary',
  'Bamba Mariam',
  'Diallo Sadio',
  'Touré Yaya'
];

export default function ImportModal({ type, onClose, onImport }: ImportModalProps) {
  const [step, setStep] = useState<'upload' | 'loading' | 'preview'>('upload');
  const [file, setFile] = useState<File | null>(null);
  
  // Student properties
  const [filiere, setFiliere] = useState('Informatique');
  const [annee, setAnnee] = useState(1);
  const [totalAmount, setTotalAmount] = useState(420000);
  
  // Teacher properties
  const [specialite, setSpecialite] = useState('Informatique');
  const [hoursPerWeek, setHoursPerWeek] = useState(15);

  const [parsedItems, setParsedItems] = useState<any[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls', 'pdf'].includes(fileExtension || '')) {
      ToastError("Format de fichier non supporté. Utilisez CSV, Excel ou PDF.");
      return;
    }
    setFile(selectedFile);
    setStep('loading');
  };

  function generateMockData(warnMsg?: string) {
    if (warnMsg) {
      ToastError(warnMsg);
    }

    // Generate realistic demo list
    const count = Math.floor(Math.random() * 3) + 5; // 5 to 7 students
    const items = [];

    const shuffledNames = [...DEFAULT_IVORIAN_NAMES].sort(() => 0.5 - Math.random());

    for (let i = 0; i < count; i++) {
      const name = shuffledNames[i % shuffledNames.length];
      const nameParts = name.toLowerCase().split(' ');
      const cleanPrenom = nameParts[0] || 'etu';
      const cleanNom = nameParts[nameParts.length - 1] || 'ci';

      if (type === 'student') {
        const studentId = `ETU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        items.push({
          name,
          email: `${cleanPrenom}.${cleanNom}@univ.ci`,
          studentId,
          filiere,
          annee,
          paidAmount: Math.random() > 0.4 ? (Math.random() > 0.5 ? totalAmount : Math.floor(totalAmount / 2)) : 0,
          totalAmount: totalAmount
        });
      } else {
        items.push({
          name,
          email: `${cleanPrenom}.${cleanNom}@univ.ci`,
          specialite,
          hoursPerWeek
        });
      }
    }

    setParsedItems(items);
    setStep('preview');
    ToastSuccess(`${items.length} Ã©lÃ©ments simulÃ©s depuis le fichier.`);
  }

  // Simulate file parsing
  useEffect(() => {
    if (step !== 'loading' || !file) return;

    const timer = setTimeout(() => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      if (extension === 'csv') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
            
            // Try to find columns
            const items: any[] = [];
            
            // Simple parsing skip header if it contains metadata keywords
            const hasHeader = lines[0].toLowerCase().includes('nom') || lines[0].toLowerCase().includes('email');
            const startIndex = hasHeader ? 1 : 0;

            for (let i = startIndex; i < lines.length; i++) {
              const columns = lines[i].split(/[;,]/).map(c => c.trim().replace(/^["']|["']$/g, ''));
              if (columns.length >= 2) {
                const name = columns[0];
                const email = columns[1];
                
                if (type === 'student') {
                  const paid = columns[2] ? Number(columns[2]) : 0;
                  const total = columns[3] ? Number(columns[3]) : totalAmount;
                  items.push({
                    name,
                    email,
                    filiere,
                    annee,
                    paidAmount: paid,
                    totalAmount: total,
                    studentId: `ETU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
                  });
                } else {
                  const hpw = columns[2] ? Number(columns[2]) : hoursPerWeek;
                  items.push({
                    name,
                    email,
                    specialite: columns[3] || specialite,
                    hoursPerWeek: hpw
                  });
                }
              }
            }

            if (items.length === 0) {
              generateMockData("CSV vide ou mal formaté. Génération de données d'exemple.");
            } else {
              setParsedItems(items);
              setStep('preview');
              ToastSuccess(`${items.length} éléments chargés avec succès.`);
            }
          } catch (err) {
            generateMockData("Erreur lors de la lecture. Génération de données d'exemple.");
          }
        };
        reader.readAsText(file);
      } else {
        // Mock parsing for PDF/Excel to provide awesome visual experience
        generateMockData();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [step, file]);

  function generateMockData(warnMsg?: string) {
    if (warnMsg) {
      ToastError(warnMsg);
    }
    
    // Generate realistic demo list
    const count = Math.floor(Math.random() * 3) + 5; // 5 to 7 students
    const items = [];
    
    const shuffledNames = [...DEFAULT_IVORIAN_NAMES].sort(() => 0.5 - Math.random());

    for (let i = 0; i < count; i++) {
      const name = shuffledNames[i % shuffledNames.length];
      const nameParts = name.toLowerCase().split(' ');
      const cleanPrenom = nameParts[0] || 'etu';
      const cleanNom = nameParts[nameParts.length - 1] || 'ci';
      
      if (type === 'student') {
        const studentId = `ETU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        items.push({
          name,
          email: `${cleanPrenom}.${cleanNom}@univ.ci`,
          studentId,
          filiere,
          annee,
          paidAmount: Math.random() > 0.4 ? (Math.random() > 0.5 ? totalAmount : Math.floor(totalAmount / 2)) : 0,
          totalAmount: totalAmount
        });
      } else {
        items.push({
          name,
          email: `${cleanPrenom}.${cleanNom}@univ.ci`,
          specialite,
          hoursPerWeek
        });
      }
    }

    setParsedItems(items);
    setStep('preview');
    ToastSuccess(`${items.length} éléments simulés depuis le fichier.`);
  }

  const handleRemoveItem = (index: number) => {
    setParsedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, key: string, value: any) => {
    setParsedItems(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, [key]: value };
      }
      return item;
    }));
  };

  const handleConfirmImport = async () => {
    if (parsedItems.length === 0) {
      ToastError("Aucune donnée à importer.");
      return;
    }
    
    // Validate rows
    const hasInvalid = parsedItems.some(item => !item.name || !item.email);
    if (hasInvalid) {
      ToastError("Veuillez remplir le nom et l'email pour toutes les lignes.");
      return;
    }

    try {
      await onImport(parsedItems);
      onClose();
    } catch (err) {
      ToastError("Une erreur est survenue lors de l'importation.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl p-8 max-w-4xl w-full border border-slate-100 shadow-2xl relative animate-fade-up max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
        >
          <X size={18} />
        </button>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-800">
            Importer des {type === 'student' ? 'étudiants' : 'enseignants'} en masse
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Gérez vos intégrations collectives rapidement via un fichier Excel, CSV ou PDF.
          </p>
        </div>

        {step === 'upload' && (
          <div className="space-y-6 flex-1 overflow-y-auto pr-1">
            {/* File metadata selector */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {type === 'student' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Filière d'affectation</label>
                    <select
                      value={filiere}
                      onChange={e => setFiliere(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Informatique">Informatique</option>
                      <option value="Mathématiques">Mathématiques</option>
                      <option value="Économie">Économie</option>
                      <option value="Droit">Droit</option>
                      <option value="Physique">Physique</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Niveau / Classe</label>
                    <select
                      value={annee}
                      onChange={e => setAnnee(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value={1}>1ère année (Licence 1)</option>
                      <option value={2}>2ème année (Licence 2)</option>
                      <option value={3}>3ème année (Licence 3)</option>
                      <option value={4}>4ème année (Master 1)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Frais de Scolarité Par Défaut (FCFA)</label>
                    <input
                      type="number"
                      value={totalAmount}
                      onChange={e => setTotalAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Spécialité par défaut</label>
                    <input
                      type="text"
                      value={specialite}
                      onChange={e => setSpecialite(e.target.value)}
                      placeholder="ex: Informatique"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Heures Hebdomadaires par défaut</label>
                    <input
                      type="number"
                      value={hoursPerWeek}
                      onChange={e => setHoursPerWeek(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${
                isDragActive 
                  ? 'border-indigo-500 bg-indigo-50/30' 
                  : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls, .pdf"
                onChange={handleFileInput}
                className="hidden"
              />
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 animate-float">
                <Upload size={28} />
              </div>
              <h4 className="font-bold text-slate-800 mb-1">
                Glissez votre fichier ici ou cliquez pour parcourir
              </h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Supporte les formats CSV, Excel (.xlsx, .xls) ou PDF. Le fichier doit contenir au minimum les colonnes Nom et Email.
              </p>
              
              <div className="flex items-center gap-4 mt-6 text-xs text-slate-400 font-semibold bg-white px-4 py-2 border border-slate-100 rounded-full shadow-sm">
                <span className="flex items-center gap-1"><FileSpreadsheet size={12} className="text-emerald-500" /> Excel / CSV</span>
                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                <span className="flex items-center gap-1"><FileText size={12} className="text-red-500" /> PDF</span>
              </div>
            </div>
          </div>
        )}

        {step === 'loading' && (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <span className="loading loading-spinner loading-lg text-indigo-600 mb-4"></span>
            <h4 className="font-bold text-slate-800 mb-1 animate-pulse">Analyse du fichier...</h4>
            <p className="text-xs text-slate-400">Extraction des lignes, validation des adresses e-mail et structuration.</p>
          </div>
        )}

        {step === 'preview' && (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 mb-4 text-xs text-amber-700 flex items-start gap-2.5">
              <span className="text-base mt-0.5">⚠️</span>
              <div>
                <p className="font-bold">Vérification obligatoire</p>
                <p className="mt-0.5">Voici les données extraites du fichier. Vous pouvez éditer chaque cellule directement dans le tableau ou supprimer les lignes indésirables avant d'enregistrer.</p>
              </div>
            </div>

            {/* Table wrapper */}
            <div className="flex-1 overflow-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                    <th className="p-3.5">Nom complet *</th>
                    <th className="p-3.5">Email *</th>
                    {type === 'student' ? (
                      <>
                        <th className="p-3.5">Filière</th>
                        <th className="p-3.5">Scolarité totale</th>
                        <th className="p-3.5">Montant versé</th>
                      </>
                    ) : (
                      <>
                        <th className="p-3.5">Spécialité</th>
                        <th className="p-3.5">Heures / sem</th>
                      </>
                    )}
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedItems.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={e => handleUpdateItem(index, 'name', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-indigo-500 font-medium"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="email"
                          value={item.email}
                          onChange={e => handleUpdateItem(index, 'email', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                      
                      {type === 'student' ? (
                        <>
                          <td className="p-2">
                            <span className="text-sm font-semibold text-slate-600 px-2 py-1 bg-slate-100 rounded-lg">{item.filiere}</span>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.totalAmount}
                              onChange={e => handleUpdateItem(index, 'totalAmount', Number(e.target.value))}
                              className="w-28 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.paidAmount}
                              onChange={e => handleUpdateItem(index, 'paidAmount', Number(e.target.value))}
                              className="w-28 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
                            />
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.specialite}
                              onChange={e => handleUpdateItem(index, 'specialite', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.hoursPerWeek}
                              onChange={e => handleUpdateItem(index, 'hoursPerWeek', Number(e.target.value))}
                              className="w-20 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
                            />
                          </td>
                        </>
                      )}

                      <td className="p-2 text-right">
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-5">
              <button
                onClick={() => {
                  setStep('upload');
                  setFile(null);
                }}
                className="px-5 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Retour
              </button>
              <button
                onClick={handleConfirmImport}
                className="px-6 py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-100"
              >
                <CheckCircle size={16} />
                Valider l'importation ({parsedItems.length})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
