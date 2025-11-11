import React, { useState, Dispatch, SetStateAction } from 'react';
import { MistakeEntry, Contest } from '../types';
import { FileWarning, Plus, Edit, Trash2, X, Filter, Search } from 'lucide-react';

interface MistakeModalProps {
  entry?: MistakeEntry | null;
  onSave: (entry: Omit<MistakeEntry, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  contest: Contest | undefined;
}

const MistakeModal: React.FC<MistakeModalProps> = ({ entry, onSave, onClose, contest }) => {
  const [subject, setSubject] = useState(entry?.subject || '');
  const [topic, setTopic] = useState(entry?.topic || '');
  const [question, setQuestion] = useState(entry?.question || '');
  const [notes, setNotes] = useState(entry?.notes || '');
  
  const subjects = contest ? Object.keys(contest.plan.subjects) : [];
  const topics = subject ? contest?.plan.subjects[subject] || [] : [];
  
  React.useEffect(() => {
    if (contest && subjects.length > 0 && !subject) {
      setSubject(subjects[0]);
    }
  }, [contest, subjects, subject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !topic) {
        alert("Por favor, selecione matéria e tópico.");
        return;
    }
    onSave({ subject, topic, question, notes });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-dark-card w-full max-w-2xl rounded-lg border border-dark-border p-8 m-4 shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
          <div className="flex justify-between items-center mb-6 flex-shrink-0">
            <h2 className="text-2xl font-bold text-dark-accent">{entry ? 'Editar Erro' : 'Adicionar ao Caderno de Erros'}</h2>
            <button type="button" onClick={onClose} className="text-dark-secondary-text hover:text-dark-text"><X /></button>
          </div>
          <div className="space-y-4 overflow-y-auto flex-grow pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-dark-secondary-text mb-1">Matéria</label>
                <select id="subject" value={subject} onChange={e => {setSubject(e.target.value); setTopic('');}} required className="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-dark-text">
                  <option value="" disabled>Selecione...</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-dark-secondary-text mb-1">Tópico</label>
                <select id="topic" value={topic} onChange={e => setTopic(e.target.value)} required disabled={!subject} className="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-dark-text disabled:bg-gray-700">
                  <option value="" disabled>Selecione...</option>
                  {topics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-dark-secondary-text mb-1">Enunciado da Questão (ou resumo)</label>
              <textarea id="question" value={question} onChange={e => setQuestion(e.target.value)} rows={4} required className="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-dark-text"></textarea>
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-dark-secondary-text mb-1">Anotações (Por que errei? Qual o correto?)</label>
              <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={6} required className="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-dark-text"></textarea>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8 flex-shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-dark-secondary-text hover:bg-dark-border">Cancelar</button>
            <button type="submit" className="bg-dark-accent hover:bg-dark-hover px-4 py-2 rounded-lg text-white font-bold">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};


interface CadernoDeErrosPageProps {
  entries: MistakeEntry[];
  setEntries: Dispatch<SetStateAction<MistakeEntry[]>>;
  contest: Contest | undefined;
}

export const CadernoDeErrosPage: React.FC<CadernoDeErrosPageProps> = ({ entries, setEntries, contest }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MistakeEntry | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const subjects = contest ? ['all', ...Object.keys(contest.plan.subjects)] : ['all'];

  const handleSaveEntry = (entryData: Omit<MistakeEntry, 'id' | 'createdAt'>) => {
    if (editingEntry) {
      setEntries(entries.map(e => e.id === editingEntry.id ? { ...editingEntry, ...entryData } : e));
    } else {
      const newEntry: MistakeEntry = { id: `mistake-${Date.now()}`, createdAt: new Date().toISOString(), ...entryData };
      setEntries([newEntry, ...entries]);
    }
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };
  
  const filteredEntries = entries.filter(entry => {
      const matchesFilter = filter === 'all' || entry.subject === filter;
      const matchesSearch = searchTerm === '' || 
                            entry.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            entry.notes.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dark-text flex items-center gap-3">
          <FileWarning className="text-dark-accent" />Caderno de Erros
        </h1>
        <button onClick={() => { setEditingEntry(null); setIsModalOpen(true); }} className="bg-dark-accent hover:bg-dark-hover text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:bg-gray-500" disabled={!contest}>
          <Plus size={18} /> Novo Registro
        </button>
      </div>
      
       <div className="bg-dark-card p-4 rounded-lg border border-dark-border mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2 flex-grow">
            <Search size={20} className="text-dark-secondary-text"/>
             <input type="text" placeholder="Buscar no enunciado ou anotações..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent w-full focus:outline-none text-dark-text"/>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-dark-secondary-text"/>
            <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-dark-bg border border-dark-border rounded-lg p-2 text-dark-text">
                {subjects.map(s => <option key={s} value={s}>{s === 'all' ? 'Todas as Matérias' : s}</option>)}
            </select>
          </div>
       </div>

       <div className="space-y-4">
        {filteredEntries.length > 0 ? (
          filteredEntries.map(entry => (
            <div key={entry.id} className="bg-dark-card p-6 rounded-lg border border-dark-border">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-sm font-semibold bg-dark-accent/20 text-dark-accent px-2 py-1 rounded">{entry.subject}</span>
                  <p className="text-xs text-dark-secondary-text mt-1">{entry.topic}</p>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => { setEditingEntry(entry); setIsModalOpen(true); }} className="p-2 text-dark-secondary-text hover:text-dark-accent"><Edit size={16} /></button>
                   <button onClick={() => handleDeleteEntry(entry.id)} className="p-2 text-dark-secondary-text hover:text-error"><Trash2 size={16} /></button>
                </div>
              </div>
              <p className="text-dark-text my-4 font-semibold">{entry.question}</p>
              <div className="bg-dark-bg p-4 rounded text-dark-secondary-text border border-dark-border">
                <p className="whitespace-pre-wrap">{entry.notes}</p>
              </div>
              <p className="text-xs text-right mt-2 text-dark-secondary-text">Registrado em: {new Date(entry.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-dark-card rounded-lg border border-dark-border">
            <FileWarning className="mx-auto h-16 w-16 text-dark-accent mb-4" />
            <h2 className="text-2xl font-bold text-dark-text mb-2">Seu caderno está vazio</h2>
            <p className="text-dark-secondary-text">Clique em "Novo Registro" para começar a adicionar os erros que você cometer.</p>
          </div>
        )}
       </div>

      {isModalOpen && contest && <MistakeModal entry={editingEntry} onSave={handleSaveEntry} onClose={() => setIsModalOpen(false)} contest={contest} />}
    </div>
  );
};
