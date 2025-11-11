import React from 'react';
import { Contest, StudySessionRecord } from '../types';
import { BarChart3, Clock, CheckCircle, Percent, Trophy } from 'lucide-react';

// --- Função para formatar a duração de segundos para HH:MM:SS ---
const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
};

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle?: string;
}
const StatCard: React.FC<StatCardProps> = ({ icon, title, value, subtitle }) => (
    <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
        <div className="flex items-center gap-4">
            <div className="bg-dark-accent/20 p-3 rounded-full">{icon}</div>
            <div>
                <p className="text-sm text-dark-secondary-text">{title}</p>
                <p className="text-2xl font-bold text-dark-text">{value}</p>
                {subtitle && <p className="text-xs text-dark-secondary-text">{subtitle}</p>}
            </div>
        </div>
    </div>
);

interface EstatisticasPageProps {
  contests: Contest[];
  history: StudySessionRecord[];
}

export const EstatisticasPage: React.FC<EstatisticasPageProps> = ({ contests, history }) => {
  const stats = React.useMemo(() => {
    // Stats do Histórico
    const totalStudyTime = history.reduce((acc, session) => acc + session.duration, 0);
    const totalSessions = history.length;
    const avgSessionTime = totalSessions > 0 ? totalStudyTime / totalSessions : 0;

    // Stats de Desempenho (todos os concursos)
    let totalCorrect = 0;
    let totalQuestions = 0;
    const subjectStudyTime: { [subject: string]: number } = {};

    contests.forEach(contest => {
      if (contest.progress) {
        Object.entries(contest.progress).forEach(([subjectName, subjectData]) => {
          Object.values(subjectData).forEach(topic => {
            totalCorrect += topic.correct;
            totalQuestions += topic.total;
          });
        });
      }
    });
    
    history.forEach(session => {
        subjectStudyTime[session.subject] = (subjectStudyTime[session.subject] || 0) + session.duration;
    });

    const overallPercentage = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    
    const mostStudiedSubject = Object.entries(subjectStudyTime).sort((a, b) => b[1] - a[1])[0];

    return {
      totalStudyTime,
      totalSessions,
      avgSessionTime,
      overallPercentage,
      mostStudiedSubject: mostStudiedSubject ? mostStudiedSubject[0] : 'N/A',
      mostStudiedSubjectTime: mostStudiedSubject ? mostStudiedSubject[1] : 0,
    };
  }, [contests, history]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text mb-6 flex items-center gap-3">
        <BarChart3 className="text-dark-accent" />Estatísticas Gerais
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
            icon={<Clock className="text-dark-accent"/>}
            title="Tempo Total de Estudo"
            value={formatDuration(stats.totalStudyTime)}
        />
         <StatCard 
            icon={<Percent className="text-dark-accent"/>}
            title="Aproveitamento Geral"
            value={`${stats.overallPercentage.toFixed(1)}%`}
            subtitle="Em todas as matérias"
        />
        <StatCard 
            icon={<Trophy className="text-dark-accent"/>}
            title="Matéria Mais Estudada"
            value={stats.mostStudiedSubject}
            subtitle={formatDuration(stats.mostStudiedSubjectTime)}
        />
         <StatCard 
            icon={<CheckCircle className="text-dark-accent"/>}
            title="Sessões Concluídas"
            value={stats.totalSessions.toString()}
        />
         <StatCard 
            icon={<Clock className="text-dark-accent"/>}
            title="Duração Média da Sessão"
            value={formatDuration(stats.avgSessionTime)}
        />
      </div>

       {history.length === 0 && contests.length === 0 && (
            <div className="mt-8 text-center py-12 bg-dark-card rounded-lg border border-dark-border">
                <BarChart3 className="mx-auto h-16 w-16 text-dark-accent mb-4" />
                <h2 className="text-2xl font-bold text-dark-text mb-2">Dados insuficientes</h2>
                <p className="text-dark-secondary-text">Estude e registre seu progresso para ver suas estatísticas.</p>
            </div>
       )}

    </div>
  );
};
