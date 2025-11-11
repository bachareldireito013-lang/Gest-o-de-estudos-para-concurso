import React, { useState, useMemo, Dispatch, SetStateAction } from 'react';
import { Goal, StudySessionRecord } from '../types';
import { Target, Plus, Edit, Trash2, X, Check, Hourglass, PenSquare, BrainCircuit } from 'lucide-react';

interface GoalModalProps {
  goal?: Goal | null;
  onSave: (goal: Omit<Goal, 'id' | 'current' | 'completed'>) => void;
  onClose: () => void;
}

const GoalModal: React.FC<GoalModalProps> = ({ goal, onSave, onClose }) => {
  const [description, setDescription] = useState(goal?.description || '');
  const [type, setType] = useState<'hours' | 'questions' | 'flashcards'>(goal?.type || 'hours');
  const [target, setTarget] = useState(goal?.target || 10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ description, type, target: Number(target) });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-dark-card w-full max-w-lg rounded-lg border border-dark-border p-8 m-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-dark-accent">{goal ? 'Editar Meta' : 'Nova Meta Semanal'}</h2>
            <button type="button" onClick={onClose} className="text-dark-secondary-text hover:text-dark-text"><X /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-dark-secondary-text mb-1">Descrição</label>
              <input id="description" type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Estudar forte para Direito Constitucional" required className="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-dark-text" />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-dark-secondary-text mb-1">Tipo de Meta</label>
              <select id="type" value={type} onChange={e => setType(e.target.value as any)} className="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-dark-text">
                <option value="hours">Horas de Estudo</option>
                <option value="questions">Questões Resolvidas</option>
                <option value="flashcards">Flashcards Revisados</option>
              </select>
            </div>
            <div>
              <label htmlFor="target" className="block text-sm font-medium text-dark-secondary-text mb-1">Alvo</label>
              <input id="target" type="number" min="1" value={target} onChange={e => setTarget(Number(e.target.value))} required className="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-dark-text" />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-dark-secondary-text hover:bg-dark-border">Cancelar</button>
            <button type="submit" className="bg-dark-accent hover:bg-dark-hover px-4 py-2 rounded-lg text-white font-bold">Salvar Meta</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete }) => {
    const progress = Math.min((goal.current / goal.target) * 100, 100);
    const goalIcons = {
        hours: <Hourglass className="text-dark-accent" />,
        questions: <PenSquare className="text-dark-accent" />,
        flashcards: <BrainCircuit className="text-dark-accent" />,
    };

    return (
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                        {goalIcons[goal.type]}
                        <h3 className="text-lg font-semibold text-dark-text">{goal.description}</h3>
                    </div>
                    {goal.completed && <Check className="text-success" />}
                </div>
                <p className="text-3xl font-bold text-dark-text my-3">{goal.current} <span className="text-lg text-dark-secondary-text">/ {goal.target} {goal.type === 'hours' ? 'hrs' : ''}</span></p>
                <div className="w-full bg-dark-border rounded-full h-2.5">
                    <div className="bg-dark-accent h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => onEdit(goal)} className="p-2 text-dark-secondary-text hover:text-dark-accent"><Edit size={16} /></button>
                <button onClick={() => onDelete(goal.id)} className="p-2 text-dark-secondary-text hover:text-error"><Trash2 size={16} /></button>
            </div>
        </div>
    );
};

interface MetasPageProps {
  goals: Goal[];
  setGoals: Dispatch<SetStateAction<Goal[]>>;
  studyHistory: StudySessionRecord[];
}

export const MetasPage: React.FC<MetasPageProps> = ({ goals: initialGoals, setGoals, studyHistory }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const goals = useMemo(() => {
    // Esta lógica seria mais complexa, conectando a outras partes do app.
    // Por enquanto, vamos simular o progresso baseado no histórico.
    const totalHoursStudied = studyHistory.reduce((acc, session) => acc + session.duration, 0) / 3600;

    return initialGoals.map(goal => {
        let current = goal.current;
        if (goal.type === 'hours') {
            current = Math.round(totalHoursStudied);
        }
        // Progresso de 'questions' e 'flashcards' seria atualizado por outras páginas.
        return { ...goal, current, completed: current >= goal.target };
    });
  }, [initialGoals, studyHistory]);

  const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'current' | 'completed'>) => {
    if (editingGoal) {
      setGoals(goals.map(g => g.id === editingGoal.id ? { ...editingGoal, ...goalData } : g));
    } else {
      const newGoal: Goal = {
        id: `goal-${Date.now()}`,
        ...goalData,
        current: 0,
        completed: false,
      };
      setGoals([...goals, newGoal]);
    }
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dark-text flex items-center gap-3">
          <Target className="text-dark-accent" />Metas da Semana
        </h1>
        <button onClick={() => { setEditingGoal(null); setIsModalOpen(true); }} className="bg-dark-accent hover:bg-dark-hover text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
          <Plus size={18} /> Nova Meta
        </button>
      </div>

      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} onEdit={(g) => { setEditingGoal(g); setIsModalOpen(true); }} onDelete={handleDeleteGoal} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-dark-card rounded-lg border border-dark-border">
          <Target className="mx-auto h-16 w-16 text-dark-accent mb-4" />
          <h2 className="text-2xl font-bold text-dark-text mb-2">Defina seu Rumo</h2>
          <p className="text-dark-secondary-text">Crie sua primeira meta para começar a monitorar seu progresso semanal.</p>
        </div>
      )}

      {isModalOpen && <GoalModal goal={editingGoal} onSave={handleSaveGoal} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};
