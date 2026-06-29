import { Outlet } from 'react-router-dom';
import ParticlesBackground from '../components/ui/ParticlesBackground';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-app transition-colors duration-200 p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Animated background blobs for mesh gradient */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[130px] bg-indigo-600/10 dark:bg-indigo-600/5 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[130px] bg-violet-600/10 dark:bg-violet-600/5 pointer-events-none" />

      {/* Constellations background */}
      <ParticlesBackground count={30} color="99, 102, 241" className="opacity-20 pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <Outlet />
      </div>
    </div>
  );
}
