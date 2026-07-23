import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Shield, Zap, Users } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="hero-mesh pt-20 pb-32 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-glow opacity-30 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8">
            <span className="flex h-2 w-2 rounded-full bg-primary"></span>
            Plateforme de gestion universitaire modernisée
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight max-w-4xl mb-6">
            La plateforme SaaS de référence pour <span className="text-primary">l'enseignement supérieur</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mb-10">
            Gérez votre université de manière moderne, élégante et efficace. Une interface premium pensée pour les administrateurs, professeurs, et étudiants.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/onboarding">
              <Button size="lg" className="px-8 rounded-full">Commencer l'essai</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="lg" className="px-8 rounded-full bg-white">Voir la démo (Dashboards)</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-slate-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Une architecture robuste</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Pensé pour la performance, la sécurité et la scalabilité.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Ultra Rapide</h3>
              <p className="text-slate-500">Navigation instantanée grâce à une architecture optimisée (Vercel Best Practices).</p>
            </Card>
            <Card className="hover:-translate-y-1">
              <div className="w-12 h-12 bg-success/10 text-success rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Sécurisé & Multi-tenant</h3>
              <p className="text-slate-500">Isolation stricte des données entre universités, authentification forte via Firebase.</p>
            </Card>
            <Card className="hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-500/10 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Expérience Utilisateur</h3>
              <p className="text-slate-500">Interfaces dédiées pour chaque rôle : admin, prof, étudiant, avec un design premium.</p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
