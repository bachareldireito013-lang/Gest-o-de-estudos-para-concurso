import React, { useState, useMemo } from 'react';
import { Contest, StudySessionInfo, StudySessionRecord } from '../types';
import { RefreshCw, PlayCircle, PauseCircle, StopCircle } from 'lucide-react';
import StudySessionModal from './StudySessionModal';

// --- Função para formatar o tempo do cronômetro ---
const formatTimer = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

interface CicloEstudosPageProps {
  contest: Contest | undefined;
  onStartSession: (sessionInfo: StudySessionInfo) => void;
  // --- Props do Cronômetro Global ---
  timer: number;
  isTimerActive: boolean;
  currentSessionInfo: StudySessionInfo | null;
  onPauseTimer: () => void;
  onStartTimer: () => void; // Para o botão de Retomar
  onStopTimer: () => void;
}

export const CicloEstudosPage: React.FC<CicloEstudosPageProps> = ({ 
    contest, 
    onStartSession,
    timer,
    isTimerActive,
    currentSessionInfo,
    onPauseTimer,
    onStartTimer,
    onStopTimer
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const todaysSubject = useMemo(() => {
    if (!contest || !contest.plan?.study_schedule || contest.plan.study_schedule.length === 0) {
      return null;
    }
    const dayOfWeek = new Date().toLocaleString('pt-BR', { weekday: 'long' });
    const capitalizedDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
    
    return contest.plan.study_schedule.find(item => item["Dia da Semana"] === capitalizedDay) || contest.plan.study_schedule[0];
  }, [contest]);

  const handleStartClick = () => {
    if (todaysSubject) {
      setIsModalOpen(true);
    }
  };

  const handleConfirmSession = (topic: string, source: string) => {
    if (todaysSubject) {
      onStartSession({
        subject: todaysSubject["Matéria Sugerida"],
        topic,
        source,
      });
      setIsModalOpen(false);
    }
  };

  if (!contest) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-dark-text mb-4">Ciclo de Estudos</h1>
        <div className="bg-dark-card p-8 rounded-lg border border-dark-border text-center">
          <RefreshCw className="mx-auto h-12 w-12 text-dark-accent mb-4" />
          <p className="text-dark-secondary-text">
            Selecione um concurso ativo na aba "Meus Concursos" para iniciar seu ciclo de estudos.
          </p>
        </div>
      </div>
    );
  }

  // --- Painel de Sessão de Estudo Ativa ---
  if (currentSessionInfo) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-dark-text mb-2">Sessão de Estudo em Andamento</h1>
        <h2 className="text-lg text-dark-accent font-semibold mb-8">{contest.name}</h2>
        
        <div className="bg-dark-card p-8 rounded-lg border border-dark-accent text-center shadow-lg animate-fade-in">
          <p className="text-dark-secondary-text mb-2">Você está estudando:</p>
          <h3 className="text-4xl font-bold text-dark-text mb-2">{currentSessionInfo.subject}</h3>
          <p className="text-lg text-dark-text mb-6">{currentSessionInfo.topic} ({currentSessionInfo.source})</p>
          
          <div className="text-7xl font-mono font-bold text-dark-text my-8 bg-dark-bg py-4 rounded-lg border border-dark-border">
            {formatTimer(timer)}
          </div>

          <div className="flex justify-center items-center gap-4">
            {isTimerActive ? (
              <button
                onClick={onPauseTimer}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-3"
              >
                <PauseCircle size={24} /> Pausar
              </button>
            ) : (
              <button
                onClick={onStartTimer}
                className="bg-success hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-3"
              >
                <PlayCircle size={24} /> Retomar
              </button>
            )}
             <button
              onClick={onStopTimer}
              className="bg-error hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-3"
            >
              <StopCircle size={24} /> Finalizar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Painel para Iniciar Nova Sessão ---
  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text mb-2">Ciclo de Estudos</h1>
      <h2 className="text-lg text-dark-accent font-semibold mb-8">{contest.name}</h2>
      
      <div className="bg-dark-card p-8 rounded-lg border border-dark-border text-center shadow-lg">
        {todaysSubject ? (
          <>
            <p className="text-dark-secondary-text mb-2">Matéria Sugerida para Hoje:</p>
            <h3 className="text-4xl font-bold text-dark-text mb-6">{todaysSubject["Matéria Sugerida"]}</h3>
            <p className="text-dark-secondary-text mb-1">Tópico principal:</p>
            <p className="text-lg text-dark-text mb-8">{todaysSubject["Tópico para Estudo"]}</p>
            
            <button
              onClick={handleStartClick}
              className="bg-dark-accent hover:bg-dark-hover text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-3 mx-auto"
            >
              <PlayCircle size={24} />
              Iniciar Estudo
            </button>
          </>
        ) : (
          <p className="text-dark-secondary-text">Não foi possível determinar a matéria de hoje. Verifique seu plano de estudos.</p>
        )}
      </div>

      {isModalOpen && todaysSubject && (
        <StudySessionModal
          subjectName={todaysSubject["Matéria Sugerida"]}
          topics={contest.plan.subjects[todaysSubject["Matéria Sugerida"]] || [todaysSubject["Tópico para Estudo"]]}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmSession}
        />
      )}
    </div>
  );
};