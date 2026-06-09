import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

const contactSchema = z.object({
  nom: z.string().min(2, 'Nom requis (min. 2 caractères)'),
  email: z.string().email('Email invalide'),
  etablissement: z.string().min(2, 'Nom de l\'établissement requis'),
  sujet: z.string().min(1, 'Veuillez choisir un sujet'),
  message: z.string().min(20, 'Message trop court (min. 20 caractères)'),
});

type ContactForm = z.infer<typeof contactSchema>;

const CONTACT_INFO = [
  { icon: Mail, label: 'Email', value: 'truixk@gmail.com', href: 'mailto:truixk@gmail.com' },
  { icon: Phone, label: 'Téléphone', value: '+33 1 42 00 00 00', href: 'tel:+33142000000' },
  { icon: MapPin, label: 'Adresse', value: '15 Rue de l\'Innovation, 75008 Paris', href: '#' },
];

const SUBJECTS = [
  'Demande de démo', 'Question tarif', 'Support technique', 'Partenariat', 'Autre',
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (_data: ContactForm) => {
    await new Promise(r => setTimeout(r, 1000));
    setSubmitted(true);
  };

  return (
    <div className="py-20">
      {/* Header */}
      <div className="text-center mb-16 px-4">
        <span className="inline-block text-indigo-600 font-semibold text-sm mb-3">Contact</span>
        <h1 className="text-5xl font-extrabold text-slate-900 mb-4">
          Parlons de votre <span className="gradient-text">projet</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          Notre équipe vous répond en moins de 24h. Pour les urgences, appelez directement.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Infos contact */}
          <div className="space-y-4">
            <div className="card-premium p-6 bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-0">
              <h3 className="font-bold text-lg mb-1">Support dédié</h3>
              <p className="text-indigo-200 text-sm mb-6">Nos experts répondent en 4h max sur les jours ouvrés.</p>
              <div className="space-y-4">
                {CONTACT_INFO.map(info => {
                  const Icon = info.icon;
                  return (
                    <a key={info.label} href={info.href} className="flex items-start gap-3 group">
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Icon size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-indigo-300">{info.label}</p>
                        <p className="text-sm text-white font-medium group-hover:text-indigo-200 transition-colors">
                          {info.value}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="card-premium p-5">
              <h4 className="text-sm font-semibold text-slate-800 mb-3">Horaires du support</h4>
              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex justify-between">
                  <span>Lun–Ven</span>
                  <span className="font-medium text-slate-700">9h–19h</span>
                </div>
                <div className="flex justify-between">
                  <span>Samedi</span>
                  <span className="font-medium text-slate-700">10h–14h</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimanche</span>
                  <span className="font-medium text-slate-400">Fermé</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-emerald-600 font-medium">Support en ligne actuellement</span>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="card-premium p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Message envoyé !</h3>
                <p className="text-slate-500 text-sm max-w-sm">
                  Merci pour votre message. Notre équipe vous répondra dans les 24h.
                </p>
                <a href="mailto:truixk@gmail.com" className="mt-8 text-sm text-indigo-600 font-medium hover:underline">
                  Envoyer un autre message
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="card-premium p-8 space-y-5">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Envoyez-nous un message</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nom complet *</label>
                    <input
                      {...register('nom')}
                      placeholder="Jean Dupont"
                      className="input-premium w-full px-3 py-2.5 text-sm"
                    />
                    {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email professionnel *</label>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="jean@universite.fr"
                      className="input-premium w-full px-3 py-2.5 text-sm"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Établissement *</label>
                  <input
                    {...register('etablissement')}
                    placeholder="Université de Paris"
                    className="input-premium w-full px-3 py-2.5 text-sm"
                  />
                  {errors.etablissement && <p className="text-red-500 text-xs mt-1">{errors.etablissement.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sujet *</label>
                  <select {...register('sujet')} className="input-premium w-full px-3 py-2.5 text-sm">
                    <option value="">Choisir un sujet</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.sujet && <p className="text-red-500 text-xs mt-1">{errors.sujet.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Message *</label>
                  <textarea
                    {...register('message')}
                    rows={5}
                    placeholder="Décrivez votre projet ou votre question…"
                    className="input-premium w-full px-3 py-2.5 text-sm resize-none"
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-gradient w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      Envoi en cours…
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Envoyer le message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
