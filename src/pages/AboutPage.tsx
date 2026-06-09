import { Card } from '../components/ui/Card';

export function AboutPage() {
  return (
    <div className="py-20 px-4 max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center font-heading">Notre Mission</h1>
      <p className="text-lg text-slate-600 leading-relaxed mb-8 text-center">
        CAMPUS est né de la volonté de révolutionner la gestion interne des établissements d'enseignement supérieur. En connectant au même endroit étudiants, parents, enseignants et administrateurs, nous brisons les barrières d'information et simplifions l'accès à l'éducation.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <Card>
          <h2 className="text-xl font-semibold mb-2 text-slate-900">Technologie moderne</h2>
          <p className="text-slate-500 text-sm">Une infrastructure solide sur le Cloud, hautement sécurisée et respectant le RGPD.</p>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold mb-2 text-slate-900">Simplicité d'usage</h2>
          <p className="text-slate-500 text-sm">Une interface fluide, claire, conçue en Mobile-First pour être accessible partout.</p>
        </Card>
      </div>
    </div>
  );
}