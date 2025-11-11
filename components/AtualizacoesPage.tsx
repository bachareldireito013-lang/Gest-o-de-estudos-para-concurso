import React, { useState } from 'react';
import { Contest } from '../types';
import { Bell, AlertCircle, RefreshCw, Loader } from 'lucide-react';

interface AtualizacoesPageProps {
  contest: Contest | undefined;
  onFetchUpdates: () => Promise<void>;
}

export const AtualizacoesPage: React.FC<AtualizacoesPageProps> = ({ contest, onFetchUpdates }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onFetchUpdates();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao buscar atualizações.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!contest) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-dark-text mb-4">Atualizações Relevantes</h1>
        <div className="bg-dark-card p-8 rounded-lg border border-dark-border text-center">
          <Bell className="mx-auto h-12 w-12 text-dark-accent mb-4" />
          <p className="text-dark-secondary-text">
            Selecione um concurso ativo para ver as últimas atualizações.
          </p>
        </div>
      </div>
    );
  }

  const { latest_updates } = contest.plan;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold text-dark-text flex items-center gap-3">
              <Bell className="text-dark-accent" />Últimas Atualizações
            </h1>
            <h2 className="text-lg text-dark-accent font-semibold">{contest.name}</h2>
        </div>
        <button 
            onClick={handleFetch} 
            disabled={isLoading}
            className="bg-dark-accent hover:bg-dark-hover text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:bg-gray-500"
        >
          {isLoading ? <Loader className="animate-spin" size={20}/> : <RefreshCw size={20}/>}
          {isLoading ? 'Buscando...' : 'Buscar Novas Atualizações'}
        </button>
      </div>

      {error && <p className="text-error mb-4 text-sm flex items-center gap-2"><AlertCircle size={16}/> {error}</p>}

      <div className="space-y-4">
        {latest_updates && latest_updates.length > 0 ? (
          latest_updates.map((item, index) => (
            <div key={index} className="bg-dark-card p-6 rounded-lg border border-dark-border">
              <p className="text-dark-text text-lg">{item.update}</p>
              <p className="text-sm text-dark-secondary-text mt-3">Fonte: <a href={item.source} target="_blank" rel="noopener noreferrer" className="hover:underline">{item.source}</a></p>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-dark-card rounded-lg border border-dark-border">
             <Bell className="mx-auto h-16 w-16 text-dark-accent mb-4" />
             <h2 className="text-2xl font-bold text-dark-text mb-2">Nenhuma atualização encontrada</h2>
             <p className="text-dark-secondary-text">Clique em "Buscar Novas Atualizações" para que a IA procure as novidades.</p>
          </div>
        )}
      </div>
    </div>
  );
};
