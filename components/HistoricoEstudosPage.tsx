import React from 'react';
import { StudySessionRecord } from '../types';
import { History, Clock, BookOpen, Target, Database } from 'lucide-react';

interface HistoricoEstudosPageProps {
  history: StudySessionRecord[];
}

// --- Função para formatar a duração de segundos para HH:MM:SS ---
const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

// --- Função para formatar a data ISO para um formato legível ---
const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const HistoricoEstudosPage: React.FC<HistoricoEstudosPageProps> = ({ history }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text mb-6 flex items-center gap-3">
        <History className="text-dark-accent" />
        Histórico de Estudos
      </h1>

      {history.length > 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-lg shadow-lg overflow-hidden">
          <ul className="divide-y divide-dark-border">
            {history.map((session) => (
              <li key={session.id} className="p-6 hover:bg-dark-bg transition-colors duration-200">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div className="flex-1 mb-4 md:mb-0">
                    <p className="text-sm text-dark-secondary-text mb-2">{formatDate(session.completedAt)}</p>
                    <h2 className="text-xl font-semibold text-dark-text">{session.subject}</h2>
                    <div className="flex items-center gap-2 mt-1 text-dark-secondary-text">
                        <Target size={14} />
                        <p>{session.topic}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                     <div className="flex items-center gap-2 text-dark-text" title="Fonte do Estudo">
                        <BookOpen size={18} className="text-dark-accent" />
                        <span className="font-medium">{session.source}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-mono text-dark-text">{formatDuration(session.duration)}</p>
                      <p className="text-xs text-dark-secondary-text">Duração</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-dark-card p-12 rounded-lg border border-dark-border text-center">
          <Database className="mx-auto h-16 w-16 text-dark-accent mb-4" />
          <h2 className="text-2xl font-bold text-dark-text mb-2">Nenhuma sessão registrada</h2>
          <p className="text-dark-secondary-text max-w-md mx-auto">
            Seu histórico está vazio. Inicie e finalize uma sessão de estudos no "Ciclo de Estudos" para que ela apareça aqui.
          </p>
        </div>
      )}
    </div>
  );
};
