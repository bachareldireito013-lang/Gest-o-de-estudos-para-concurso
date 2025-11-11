import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Trash2, Edit, Check } from 'lucide-react';

interface TopicManagerModalProps {
  subjectName: string;
  initialTopics: string[];
  onSave: (newTopics: string[]) => void;
  onClose: () => void;
}

const TopicManagerModal: React.FC<TopicManagerModalProps> = ({ subjectName, initialTopics, onSave, onClose }) => {
  const [topics, setTopics] = useState([...initialTopics]);
  const [newTopic, setNewTopic] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingIndex !== null && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingIndex]);

  const handleAddTopic = () => {
    if (newTopic.trim() && !topics.includes(newTopic.trim())) {
      setTopics([...topics, newTopic.trim()]);
      setNewTopic('');
    }
  };

  const handleRemoveTopic = (indexToRemove: number) => {
    setTopics(topics.filter((_, index) => index !== indexToRemove));
  };

  const handleStartEditing = (index: number, currentText: string) => {
    setEditingIndex(index);
    setEditingText(currentText);
  };

  const handleSaveEdit = (index: number) => {
    if (editingText.trim() && !topics.includes(editingText.trim())) {
      const updatedTopics = [...topics];
      updatedTopics[index] = editingText.trim();
      setTopics(updatedTopics);
    }
    setEditingIndex(null);
    setEditingText('');
  };


  const handleSave = () => {
    if (editingIndex !== null) {
        handleSaveEdit(editingIndex);
    }
    // Usamos um callback para garantir que o estado `topics` esteja atualizado antes de salvar
    setTopics(currentTopics => {
      onSave(currentTopics);
      return currentTopics;
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-dark-card w-full max-w-2xl rounded-lg border border-dark-border p-8 m-4 max-h-[90vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark-accent">Gerenciar Tópicos: {subjectName}</h2>
          <button onClick={onClose} className="text-dark-secondary-text hover:text-dark-text transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 mb-6">
          <ul className="space-y-3">
            {topics.map((topic, index) => (
              <li key={index} className="bg-dark-bg p-3 rounded-md text-dark-text border border-dark-border flex justify-between items-center group">
                {editingIndex === index ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onBlur={() => handleSaveEdit(index)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(index)}
                    className="flex-grow bg-transparent border-b border-dark-accent focus:outline-none"
                  />
                ) : (
                  <span className="flex-grow mr-2">{topic}</span>
                )}
                <div className="flex items-center gap-2 pl-2 flex-shrink-0">
                  {editingIndex === index ? (
                    <button
                      onClick={() => handleSaveEdit(index)}
                      className="text-success hover:text-green-400 transition-colors"
                      title="Salvar Tópico"
                    >
                      <Check size={18} />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEditing(index, topic)}
                        className="text-dark-secondary-text hover:text-dark-accent opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Editar Tópico"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleRemoveTopic(index)} 
                        className="text-dark-secondary-text hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remover Tópico"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
           {topics.length === 0 && (
              <p className="text-dark-secondary-text text-center py-4">Nenhum tópico cadastrado. Adicione o primeiro abaixo.</p>
           )}
        </div>

        <div className="flex-shrink-0">
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTopic()}
              placeholder="Digite um novo tópico"
              className="flex-grow bg-dark-bg border border-dark-border rounded-lg p-3 text-dark-text focus:ring-2 focus:ring-dark-accent focus:border-dark-accent transition"
            />
            <button
              onClick={handleAddTopic}
              className="bg-dark-accent hover:bg-dark-hover text-white font-bold p-3 rounded-lg transition-colors flex items-center justify-center"
              title="Adicionar Tópico"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="flex justify-end gap-4">
            <button onClick={onClose} className="px-6 py-2 rounded-lg text-dark-secondary-text hover:bg-dark-border transition-colors">Cancelar</button>
            <button onClick={handleSave} className="bg-dark-accent hover:bg-dark-hover px-6 py-2 rounded-lg text-white font-bold transition-colors">Salvar Alterações</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicManagerModal;