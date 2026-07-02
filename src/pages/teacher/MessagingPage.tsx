export default function MessagingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Messagerie Pédagogique</h1>
      <p className="text-base-content/70">Discutez en toute sécurité avec vos étudiants.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[500px] border border-base-300 rounded-2xl bg-base-100 overflow-hidden">
        {/* Liste discussions */}
        <div className="border-r border-base-300 p-4 space-y-3">
          <div className="p-3 bg-base-200 rounded-xl cursor-pointer">
            <p className="font-semibold text-sm">Alice Martin</p>
            <p className="text-xs text-base-content/50 truncate">Bonjour, j'ai une question sur le TP...</p>
          </div>
        </div>
        {/* Zone message */}
        <div className="col-span-2 flex flex-col justify-between p-4 bg-base-50">
          <div>
            <p className="font-bold border-b pb-2">Alice Martin</p>
            <div className="chat chat-start mt-4">
              <div className="chat-bubble bg-base-200 text-base-content text-sm">Bonjour, j'ai une question sur le TP d'Algo. Faut-il rendre en TypeScript ?</div>
            </div>
            <div className="chat chat-end mt-2">
              <div className="chat-bubble chat-bubble-primary text-sm text-white">Bonjour Alice. Oui, le TypeScript est obligatoire.</div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <input type="text" placeholder="Écrire un message..." className="input input-bordered w-full bg-base-100" />
            <button className="btn btn-primary">Envoyer</button>
          </div>
        </div>
      </div>
    </div>
  );
}