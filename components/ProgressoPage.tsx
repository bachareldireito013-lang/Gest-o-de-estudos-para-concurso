import React from 'react';
import { Contest } from '../types';
import { CheckSquare } from 'lucide-react';

interface ProgressBarProps {
    value: number;
    label: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, label }) => {
    const getBarColor = () => {
        if (value >= 80) return 'bg-success';
        if (value >= 60) return 'bg-yellow-500';
        return 'bg-error';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-base font-medium text-dark-text">{label}</span>
                <span className="text-sm font-medium text-dark-text">{value.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-dark-border rounded-full h-4">
                <div className={`${getBarColor()} h-4 rounded-full text-center text-white text-xs font-bold transition-all duration-500`} style={{ width: `${value}%` }}>
                </div>
            </div>
        </div>
    );
};


interface ProgressoPageProps {
  contest: Contest | undefined;
}

export const ProgressoPage: React.FC<ProgressoPageProps> = ({ contest }) => {

  const progressData = React.useMemo(() => {
    if (!contest || !contest.progress) return { overall: 0, subjects: [] };

    let totalTopics = 0;
    let completedTopics = 0;
    const subjectProgress: { name: string; percentage: number }[] = [];

    for (const subjectName in contest.plan.subjects) {
      const topics = contest.plan.subjects[subjectName];
      const progress = contest.progress[subjectName] || {};
      
      let subjectTotal = 0;
      let subjectCompleted = 0;

      topics.forEach(topic => {
          subjectTotal++;
          const topicProgress = progress[topic];
          if(topicProgress && topicProgress.completed) {
              subjectCompleted++;
          }
      });
      
      totalTopics += subjectTotal;
      completedTopics += subjectCompleted;
      
      const subjectPercentage = subjectTotal > 0 ? (subjectCompleted / subjectTotal) * 100 : 0;
      subjectProgress.push({ name: subjectName, percentage: subjectPercentage });
    }
    
    const overallPercentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
    
    return { overall: overallPercentage, subjects: subjectProgress.sort((a, b) => b.percentage - a.percentage) };

  }, [contest]);

  if (!contest) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-dark-text mb-4">Progresso do Edital</h1>
        <div className="bg-dark-card p-8 rounded-lg border border-dark-border text-center">
          <CheckSquare className="mx-auto h-12 w-12 text-dark-accent mb-4" />
          <p className="text-dark-secondary-text">
            Selecione um concurso ativo para visualizar seu progresso no edital.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text mb-2">Progresso do Edital</h1>
      <h2 className="text-lg text-dark-accent font-semibold mb-8">{contest.name}</h2>
      
      <div className="bg-dark-card p-8 rounded-lg border border-dark-border mb-8">
        <h3 className="text-2xl font-bold text-dark-text mb-4">Progresso Geral</h3>
        <ProgressBar value={progressData.overall} label="Total de Tópicos Concluídos" />
      </div>

      <div className="bg-dark-card p-8 rounded-lg border border-dark-border">
         <h3 className="text-2xl font-bold text-dark-text mb-6">Progresso por Matéria</h3>
         <div className="space-y-6">
            {progressData.subjects.map(subject => (
                <ProgressBar key={subject.name} value={subject.percentage} label={subject.name} />
            ))}
         </div>
      </div>
    </div>
  );
};
