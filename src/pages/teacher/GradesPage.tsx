export default function GradesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestion des Notes</h1>
      <p className="text-base-content/70">Attribuez ou modifiez les notes d'examens.</p>

      <div className="card bg-base-100 border border-base-300 shadow max-w-lg">
        <div className="card-body space-y-4">
          <h2 className="card-title font-bold">Attribuer une Note</h2>
          <div className="form-control">
            <label className="label"><span className="label-text">Étudiant</span></label>
            <select className="select select-bordered text-sm">
              <option>Alice Martin</option>
              <option>Bob Dubois</option>
            </select>
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Note (/20)</span></label>
            <input type="number" placeholder="15" className="input input-bordered" min="0" max="20" />
          </div>
          <button className="btn btn-primary w-full">Enregistrer la note</button>
        </div>
      </div>
    </div>
  );
}