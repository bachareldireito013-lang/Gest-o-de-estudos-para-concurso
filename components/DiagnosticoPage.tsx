import React from 'react';
import { Contest } from '../types';
import { PieChart, TrendingUp, TrendingDown, Award, AlertTriangle } from 'lucide-react';

interface PerformanceItem {
  name: string;
  percentage: number;
}

interface DiagnosticoPageProps {
  contest: Contest | undefined;
}

export const DiagnosticoPage: React.FC<DiagnosticoPageProps> = ({ contest }) => {

  const diagnosticData = React.useMemo(() => {
    if (!contest || !contest.progress) return null;

    const allTopics: (PerformanceItem & { subject: string })[] = [];
    const subjectPerformances: PerformanceItem[] = [];

    for (const subjectName in contest.progress) {
      const subjectProgress = contest.progress[subjectName];
      let totalCorrect = 0;
      let totalQuestions = 0;

      for (const topicName in subjectProgress) {
        const topic = subjectProgress[topicName];
        if (topic.total > 0) {
            const percentage = (topic.correct / topic.total) * 100;
            allTopics.push({ name: topicName, percentage, subject: subjectName });
            totalCorrect += topic.correct;
            totalQuestions += topic.total;
        }
      }
      
      if(totalQuestions > 0) {
          const subjectPercentage = (totalCorrect / totalQuestions) * 100;
          subjectPerformances.push({ name: subjectName, percentage: subjectPercentage });
      }
    }
    
    allTopics.sort((a, b) => b.percentage - a.percentage);
    subjectPerformances.sort((a, b) => b.percentage - a.percentage);
    
    const bestSubjects = subjectPerformances.slice(0, 3);
    const worstSubjects = subjectPerformances.slice(-3).reverse();
    const bestTopics = allTopics.slice(0, 5);
    const worstTopics = allTopics.filter(t => t.percentage < 100).slice(-5).reverse();

    return { bestSubjects, worstSubjects, bestTopics, worstTopics };

  }, [contest]);

  if (!contest) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-dark-text mb-4">Diagnóstico de Desempenho</h1>
        <div className="bg-dark-card p-8 rounded-lg border border-dark-border text-center">
          <PieChart className="mx-auto h-12 w-12 text-dark-accent mb-4" />
          <p className="text-dark-secondary-text">
            Selecione um concurso ativo e registre seu desempenho em exercícios para gerar um diagnóstico.
          </p>
        </div>
      </div>
    );
  }
  
  if (!diagnosticData) {
     return (
        <div>
            <h1 className="text-3xl font-bold text-dark-text mb-4">Diagnóstico de Desempenho</h1>
            <div className="bg-dark-card p-8 rounded-lg border border-dark-border text-center">
                <PieChart className="mx-auto h-12 w-12 text-dark-accent mb-4" />
                <p className="text-dark-secondary-text">
                    Nenhum dado de desempenho encontrado para este concurso. Registre algumas sessões de exercícios para começar.
                </p>
            </div>
        </div>
    );
  }

  const { bestSubjects, worstSubjects, bestTopics, worstTopics } = diagnosticData;

  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text mb-2">Diagnóstico de Desempenho</h1>
      <h2 className="text-lg text-dark-accent font-semibold mb-8">{contest.name}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pontos Fortes */}
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
            <h3 className="text-2xl font-bold text-success mb-4 flex items-center gap-3"><TrendingUp />Pontos Fortes</h3>
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-lg text-dark-text mb-2 flex items-center gap-2"><Award size={20} />Melhores Matérias</h4>
                    {bestSubjects.map(s => <PerformanceListItem key={s.name} item={s} />)}
                </div>
                 <div>
                    <h4 className="font-semibold text-lg text-dark-text mb-2 flex items-center gap-2"><Award size={20} />Melhores Tópicos</h4>
                    {bestTopics.map(t => <PerformanceListItem key={t.name} item={t} />)}
                </div>
            </div>
        </div>
        {/* Pontos a Melhorar */}
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
            <h3 className="text-2xl font-bold text-error mb-4 flex items-center gap-3"><TrendingDown />Pontos a Melhorar</h3>
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-lg text-dark-text mb-2 flex items-center gap-2"><AlertTriangle size={20} />Matérias de Atenção</h4>
                    {worstSubjects.map(s => <PerformanceListItem key={s.name} item={s} />)}
                </div>
                 <div>
                    <h4 className="font-semibold text-lg text-dark-text mb-2 flex items-center gap-2"><AlertTriangle size={20} />Tópicos de Atenção</h4>
                    {worstTopics.map(t => <PerformanceListItem key={t.name} item={t} />)}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};


const PerformanceListItem: React.FC<{ item: PerformanceItem }> = ({ item }) => (
    <div className="flex justify-between items-center bg-dark-bg p-3 rounded-md">
        <span className="text-dark-text">{item.name}</span>
        <span className={`font-mono px-2 py-1 rounded text-sm ${
            item.percentage >= 80 ? 'bg-green-500/20 text-green-300' :
            item.percentage >= 60 ? 'bg-yellow-500/20 text-yellow-300' :
            'bg-red-500/20 text-red-300'
        }`}>
            {item.percentage.toFixed(1)}%
        </span>
    </div>
);
