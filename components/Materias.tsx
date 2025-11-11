import React, { useState, useRef, useEffect } from 'react';
import { Contest, StudyPlan, SubjectProgress, ContestProgress, TopicProgress } from '../types';
import { BookOpenText, X, Wrench, CheckCircle, Clock, BarChart3, Award, AlertTriangle, ShieldCheck, Edit } from 'lucide-react';
import TopicManagerModal from './TopicManagerModal';

const formatStudyTime = (seconds: number = 0): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

// --- Componente de Progresso da Matéria ---
interface SubjectProgressDisplayProps {
  subjectName: string;
  subjectProgress: SubjectProgress;
  topics: string[];
  onManageTopics: () => void;
  onToggleTopicComplete: (topic: string, isCompleted: boolean) => void;
  onUpdateTopic: (oldTopic: string, newTopic: string) => void;
}

const SubjectProgressDisplay: React.FC<SubjectProgressDisplayProps> = ({ subjectName, subjectProgress, topics, onManageTopics, onToggleTopicComplete, onUpdateTopic }) => {
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTopic !== null && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTopic]);

  const calculatePercentage = (correct: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  const handleStartEditing = (topic: string) => {
    setEditingTopic(topic);
    setNewTopicName(topic);
  };
  
  const handleCancelEditing = () => {
    setEditingTopic(null);
    setNewTopicName('');
  };

  const handleSaveTopicName = () => {
    if (editingTopic && newTopicName.trim() && newTopicName.trim() !== editingTopic) {
      onUpdateTopic(editingTopic, newTopicName.trim());
    }
    handleCancelEditing();
  };

  return (
    <div className="mt-8 bg-dark-card rounded-lg border border-dark-accent shadow-lg p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-dark-text">Progresso em <span className="text-dark-accent">{subjectName}</span></h3>
        <button
          onClick={onManageTopics}
          className="flex items-center gap-2 text-dark-secondary-text hover:text-dark-accent transition-colors py-2 px-4 rounded-lg hover:bg-dark-border"
          title="Gerenciar Tópicos"
        >
          <Wrench size={18} />
          Gerenciar Tópicos
        </button>
      </div>
      
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
        {topics.length > 0 ? topics.map(topic => {
          const progress = subjectProgress[topic] || { correct: 0, total: 0, studyTime: 0, completed: false, history: [] };
          const percentage = calculatePercentage(progress.correct, progress.total);
          
          const isDominated = percentage === 100 && progress.total > 0 && !progress.completed;

          const getBarColor = () => {
              if (progress.completed) return 'bg-cyan-500';
              if (isDominated) return 'bg-green-500';
              if (percentage >= 80) return 'bg-green-500';
              if (percentage >= 60) return 'bg-yellow-500';
              return 'bg-red-500';
          };
          
          const displayPercentage = progress.completed || isDominated ? 100 : percentage;
          
          const isEditing = editingTopic === topic;

          return (
            <div key={topic} className="bg-dark-bg p-4 rounded-md border border-dark-border transition-all duration-300 group">
              <div 
                className="cursor-pointer"
                onClick={() => !isEditing && setExpandedTopic(expandedTopic === topic ? null : topic)}
              >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3 flex-grow min-w-0">
                      <input 
                        type="checkbox"
                        className="form-checkbox h-5 w-5 rounded bg-dark-border text-cyan-500 focus:ring-cyan-500 flex-shrink-0"
                        checked={!!progress.completed}
                        onChange={(e) => onToggleTopicComplete(topic, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        title="Marcar como concluído manualmente"
                      />
                      {isEditing ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          value={newTopicName}
                          onChange={(e) => setNewTopicName(e.target.value)}
                          onBlur={handleSaveTopicName}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveTopicName();
                            if (e.key === 'Escape') handleCancelEditing();
                          }}
                          className="w-full bg-dark-bg p-1 rounded border border-dark-accent focus:outline-none text-dark-text font-medium"
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <p className={`text-dark-text font-medium truncate ${progress.completed ? 'line-through text-dark-secondary-text' : ''}`}>{topic}</p>
                      )}
                       {!isEditing && (
                         <button 
                            onClick={(e) => { e.stopPropagation(); handleStartEditing(topic); }} 
                            className="text-dark-secondary-text hover:text-dark-accent opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            title="Editar nome do tópico"
                         >
                            <Edit size={16}/>
                         </button>
                       )}
                    </div>
                    
                    {progress.completed ? (
                       <span className="flex items-center gap-2 text-sm text-cyan-400 font-semibold ml-2 flex-shrink-0">
                           <ShieldCheck size={16} /> Concluído
                       </span>
                    ) : isDominated ? (
                       <span className="flex items-center gap-2 text-sm text-success font-semibold ml-2 flex-shrink-0">
                           <Award size={16} /> Dominado
                       </span>
                    ) : (
                      progress.total > 0 ? (
                        <span className={`font-mono px-2 py-1 rounded text-sm ml-2 flex-shrink-0 ${
                            percentage >= 80 ? 'bg-green-500/20 text-green-300' :
                            percentage >= 60 ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                        }`}>
                          {percentage}%
                        </span>
                      ) : (
                        <span className="text-xs text-dark-secondary-text ml-2 flex-shrink-0">Não iniciado</span>
                      )
                    )}
                  </div>
                  
                  <div className="w-full bg-dark-border rounded-full h-2.5 my-2">
                    <div className={`${getBarColor()} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${displayPercentage}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-dark-secondary-text mt-1">
                     <div className="flex items-center gap-1.5" title="Tempo de estudo registrado">
                        <Clock size={12} />
                        <span>{formatStudyTime(progress.studyTime)}</span>
                    </div>
                    <span>{progress.correct} / {progress.total} questões</span>
                  </div>
              </div>

              {expandedTopic === topic && (
                  <div className="mt-4 pt-4 border-t border-dark-border animate-fade-in">
                      <h4 className="text-sm font-semibold text-dark-secondary-text mb-3 flex items-center gap-2">
                          <BarChart3 size={16} /> Histórico de Desempenho
                      </h4>
                      {progress.history && progress.history.length > 0 ? (
                          <div>
                              <div className="flex items-end justify-center h-24 gap-2 bg-dark-card p-2 rounded-md border border-dark-border">
                                  {progress.history.slice(-10).map((session, index) => {
                                      const sessionPercentage = session.total > 0 ? (session.correct / session.total) * 100 : 0;
                                      return (
                                          <div key={index} className="flex-1 flex flex-col items-center justify-end group relative" title={`${new Date(session.date).toLocaleDateString('pt-BR')}: ${session.correct}/${session.total} (${sessionPercentage.toFixed(0)}%)`}>
                                              <div 
                                                  className="w-full bg-dark-accent rounded-t-sm transition-all duration-300 group-hover:bg-dark-hover"
                                                  style={{ height: `${Math.max(sessionPercentage, 5)}%`}}
                                              ></div>
                                              <div className="absolute bottom-full mb-2 w-max bg-dark-bg text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                  {session.correct}/{session.total} ({sessionPercentage.toFixed(0)}%)
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                              <ul className="text-xs text-dark-secondary-text mt-3 space-y-1 max-h-24 overflow-y-auto pr-2">
                                  {progress.history.slice().reverse().map((session, index) => (
                                      <li key={index} className="flex justify-between p-1 rounded hover:bg-dark-card">
                                          <span>{new Date(session.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                          <span>{session.correct} / {session.total} acertos ({session.total > 0 ? ((session.correct/session.total)*100).toFixed(0) : 0}%)</span>
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      ) : (
                          <p className="text-sm text-dark-secondary-text text-center py-4">Nenhum histórico de exercícios registrado para este tópico.</p>
                      )}
                  </div>
              )}
            </div>
          );
        }) : (
          <p className="text-dark-secondary-text text-center py-4">Nenhum tópico cadastrado. Clique em "Gerenciar Tópicos" para adicionar.</p>
        )}
      </div>
    </div>
  );
};


// --- Página de Matérias ---
interface MateriasPageProps {
  contest: Contest | undefined;
  updateContest: (contestId: string, updatedData: Partial<Omit<Contest, 'id'>>) => void;
}

export const MateriasPage: React.FC<MateriasPageProps> = ({ contest, updateContest }) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);

  React.useEffect(() => {
    if (contest && contest.plan.subjects && selectedSubject && !contest.plan.subjects[selectedSubject]) {
      setSelectedSubject(null);
    }
  }, [contest, selectedSubject]);

  const handleToggleTopicComplete = (topic: string, isCompleted: boolean) => {
    if (!contest || !selectedSubject) return;

    const currentProgress = contest.progress?.[selectedSubject]?.[topic] || { correct: 0, total: 0 };
    
    let newTopicProgress: TopicProgress;

    if (isCompleted) {
      newTopicProgress = { ...currentProgress, completed: true };
    } else {
      newTopicProgress = { ...currentProgress, completed: false };
    }

    const updatedProgress: ContestProgress = {
      ...contest.progress,
      [selectedSubject]: {
        ...contest.progress?.[selectedSubject],
        [topic]: newTopicProgress
      }
    };
    
    updateContest(contest.id, { progress: updatedProgress });
  };
  
  const handleUpdateTopicName = (subject: string, oldTopic: string, newTopic: string) => {
    if (!contest || !newTopic || newTopic === oldTopic) return;
    
    // 1. Atualizar a lista de tópicos no plano
    const subjectTopics = [...(contest.plan.subjects[subject] || [])];
    const topicIndex = subjectTopics.indexOf(oldTopic);
    if (topicIndex === -1) return; // Tópico antigo não encontrado
    subjectTopics[topicIndex] = newTopic;
    
    const updatedSubjects = {
      ...contest.plan.subjects,
      [subject]: subjectTopics,
    };
    
    // 2. Renomear a chave no objeto de progresso
    const updatedProgress = JSON.parse(JSON.stringify(contest.progress || {}));
    if (updatedProgress[subject] && updatedProgress[subject][oldTopic]) {
      updatedProgress[subject][newTopic] = updatedProgress[subject][oldTopic];
      delete updatedProgress[subject][oldTopic];
    }
    
    const newPlan: StudyPlan = {
      ...contest.plan,
      subjects: updatedSubjects,
    };
    
    updateContest(contest.id, { plan: newPlan, progress: updatedProgress });
  };


  const handleSaveTopics = (subject: string, newTopics: string[]) => {
    if (!contest || !contest.plan) return;

    const oldTopics = contest.plan.subjects[subject] || [];
    const oldProgress = contest.progress?.[subject] || {};
    const newProgressForSubject: SubjectProgress = {};

    newTopics.forEach(topic => {
      // Preserve existing progress if topic already exists
      if (oldTopics.includes(topic) && oldProgress[topic]) {
        newProgressForSubject[topic] = oldProgress[topic];
      } else {
        newProgressForSubject[topic] = { correct: 0, total: 0, studyTime: 0, completed: false, history: [] };
      }
    });

    const updatedSubjects = {
      ...contest.plan.subjects,
      [subject]: newTopics,
    };
    
    const updatedProgress = {
      ...contest.progress,
      [subject]: newProgressForSubject,
    };

    const newPlan: StudyPlan = {
      ...contest.plan,
      subjects: updatedSubjects,
    };
    
    updateContest(contest.id, { plan: newPlan, progress: updatedProgress as ContestProgress });
    setEditingSubject(null);
  };

  if (!contest || !contest.plan.subjects) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-dark-text mb-4">Matérias e Progresso</h1>
        <div className="bg-dark-card p-8 rounded-lg border border-dark-border text-center">
          <BookOpenText className="mx-auto h-12 w-12 text-dark-accent mb-4" />
          <p className="text-dark-secondary-text">
            Selecione um concurso ativo na aba "Meus Concursos" para ver as matérias e gerenciar seus tópicos de estudo.
          </p>
        </div>
      </div>
    );
  }

  const subjects = Object.keys(contest.plan.subjects);

  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text mb-2">Matérias e Progresso</h1>
      <h2 className="text-lg text-dark-accent font-semibold mb-8">{contest.name}</h2>
      
      <div className="space-y-4">
        {subjects.map(subject => {
            const isSelected = selectedSubject === subject;
            const subjectProgress = contest.progress?.[subject];
            let totalTopics = 0;
            let completedTopics = 0;
            if (subjectProgress) {
                totalTopics = Object.keys(subjectProgress).length;
                completedTopics = Object.values(subjectProgress).filter((t: TopicProgress) => t.completed || (t.total > 0 && (t.correct/t.total) === 1)).length;
            }
            const overallProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

            return (
              <div key={subject} className="bg-dark-card rounded-lg border border-dark-border overflow-hidden">
                <button 
                  onClick={() => setSelectedSubject(isSelected ? null : subject)}
                  className="w-full text-left p-6 flex justify-between items-center hover:bg-dark-bg transition-colors"
                >
                  <div>
                    <h3 className="text-xl font-semibold text-dark-text">{subject}</h3>
                    <p className="text-sm text-dark-secondary-text">{totalTopics} tópicos</p>
                  </div>
                  <div className="flex items-center gap-4">
                      <div className="w-24">
                          <div className="w-full bg-dark-border rounded-full h-2.5">
                              <div className="bg-dark-accent h-2.5 rounded-full" style={{width: `${overallProgress}%`}}></div>
                          </div>
                      </div>
                      <span className="text-dark-text font-semibold">{Math.round(overallProgress)}%</span>
                  </div>
                </button>
                {isSelected && contest.plan.subjects[subject] && (
                  <div className="p-4 border-t border-dark-border">
                    <SubjectProgressDisplay
                      subjectName={subject}
                      subjectProgress={contest.progress?.[subject] || {}}
                      topics={contest.plan.subjects[subject]}
                      onManageTopics={() => setEditingSubject(subject)}
                      onToggleTopicComplete={handleToggleTopicComplete}
                      onUpdateTopic={(oldTopic, newTopic) => handleUpdateTopicName(subject, oldTopic, newTopic)}
                    />
                  </div>
                )}
              </div>
            )
        })}
      </div>
      
      {editingSubject && (
        <TopicManagerModal
          subjectName={editingSubject}
          initialTopics={contest.plan.subjects[editingSubject] || []}
          onSave={(newTopics) => handleSaveTopics(editingSubject, newTopics)}
          onClose={() => setEditingSubject(null)}
        />
      )}
    </div>
  );
};