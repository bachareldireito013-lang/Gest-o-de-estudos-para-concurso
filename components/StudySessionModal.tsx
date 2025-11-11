import React, { useState } from 'react';
import { X, Play } from 'lucide-react';

interface StudySessionModalProps {
  subjectName: string;
  topics: string[];
  onClose: () => void;
  onConfirm: (topic: string, source: string) => void;
}

const studySources = ['PDF', 'Videoaula', 'Doutrina', 'Lei Seca', 'Questões', 'Outro'];

const StudySessionModal: React.FC<StudySessionModalProps> = ({ subjectName, topics, onClose, onConfirm }) => {
  const [selectedTopic, setSelectedTopic] = useState(topics[0] || '');
  const [source, setSource] = useState(studySources[0]);
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!selectedTopic) {
        setError('Por favor, selecione um tópico para estudar.');
        return;
    }
    setError('');
    onConfirm(selectedTopic, source);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-dark-card w-full max-w-lg rounded-lg border border-dark-border p-8 m-4 flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark-accent">Iniciar Sessão de Estudo</h2>
          <button onClick={onClose} className="text-dark-secondary-text hover:text-dark-text transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-dark-secondary-text mb-2">Matéria</label>
                <p className="bg-dark-bg border border-dark-border rounded-lg p-3 text-dark-text">{subjectName}</p>
            </div>
            <div>
                <label htmlFor="topic-select" className="block text-sm font-medium text-dark-secondary-text mb-2">Tópico Específico</label>
                <select 
                    id="topic-select"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-dark-text focus:ring-2 focus:ring-dark-accent focus:border-dark-accent transition"
                >
                    {topics.map((topic, index) => (
                        <option key={index} value={topic}>{topic}</option>
                    ))}
                </select>
            </div>
             <div>
                <label htmlFor="source-select" className="block text-sm font-medium text-dark-secondary-text mb-2">Fonte do Estudo</label>
                <select
                    id="source-select"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-dark-text focus:ring-2 focus:ring-dark-accent focus:border-dark-accent transition"
                >
                    {studySources.map((sourceOption) => (
                        <option key={sourceOption} value={sourceOption}>{sourceOption}</option>
                    ))}
                </select>
            </div>
        </div>

        {error && <p className="text-error mt-4 text-sm text-center">{error}</p>}

        <div className="flex justify-end gap-4 mt-8">
            <button onClick={onClose} className="px-6 py-2 rounded-lg text-dark-secondary-text hover:bg-dark-border transition-colors">Cancelar</button>
            <button onClick={handleConfirm} className="bg-success hover:opacity-80 px-6 py-2 rounded-lg text-white font-bold transition-colors flex items-center gap-2">
                <Play size={18} />
                Confirmar e Iniciar
            </button>
        </div>
      </div>
    </div>
  );
};

export default StudySessionModal;