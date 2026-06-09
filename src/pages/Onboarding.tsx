import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Building2, Settings, UserCheck } from 'lucide-react';

export function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <h2 className="text-center text-3xl font-extrabold text-slate-900 font-heading">
          Configuration de votre espace
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Plus que quelques étapes avant d'utiliser Campus.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <ul className="steps w-full mb-8">
          <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>Université</li>
          <li className={`step ${step >= 2 ? 'step-primary' : ''}`}>Configuration</li>
          <li className={`step ${step >= 3 ? 'step-primary' : ''}`}>Terminé</li>
        </ul>

        <Card className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Building2 className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-center mb-6">Informations de l'établissement</h3>
              <div className="form-control w-full">
                <label className="label"><span className="label-text font-medium text-slate-700">Nom de l'université</span></label>
                <input type="text" placeholder="Ex: Université de Paris" className="input input-bordered w-full focus:input-primary" />
              </div>
              <div className="form-control w-full">
                <label className="label"><span className="label-text font-medium text-slate-700">Sous-domaine souhaité</span></label>
                <div className="flex">
                  <input type="text" placeholder="paris" className="input input-bordered w-full focus:input-primary rounded-r-none" />
                  <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-slate-300 bg-slate-100 text-slate-500 font-medium">
                    .campus.com
                  </span>
                </div>
              </div>
              <Button className="w-full mt-8" size="lg" onClick={() => setStep(2)}>Continuer</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Settings className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-center mb-6">Préférences système</h3>
              <div className="form-control w-full">
                <label className="label"><span className="label-text font-medium text-slate-700">Devise principale</span></label>
                <select className="select select-bordered focus:select-primary" disabled value="FCFA (F CFA)">
                  <option value="FCFA (F CFA)">FCFA (F CFA)</option>
                </select>
              </div>
              <div className="form-control w-full">
                <label className="label"><span className="label-text font-medium text-slate-700">Système de notation</span></label>
                <select className="select select-bordered focus:select-primary">
                  <option>Sur 20 (Système Français)</option>
                  <option>Lettres (A-F, Système US)</option>
                  <option>Sur 100</option>
                </select>
              </div>
              <div className="flex gap-4 mt-8">
                <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>Retour</Button>
                <Button size="lg" className="flex-1" onClick={() => setStep(3)}>Terminer</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center text-success">
                  <UserCheck className="w-10 h-10" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Tout est prêt !</h3>
              <p className="text-slate-500 mb-8">Votre espace université a été créé avec succès. L'architecture backend a été provisionnée pour vous.</p>
              <Button className="w-full" size="lg" onClick={() => navigate('/dashboard')}>
                Accéder au Dashboard
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
