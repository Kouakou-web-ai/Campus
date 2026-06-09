import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function LoginPage() {
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleDemoLogin = async (role: UserRole) => {
    await login(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4 font-heading">Connexion</h1>
        <p className="text-slate-500 text-sm mb-8">Choisissez un rôle de démonstration pour accéder à la plateforme.</p>
        
        <div className="flex flex-col gap-3">
          <Button isLoading={loading} onClick={() => handleDemoLogin('SUPER_ADMIN')} className="w-full">
            Super Administrateur
          </Button>
          <Button isLoading={loading} onClick={() => handleDemoLogin('UNIVERSITY_ADMIN')} variant="secondary" className="w-full">
            Admin Université
          </Button>
          <Button isLoading={loading} onClick={() => handleDemoLogin('TEACHER')} variant="accent" className="w-full">
            Enseignant
          </Button>
          <Button isLoading={loading} onClick={() => handleDemoLogin('STUDENT')} variant="outline" className="w-full">
            Étudiant
          </Button>
          <Button isLoading={loading} onClick={() => handleDemoLogin('PARENT')} variant="ghost" className="w-full">
            Parent d'élève
          </Button>
        </div>
      </Card>
    </div>
  );
}