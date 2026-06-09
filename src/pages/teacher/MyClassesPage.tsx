export default function MyClassesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mes Classes & Groupes</h1>
      <p className="text-base-content/70">Liste des étudiants sous votre supervision académique.</p>

      <div className="overflow-x-auto bg-base-100 border border-base-300 rounded-2xl shadow">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Classe / TD</th>
              <th>Effectif</th>
              <th>Matière Principale</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-semibold">Master 1 Informatique - TD A</td>
              <td>28 étudiants</td>
              <td>Algorithmique</td>
            </tr>
            <tr>
              <td className="font-semibold">Master 2 Génie Logiciel</td>
              <td>15 étudiants</td>
              <td>Architecture Logicielle</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}