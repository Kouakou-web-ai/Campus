import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Alertes & Diffusions" description="Communiquez avec tous les étudiants et professeurs." />
      <Card className="max-w-xl">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Notification envoyée !'); }}>
          <div className="form-control">
            <label className="label"><span className="label-text">Titre de l'alerte</span></label>
            <input type="text" placeholder="Ex: Fermeture campus" className="input input-bordered w-full" />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Message</span></label>
            <textarea placeholder="Contenu du message..." className="textarea textarea-bordered w-full h-24" />
          </div>
          <Button type="submit" className="w-full">Diffuser</Button>
        </form>
      </Card>
    </div>
  );
}