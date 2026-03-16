import { useNavigate } from 'react-router-dom';
import { Bus, Home } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

const NotFound = () => {
  useDocumentTitle('Lost? — Fleetmark 1337');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-page-in">
        <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-6">
          <Bus className="w-10 h-10 text-primary-600" />
        </div>
        <h1 className="text-6xl font-extrabold text-primary-900 mb-3">404</h1>
        <p className="text-xl font-bold text-primary-800 mb-2">Wrong stop?</p>
        <p className="text-slate-400 mb-8">Looks like this stop doesn't exist. Let's get you back on the shuttle.</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all active:scale-[0.97]"
        >
          <Home className="w-4 h-4" />
          Go Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
