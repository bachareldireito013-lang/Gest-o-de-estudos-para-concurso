import React from 'react';
import { Page } from '../types';
import { Rocket, Wand2 } from 'lucide-react';

interface WelcomeGuideProps {
  onNavigate: (page: Page) => void;
}

const WelcomeGuide: React.FC<WelcomeGuideProps> = ({ onNavigate }) => {
  return (
    <div className="bg-dark-card p-10 rounded-lg border border-dark-border text-center shadow-2xl flex flex-col items-center animate-fade-in">
      <div className="p-4 bg-dark-accent/20 rounded-full mb-6">
        <Rocket size={48} className="text-dark-accent" />
      </div>
      <h2 className="text-3xl font-bold text-dark-text mb-3">Tudo pronto para a sua aprovação!</h2>
      <p className="text-dark-secondary-text mb-8 max-w-xl mx-auto">
        Seu centro de comando está no ar. O primeiro passo na sua jornada é criar um plano de estudos personalizado. Envie seu edital e deixe a nossa IA fazer o trabalho pesado.
      </p>
      <button
        onClick={() => onNavigate('concursos')}
        className="bg-dark-accent hover:bg-dark-hover text-white font-bold py-3 px-8 rounded-lg text-lg flex items-center gap-3 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1"
      >
        <Wand2 size={20} />
        Criar Meu Primeiro Plano
      </button>
    </div>
  );
};

export default WelcomeGuide;
