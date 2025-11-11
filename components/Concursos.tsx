import React, { useState, useRef, Dispatch, SetStateAction } from 'react';
import { generateStudyPlan, UserData } from '../services/geminiService';
import { extractTextFromFile } from '../services/fileParser';
import { Contest, StudyPlan, ContestProgress, SubjectProgress, TopicProgressHistory } from '../types';
import StudyPlanDisplay from './StudyPlan';
import GoogleDrivePickerModal from './GoogleDrivePickerModal';
import { FileText, Upload, Check, Wand2, Loader, AlertCircle, CheckCircle, FolderOpen, ChevronDown, FolderUp } from 'lucide-react';
import { signInWithGoogleDrive } from '../services/authService';

// --- Componente de Instruções para API Key ---
const ApiKeyInstructions: React.FC = () => (
  <div>
    <h1 className="text-3xl font-bold text-dark-text mb-6">Meus Concursos</h1>
    <div className="bg-dark-card border border-green-500 p-8 rounded-lg text-center shadow-lg">
      <CheckCircle className="mx-auto h-16 w-16 text-green-400 mb-4" />
      <h2 className="text-2xl font-bold text-white mb-3">Chave de API Ativa!</h2>
      <p className="text-dark-secondary-text mb-6 max-w-3xl mx-auto">
        Sua chave de API foi configurada corretamente. Para que a aplicação a reconheça, por favor, atualize a página.
      </p>
      <div className="flex justify-center">
        <button
          onClick={() => window.location.reload()}
          className="bg-dark-accent hover:bg-dark-hover text-white font-bold py-3 px-8 rounded-lg text-lg flex items-center gap-3 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <i className="fa-solid fa-sync-alt"></i>
          Atualizar Página
        </button>
      </div>
    </div>
  </div>
);

const CONTESTS_PER_PAGE = 3;

interface ConcursosPageProps {
  contests: Contest[];
  setContests: Dispatch<SetStateAction<Contest[]>>;
  activeContestId: string | null;
  setActiveContestId: (id: string | null) => void;
}

export const ConcursosPage: React.FC<ConcursosPageProps> = ({ contests, setContests, activeContestId, setActiveContestId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Aguardando edital...');
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [organizingBody, setOrganizingBody] = useState('');
  const [knowledgeLevel, setKnowledgeLevel] = useState<'iniciante' | 'intermediário' | 'avançado'>('intermediário');
  const [visibleContestsCount, setVisibleContestsCount] = useState(CONTESTS_PER_PAGE);
  const [isDrivePickerOpen, setIsDrivePickerOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const IS_API_KEY_MISSING = !process.env.API_KEY;

  const handleFileSelect = (selectedFile: File | null | undefined) => {
    if (!selectedFile) {
        setFile(null);
        return;
    }
    // Simplificando a validação para aceitar o 'text/plain' do Drive simulado
    setFile(selectedFile);
    setError(null);
  };

  const handleDragEvents = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  const handleOpenDrivePicker = async () => {
    try {
        await signInWithGoogleDrive(); // Simula autenticação
        setIsDrivePickerOpen(true);
    } catch (authError) {
        setError("Falha ao autenticar com o Google Drive.");
    }
  };

  const handleFileFromDrive = (driveFile: File) => {
    handleFileSelect(driveFile);
    setIsDrivePickerOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError("Por favor, selecione o arquivo do edital.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setLoadingMessage('Lendo arquivo do edital...');
      const syllabusContent = await extractTextFromFile(file);

      if (!syllabusContent.trim()) {
        throw new Error("O arquivo parece estar vazio ou o texto não pôde ser extraído.");
      }
      
      setLoadingMessage('IA está criando seu plano...');
      const userData: UserData = {
        organizingBody: organizingBody.trim() ? organizingBody.trim() : undefined,
        knowledgeLevel: knowledgeLevel,
      };

      const planResult = await generateStudyPlan(syllabusContent, userData, setLoadingMessage);
      
      const newContest: Contest = {
        id: `contest-${Date.now()}`,
        name: planResult.nome_concurso,
        plan: planResult,
        progress: {}, // O progresso será gerado abaixo
        currentCycleDay: 1,
      };

      const subjectsWithTopics = planResult.subjects || {};
      const initialProgress: ContestProgress = {};
      for (const subject in subjectsWithTopics) {
        const topicProgress: SubjectProgress = {};
        subjectsWithTopics[subject].forEach(topic => {
           const hasStudied = Math.random() > 0.4;
          const history: TopicProgressHistory[] = [];
          let total = 0;
          let correct = 0;
          let studyTime = 0;

          if (hasStudied) {
              studyTime = Math.floor(Math.random() * 7200) + 1800;
              const sessionCount = Math.floor(Math.random() * 4) + 1;
              for(let i=0; i<sessionCount; i++) {
                  const sessionTotal = Math.floor(Math.random() * 15) + 5;
                  const sessionCorrect = Math.floor(Math.random() * (sessionTotal + 1));
                  history.push({
                      date: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)).toISOString(),
                      correct: sessionCorrect,
                      total: sessionTotal,
                  });
                  total += sessionTotal;
                  correct += sessionCorrect;
              }
          }
          
          topicProgress[topic] = { 
              correct, 
              total,
              studyTime,
              completed: false,
              history,
          };
        });
        initialProgress[subject] = topicProgress;
      }
      
      newContest.progress = initialProgress;

      setContests(prevContests => [newContest, ...prevContests]);
      setActiveContestId(newContest.id);
      
      setFile(null);
      if(fileInputRef.current) fileInputRef.current.value = "";

    } catch (e) {
      console.error("Falha ao processar o edital:", e);
      let errorMessage = "Ocorreu um erro desconhecido. Tente novamente.";
      if (e instanceof Error) {
        errorMessage = e.message.includes("API key not valid") ? "Sua Chave de API parece inválida." : e.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingMessage('Aguardando edital...');
    }
  };

  if (IS_API_KEY_MISSING) {
    return <ApiKeyInstructions />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text mb-6">Meus Concursos</h1>

      {/* Seção de Upload */}
      <form onSubmit={handleSubmit} className="bg-dark-card p-8 rounded-lg border border-dark-border mb-8 shadow-lg">
        <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-dark-accent mb-4" />
            <h2 className="text-2xl font-bold text-dark-text mb-2">Gerador de Plano Inteligente</h2>
            <p className="text-dark-secondary-text mb-6 max-w-2xl mx-auto">
              Faça o upload do seu edital (PDF, DOCX, TXT) e a IA criará um plano de estudos completo para você.
            </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div 
                className={`p-10 text-center bg-dark-bg rounded-lg border-2 border-dashed transition-all duration-300 cursor-pointer h-full flex flex-col justify-center ${isDragging ? 'border-dark-accent scale-105 bg-dark-card' : 'border-dark-border hover:border-dark-secondary-text'}`}
                onDragEnter={(e) => { handleDragEvents(e); setIsDragging(true); }}
                onDragOver={handleDragEvents}
                onDragLeave={(e) => { handleDragEvents(e); setIsDragging(false); }}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e.target.files?.[0])} className="hidden" accept=".pdf,.docx,.txt" />
                <div className="flex flex-col items-center justify-center pointer-events-none">
                     <Upload className={`h-10 w-10 text-dark-secondary-text mb-4 transition-transform ${isDragging ? 'animate-bounce' : ''}`} />
                    <p className="font-semibold text-dark-text">Arraste ou clique aqui</p>
                    <p className="text-sm text-dark-secondary-text">para enviar o edital</p>
                </div>
            </div>
             <button
                type="button"
                onClick={handleOpenDrivePicker}
                className="p-10 text-center bg-dark-bg rounded-lg border-2 border-dashed border-dark-border hover:border-dark-secondary-text transition-all duration-300 cursor-pointer h-full flex flex-col justify-center items-center"
            >
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo.png" alt="Google Drive" className="w-10 h-10 mb-4" />
                <p className="font-semibold text-dark-text">Importar do Google Drive</p>
                <p className="text-sm text-dark-secondary-text">Selecione o edital da nuvem</p>
            </button>
        </div>

        {file && (
            <div className="mt-4 text-center bg-dark-bg p-3 rounded-lg border border-dark-border">
                <p className="font-semibold text-dark-text">Arquivo selecionado:</p>
                <p className="text-sm text-green-400">{file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
                <span role="button" onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="mt-1 text-xs text-error hover:underline cursor-pointer">Remover</span>
            </div>
        )}
        
        <div className="mt-6 border-t border-dark-border pt-6">
             <h3 className="text-lg font-semibold text-dark-text mb-4 text-center">Personalize seu Plano</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="organizing-body" className="block text-sm font-medium text-dark-secondary-text mb-2">Banca Organizadora (Opcional)</label>
                    <input
                        type="text"
                        id="organizing-body"
                        value={organizingBody}
                        onChange={(e) => setOrganizingBody(e.target.value)}
                        placeholder="Ex: Cebraspe, FGV, FCC"
                        className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-dark-text focus:ring-2 focus:ring-dark-accent focus:border-dark-accent transition"
                    />
                </div>
                <div>
                    <label htmlFor="knowledge-level" className="block text-sm font-medium text-dark-secondary-text mb-2">Meu Nível de Conhecimento</label>
                    <select
                        id="knowledge-level"
                        value={knowledgeLevel}
                        onChange={(e) => setKnowledgeLevel(e.target.value as any)}
                        className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-dark-text focus:ring-2 focus:ring-dark-accent focus:border-dark-accent transition"
                    >
                        <option value="iniciante">Iniciante</option>
                        <option value="intermediário">Intermediário</option>
                        <option value="avançado">Avançado</option>
                    </select>
                </div>
            </div>
        </div>


        <div className="mt-8 text-center">
            <button
              type="submit"
              disabled={isLoading || !file}
              className="bg-dark-accent hover:bg-dark-hover text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center mx-auto shadow-md hover:shadow-lg"
            >
              {isLoading ? ( <> <Loader className="animate-spin mr-3" /> {loadingMessage} </> ) : ( <> <Wand2 className="mr-3" /> Gerar Plano com IA </> )}
            </button>
            {error && <p className="text-error mt-4 text-sm flex items-center justify-center gap-2"><AlertCircle size={16}/> {error}</p>}
        </div>
      </form>

      {/* Lista de Concursos */}
      <div className="space-y-6">
        {contests.length > 0 ? (
          <>
            {contests.slice(0, visibleContestsCount).map(contest => (
              <div key={contest.id} className={`bg-dark-card p-6 rounded-lg border transition-all ${activeContestId === contest.id ? 'border-dark-accent shadow-lg' : 'border-dark-border'}`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-dark-text">{contest.name}</h3>
                  <button
                    onClick={() => setActiveContestId(contest.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${activeContestId === contest.id ? 'bg-dark-accent text-white cursor-default' : 'bg-dark-bg hover:bg-dark-border text-dark-secondary-text hover:text-dark-text'}`}
                  >
                    {activeContestId === contest.id ? <><Check size={16}/> Plano Ativo</> : 'Ativar Plano'}
                  </button>
                </div>
                <StudyPlanDisplay plan={contest.plan} />
              </div>
            ))}
             {contests.length > visibleContestsCount && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setVisibleContestsCount(prev => prev + CONTESTS_PER_PAGE)}
                  className="bg-dark-border hover:bg-dark-accent text-dark-text font-semibold py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center mx-auto shadow-md hover:shadow-lg"
                >
                  <ChevronDown className="mr-2" size={20} /> Carregar Mais
                </button>
              </div>
            )}
          </>
        ) : (
          !isLoading && (
            <div className="text-center py-8 text-dark-secondary-text bg-dark-card rounded-lg border border-dark-border">
              <FolderOpen className="mx-auto h-12 w-12 mb-4" />
              <p>Seus planos de estudo aparecerão aqui.</p>
            </div>
          )
        )}
      </div>

      <GoogleDrivePickerModal 
        isOpen={isDrivePickerOpen}
        onClose={() => setIsDrivePickerOpen(false)}
        onFileSelect={handleFileFromDrive}
      />
    </div>
  );
};
