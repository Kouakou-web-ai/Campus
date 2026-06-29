import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, Send, CheckCircle, Mic } from 'lucide-react';
import axios from 'axios';
import { db } from '../../../firebase-config';
import { ref, push, set } from 'firebase/database';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';
import { useSpeechToText } from '../../hooks/useSpeechToText';

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
  { icon: Phone, label: 'Téléphone', value: '+225 01 72 64 91 10', href: 'tel:+2250172649110' },
  { icon: MapPin, label: 'Adresse', value: 'Abidjan, Côte d\'Ivoire', href: '#' },
];

const SUBJECTS = [
  'Demande de devis', 'Question tarif', 'Support technique', 'Partenariat', 'Autre',
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, setValue, getValues, trigger, formState: { errors, isSubmitting } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const { isListening, isSupported, startListening, stopListening } = useSpeechToText({
    onResult: (text) => {
      const currentVal = getValues('message') || '';
      const space = currentVal ? ' ' : '';
      setValue('message', currentVal + space + text);
      trigger('message');
    },
  });

  const onSubmit = async (data: ContactForm) => {
    try {
      // 1. Sauvegarder dans Firebase Realtime Database
      const messagesRef = ref(db, 'contact_messages');
      const newMsgRef = push(messagesRef);
      await set(newMsgRef, {
        ...data,
        sentAt: new Date().toISOString(),
        status: 'unread'
      });

      // 2. Envoyer par email avec FormSubmit
      try {
        await axios.post('https://formsubmit.co/ajax/truixk@gmail.com', {
          name: data.nom,
          email: data.email,
          etablissement: data.etablissement,
          sujet: data.sujet,
          message: data.message,
          _subject: `Nouveau message de contact CAMPUS - ${data.sujet}`
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      } catch (emailErr) {
        console.error("Erreur d'envoi email:", emailErr);
      }

      ToastSuccess("Votre message a été envoyé avec succès !");
      setSubmitted(true);
    } catch (err: any) {
      console.error("Erreur lors de la soumission:", err);
      ToastError("Impossible d'envoyer votre message. Veuillez réessayer.");
    }
  };

  return (
    <div className="py-28 w-full max-w-5xl mx-auto px-6 sm:px-8">
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

      <div className="w-full max-w-4xl mx-auto space-y-12">
        {/* Infos de contact en ligne */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {CONTACT_INFO.map(info => {
            const Icon = info.icon;
            return (
              <a
                key={info.label}
                href={info.href}
                className="card-premium p-6 flex flex-col items-center text-center group hover:border-indigo-200 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Icon size={20} className="text-indigo-600" />
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{info.label}</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                  {info.value}
                </span>
              </a>
            );
          })}
        </div>

        {/* Formulaire et horaires */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Horaires et statut */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card-premium p-6">
              <h4 className="text-sm font-bold text-slate-800 mb-4">Horaires du support</h4>
              <div className="space-y-3 text-sm text-slate-500">
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span>Lun–Ven</span>
                  <span className="font-semibold text-slate-700">9h–19h</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span>Samedi</span>
                  <span className="font-semibold text-slate-700">10h–14h</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimanche</span>
                  <span className="font-semibold text-slate-400">Fermé</span>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 rounded-xl border border-emerald-100/50">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-emerald-700 font-bold">En ligne actuellement</span>
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
                <a href="mailto:truixk@gmail.com" className="mt-8 text-sm text-indigo-650 font-medium hover:underline">
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
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-600">Message *</label>
                    {isSupported && (
                      <button
                        type="button"
                        onClick={isListening ? stopListening : startListening}
                        className={`text-xs font-medium px-2 py-1 rounded-lg border flex items-center gap-1.5 transition-all duration-200 ${
                          isListening
                            ? 'bg-red-50 text-red-600 border-red-200 animate-pulse font-semibold'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                      >
                        {isListening ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            <Mic size={12} className="text-red-500" />
                            <span>Écoute en cours...</span>
                          </>
                        ) : (
                          <>
                            <Mic size={12} />
                            <span>Dicter mon message</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
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
