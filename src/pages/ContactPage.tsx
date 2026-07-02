import { useForm } from 'react-hook-form';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function ContactPage() {
  const { register, handleSubmit } = useForm();
  
  const onSubmit = (data: any) => {
    alert('Message simulé envoyé avec succès : ' + JSON.stringify(data));
  };

  return (
    <div className="py-20 px-4 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
      <div>
        <h1 className="text-4xl font-bold mb-6 font-heading">Contactez-nous</h1>
        <p className="text-slate-500 mb-10">Des questions ? Notre équipe commerciale et support est à votre écoute.</p>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="btn btn-circle btn-primary btn-outline"><Mail /></div>
            <div>
              <p className="font-semibold text-sm">Email</p>
              <p className="text-slate-500 text-sm">truixk@gmail.com</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="btn btn-circle btn-primary btn-outline"><Phone /></div>
            <div>
              <p className="font-semibold text-sm">Téléphone</p>
              <p className="text-slate-500 text-sm">+33 (0)1 23 45 67 89</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="btn btn-circle btn-primary btn-outline"><MapPin /></div>
            <div>
              <p className="font-semibold text-sm">Bureau</p>
              <p className="text-slate-500 text-sm">12 Avenue des Champs-Élysées, Paris</p>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Nom</span></label>
            <input type="text" {...register('name', { required: true })} className="input input-bordered w-full" />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Email</span></label>
            <input type="email" {...register('email', { required: true })} className="input input-bordered w-full" />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Message</span></label>
            <textarea {...register('message', { required: true })} className="textarea textarea-bordered h-32 w-full" />
          </div>
          <Button type="submit" className="w-full shadow-lg">Envoyer le message</Button>
        </form>
      </Card>
    </div>
  );
}