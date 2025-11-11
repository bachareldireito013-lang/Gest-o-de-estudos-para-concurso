import React, { useState, Dispatch, SetStateAction } from 'react';
import { PostExamAnalysis, Contest } from '../types';
import { ShieldCheck, Calculator } from 'lucide-react';

interface PosProvaPageProps {
  contests: Contest[];
  analyses: PostExamAnalysis[];
  setAnalyses: Dispatch<SetStateAction<PostExamAnalysis[]>>;
}

export const PosProvaPage: React.FC<PosProvaPageProps> = ({ contests, analyses, setAnalyses }) => {
  const [selectedContestId, setSelectedContestId] = useState<string>('');
  const [officialKey, setOfficialKey] = useState('');
  const [userAnswers, setUserAnswers] = useState('');
  
  const currentAnalysis = analyses.find(a => a.contestId === selectedContestId);
  
  React.useEffect(() => {
    if (contests.length > 0 && !selectedContestId) {
        setSelectedContestId(contests[0].id);
    }
  }, [contests, selectedContestId]);

  React.useEffect(() => {
      if (currentAnalysis) {
          setOfficialKey(currentAnalysis.officialKey.join('\n'));
          setUserAnswers(currentAnalysis.userAnswers.join('\n'));
      } else {
          setOfficialKey('');
          setUserAnswers('');
      }
  }, [currentAnalysis]);


  const handleCalculate = () => {
    const officialArray = officialKey.split('\n').map(a => a.trim().toUpperCase());
    const userArray = userAnswers.split('\n').map(a => a.trim().toUpperCase());
    
    if (officialArray.length === 0 || userArray.length === 0 || officialArray.length !== userArray.length) {
      alert('Por favor, verifique os gabaritos. Eles devem ter o mesmo número de questões e não podem estar vazios.');
      return;
    }

    let score = 0;
    for (let i = 0; i < officialArray.length; i++) {
      if (officialArray[i] && userArray[i] && officialArray[i] === userArray[i]) {
        score++;
      }
    }
    
    const newAnalysis: PostExamAnalysis = {
        contestId: selectedContestId,
        officialKey: officialArray,
        userAnswers: userArray,
        score,
    };

    const existingIndex = analyses.findIndex(a => a.contestId === selectedContestId);
    if (existingIndex > -1) {
        const updatedAnalyses = [...analyses];
        updatedAnalyses[existingIndex] = newAnalysis;
        setAnalyses(updatedAnalyses);
    } else {
        setAnalyses([...analyses, newAnalysis]);
    }
  };


  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text mb-6 flex items-center gap-3">
        <ShieldCheck className="text-dark-accent" />Análise Pós-Prova
      </h1>

      <div className="bg-dark-card p-8 rounded-lg border border-dark-border">
        <div className="max-w-md mb-6">
            <label htmlFor="contest-select" className="block text-sm font-medium text-dark-secondary-text mb-2">Selecione o Concurso</label>
            <select id="contest-select" value={selectedContestId} onChange={e => setSelectedContestId(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-dark-text">
                {contests.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>
        
        {selectedContestId ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-semibold text-dark-text mb-2">Gabarito Oficial</h3>
                    <textarea value={officialKey} onChange={e => setOfficialKey(e.target.value)} rows={10} placeholder="Cole o gabarito oficial aqui, uma resposta por linha." className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-dark-text font-mono"></textarea>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold text-dark-text mb-2">Suas Respostas</h3>
                    <textarea value={userAnswers} onChange={e => setUserAnswers(e.target.value)} rows={10} placeholder="Cole suas respostas aqui, uma por linha, na mesma ordem." className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-dark-text font-mono"></textarea>
                </div>
                <div className="md:col-span-2 text-center">
                    <button onClick={handleCalculate} className="bg-dark-accent hover:bg-dark-hover text-white font-bold py-3 px-8 rounded-lg text-lg flex items-center gap-3 mx-auto">
                        <Calculator size={20} /> Calcular Pontuação
                    </button>
                </div>
                {currentAnalysis?.score !== undefined && (
                    <div className="md:col-span-2 text-center mt-6 bg-dark-bg p-6 rounded-lg border-2 border-dashed border-dark-accent">
                        <p className="text-dark-secondary-text text-lg">Sua pontuação preliminar é:</p>
                        <p className="text-6xl font-bold text-dark-accent my-2">{currentAnalysis.score}</p>
                        <p className="text-dark-secondary-text">de {currentAnalysis.officialKey.length} questões ({((currentAnalysis.score / currentAnalysis.officialKey.length) * 100).toFixed(1)}%)</p>
                    </div>
                )}
            </div>
        ) : (
             <div className="text-center py-8 text-dark-secondary-text">
                <p>Crie um concurso para poder analisar sua prova.</p>
             </div>
        )}
      </div>
    </div>
  );
};
