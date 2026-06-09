import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6 font-heading">Créer un compte établissement</h1>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Formulaire validé. Étape suivante : Onboarding.'); }}>
          <div className="form-control">
            <label className="label"><span className="label-text">Nom de l'Université</span></label>
            <input type="text" placeholder="Ex: Université de Paris" className="input input-bordered w-full" required />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Email Administratif</span></label>
            <input type="email" placeholder="admin@univ-paris.fr" className="input input-bordered w-full" required />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Mot de passe</span></label>
            <input type="password" placeholder="••••••••" className="input input-bordered w-full" required />
          </div>
          <Button type="submit" className="w-full mt-4">S'enregistrer</Button>
        </form>
        <div className="divider text-xs text-slate-400 my-6">OU</div>
        <Link to="/login"><Button variant="outline" className="w-full">Se connecter à un compte existant</Button></Link>
      </Card>
    </div>
  );
}