import React, { useState } from 'react';
import { Contest, ContestProgress, TopicProgress, TopicProgressHistory } from '../types';
import { PenSquare, AlertCircle } from 'lucide-react';

interface ExerciciosPageProps {
  contest: Contest | undefined;
  updateContest: (contestId: string, updatedData: Partial<Omit<Contest, 'id'>>) => void;
}

export const ExerciciosPage: React.FC<ExerciciosPageProps> = ({ contest, updateContest }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [questionsSolved, setQuestionsSolved] = useState<string>('');
  const [questionsCorrect, setQuestionsCorrect] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const subjects = contest ? Object.keys(contest.plan.subjects) : [];
  const topics = selectedSubject ? contest?.plan.subjects[selectedSubject] || [] : [];
  
  // Sincroniza o select de matéria com o primeiro item, se houver
  React.useEffect(() => {
      if(!selectedSubject && subjects.length > 0) {
          setSelectedSubject(subjects[0]);
      }
  }, [subjects, selectedSubject]);

  // Sincroniza o select de tópico
  React.useEffect(() => {
    if (selectedSubject && topics.length > 0) {
      setSelectedTopic(topics[0]);
    } else {
        setSelectedTopic('');
    }
  }, [selectedSubject, topics]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!contest || !selectedSubject || !selectedTopic) {
      setError('Por favor, selecione a matéria e o tópico.');
      return;
    }
    
    const total = parseInt(questionsSolved, 10);
    const correct = parseInt(questionsCorrect, 10);

    if (isNaN(total) || isNaN(correct) || total <= 0 || correct < 0) {
      setError('Por favor, insira valores numéricos válidos para as questões.');
      return;
    }
    if (correct > total) {
      setError('O número de acertos não pode ser maior que o total de questões.');
      return;
    }

    const currentProgress = contest.progress || {};
    const currentSubjectProgress = currentProgress[selectedSubject] || {};
    const currentTopicProgress = currentSubjectProgress[selectedTopic] || { correct: 0, total: 0, history: [] };

    const newHistoryEntry: TopicProgressHistory = {
        date: new Date().toISOString(),
        correct: correct,
        total: total,
    };

    const newTopicProgress: TopicProgress = {
      ...currentTopicProgress,
      correct: (currentTopicProgress.correct || 0) + correct,
      total: (currentTopicProgress.total || 0) + total,
      history: [...(currentTopicProgress.history || []), newHistoryEntry],
    };
    
    const newProgress: ContestProgress = {
        ...currentProgress,
        [selectedSubject]: {
            ...currentSubjectProgress,
            [selectedTopic]: newTopicProgress
        }
    };

    updateContest(contest.id, { progress: newProgress });
    setSuccess(`Progresso em "${selectedTopic}" atualizado com sucesso!`);
    setQuestionsSolved('');
    setQuestionsCorrect('');
  };

  if (!contest) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-dark-text mb-4">Centro de Treinamento</h1>
        <div className="bg-dark-card p-8 rounded-lg border border-dark-border text-center">
          <PenSquare className="mx-auto h-12 w-12 text-dark-accent mb-4" />
          <p className="text-dark-secondary-text">
            Selecione um concurso ativo para registrar suas sessões de exercícios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text mb-2">Centro de Treinamento</h1>
      <h2 className="text-lg text-dark-accent font-semibold mb-8">{contest.name}</h2>

      <div className="bg-dark-card p-8 rounded-lg border border-dark-border max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold text-dark-text mb-6 text-center">Registrar Sessão de Questões</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-dark-secondary-text mb-2">Matéria</label>
            <select id="subject" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-dark-text">
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-dark-secondary-text mb-2">Tópico</label>
            <select id="topic" value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)} disabled={!selectedSubject || topics.length === 0} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-dark-text disabled:bg-gray-700">
              {topics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label htmlFor="solved" className="block text-sm font-medium text-dark-secondary-text mb-2">Questões Resolvidas</label>
                <input id="solved" type="number" value={questionsSolved} onChange={e => setQuestionsSolved(e.target.value)} placeholder="Ex: 50" required className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-dark-text" />
             </div>
             <div>
                <label htmlFor="correct" className="block text-sm font-medium text-dark-secondary-text mb-2">Acertos</label>
                <input id="correct" type="number" value={questionsCorrect} onChange={e => setQuestionsCorrect(e.target.value)} placeholder="Ex: 42" required className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-dark-text" />
             </div>
          </div>
          <div className="text-center pt-4">
              <button type="submit" className="bg-dark-accent hover:bg-dark-hover text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">Registrar Desempenho</button>
          </div>
          {error && <p className="text-error mt-4 text-sm flex items-center justify-center gap-2"><AlertCircle size={16}/> {error}</p>}
          {success && <p className="text-success mt-4 text-sm text-center">{success}</p>}
        </form>
      </div>
    </div>
  );
};