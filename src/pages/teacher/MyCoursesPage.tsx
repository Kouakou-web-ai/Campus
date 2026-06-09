export default function MyCoursesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mes Cours enseignés</h1>
      <p className="text-base-content/70">Gérez le contenu et les supports de vos matières.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-100 border border-base-300 shadow">
          <div className="card-body">
            <h2 className="card-title font-bold">Algorithmique & Structures de Données</h2>
            <p className="text-xs text-base-content/50">Master 1 Informatique</p>
            <p className="text-sm mt-4 text-base-content/70">Bases d'arbres binaires, graphes et tri complexe.</p>
          </div>
        </div>
        <div className="card bg-base-100 border border-base-300 shadow">
          <div className="card-body">
            <h2 className="card-title font-bold">Architecture Logicielle</h2>
            <p className="text-xs text-base-content/50">Master 2 Génie Logiciel</p>
            <p className="text-sm mt-4 text-base-content/70">Patrons de conception, architecture en couches, microservices.</p>
          </div>
        </div>
      </div>
    </div>
  );
}