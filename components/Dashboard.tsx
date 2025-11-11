import React from 'react';
import { Contest, Page } from '../types';
import { PlusCircle, CalendarDays, BookOpenText, CheckSquare } from 'lucide-react';
import WelcomeGuide from './WelcomeGuide';

interface DashboardProps {
  contests: Contest[];
  onNavigate: (page: Page) => void;
}

const ContestCard: React.FC<{ contest: Contest, onNavigate: (page: Page) => void }> = ({ contest, onNavigate }) => (
    <div className="bg-dark-card p-6 rounded-lg border border-dark-border hover:border-dark-accent hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between shadow-lg">
        <div>
            <h3 className="font-bold text-xl mb-2 text-dark-text">{contest.name}</h3>
            <div className="flex items-baseline gap-2 text-dark-accent mb-4">
                <p className="text-4xl font-bold">{contest.plan.countdown.days}</p>
                <p className="text-lg">dias restantes</p>
            </div>
        </div>
        <div className="border-t border-dark-border pt-4 flex justify-around items-center">
            <button onClick={() => onNavigate('meu-plano')} title="Ver Plano" className="flex flex-col items-center text-dark-accent hover:text-dark-hover transition-colors">
                <CalendarDays size={20} />
                <span className="text-xs mt-1">Plano</span>
            </button>
            <button onClick={() => onNavigate('materias')} title="Ver Matérias" className="flex flex-col items-center text-dark-accent hover:text-dark-hover transition-colors">
                <BookOpenText size={20} />
                <span className="text-xs mt-1">Matérias</span>
            </button>
            <button onClick={() => onNavigate('progresso')} title="Ver Progresso" className="flex flex-col items-center text-dark-accent hover:text-dark-hover transition-colors">
                <CheckSquare size={20} />
                <span className="text-xs mt-1">Progresso</span>
            </button>
        </div>
    </div>
);

const AddContestCard: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => (
    <button
        onClick={() => onNavigate('concursos')} 
        className="bg-dark-card p-6 rounded-lg border-2 border-dashed border-dark-border hover:border-dark-accent hover:text-dark-accent text-dark-secondary-text transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] shadow-lg"
    >
        <PlusCircle size={48} className="mb-4" />
        <h3 className="font-bold text-xl">Adicionar Novo Concurso</h3>
    </button>
);


const Dashboard: React.FC<DashboardProps> = ({ contests, onNavigate }) => {
  return (
    <div>
        <h1 className="text-3xl font-bold text-dark-text mb-4">Centro de Comando</h1>
        <p className="text-dark-secondary-text mb-8">
          {contests.length > 0 
            ? "Bem-vindo(a) de volta! Acompanhe seus concursos e acesse rapidamente seus planos de estudo."
            : "Sua jornada para a aprovação começa agora. Vamos configurar seu primeiro plano!"
          }
        </p>
        
        {contests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contests.map(contest => (
                    <ContestCard key={contest.id} contest={contest} onNavigate={onNavigate} />
                ))}
                <AddContestCard onNavigate={onNavigate}/>
            </div>
        ) : (
            <WelcomeGuide onNavigate={onNavigate} />
        )}
    </div>
  );
};

export default Dashboard;