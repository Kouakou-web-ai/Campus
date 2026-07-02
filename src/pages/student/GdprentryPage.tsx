export default function GdprentryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Protection des Données (RGPD)</h1>
      <p className="text-base-content/70">Exportez ou supprimez toutes vos informations personnelles stockées par CAMPUS.</p>

      <div className="card bg-base-100 border border-base-300 shadow max-w-md">
        <div className="card-body">
          <h2 className="card-title font-bold">Exporter mes données</h2>
          <p className="text-sm text-base-content/70">Téléchargez un fichier archive JSON contenant vos devoirs, notes et profil.</p>
          <button className="btn btn-primary w-full mt-4">Demander un export ZIP</button>
        </div>
      </div>
    </div>
  );
}