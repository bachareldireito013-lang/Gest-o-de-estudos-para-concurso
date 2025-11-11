import React, { useState, useMemo, useEffect } from 'react';
import { Page, navItems, Flashcard, Contest, StudyPlan, User, StudySessionInfo, StudySessionRecord, Goal, Course, MistakeEntry, PostExamAnalysis } from './types';
import Sidebar from './components/InputForm';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import { RevisoesPage } from './components/Revisao';
import { ConcursosPage } from './components/Concursos';
import StudyPlanDisplay from './components/StudyPlan';
import { MateriasPage } from './components/Materias';
import { CicloEstudosPage } from './components/CicloEstudosPage';
import { HistoricoEstudosPage } from './components/HistoricoEstudosPage';
import { MetasPage } from './components/MetasPage';
import { CursosPage } from './components/CursosPage';
import { ExerciciosPage } from './components/ExerciciosPage';
import { CadernoDeErrosPage } from './components/CadernoDeErrosPage';
import { ProgressoPage } from './components/ProgressoPage';
import { DiagnosticoPage } from './components/DiagnosticoPage';
import { EstatisticasPage } from './components/EstatisticasPage';
import { AtualizacoesPage } from './components/AtualizacoesPage';
import { PosProvaPage } from './components/PosProvaPage';

import { loginWithGoogle, logout } from './services/authService';
import { fetchLatestUpdates } from './services/geminiService';

const initialFlashcards: Flashcard[] = [
  { id: '1', front: 'Qual o mnemônico para os princípios da Administração Pública?', back: 'LIMPE (Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência)', nextReviewDate: new Date().toISOString(), srsLevel: 2 },
  { id: '2', front: 'Quais são as espécies de atos administrativos quanto à formação de vontade?', back: 'Simples, Complexo e Composto', nextReviewDate: new Date(Date.now() - 86400000).toISOString(), srsLevel: 4 },
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);
  
  const [flashcards, setFlashcards] = useState<Flashcard[]>(initialFlashcards);
  const [contests, setContests] = useState<Contest[]>([]);
  const [activeContestId, setActiveContestId] = useState<string | null>(null);
  const [studyHistory, setStudyHistory] = useState<StudySessionRecord[]>([]);

  // --- Estados das Novas Funcionalidades ---
  const [goals, setGoals] = useState<Goal[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [mistakeEntries, setMistakeEntries] = useState<MistakeEntry[]>([]);
  const [postExamAnalyses, setPostExamAnalyses] = useState<PostExamAnalysis[]>([]);

  // --- Estado do Cronômetro Global ---
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentSessionInfo, setCurrentSessionInfo] = useState<StudySessionInfo | null>(null);
  const timerIntervalRef = React.useRef<number | null>(null);

  useEffect(() => {
    if (isTimerActive) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimer((prevTime) => prevTime + 1);
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerActive]);
  
  const activeContest = useMemo(() => {
    return contests.find(c => c.id === activeContestId);
  }, [contests, activeContestId]);

  const updateContest = (contestId: string, updatedData: Partial<Omit<Contest, 'id'>>) => {
    setContests(currentContests =>
      currentContests.map(c => (c.id === contestId ? { ...c, ...updatedData } : c))
    );
  };

  const handleStartSession = (sessionInfo: StudySessionInfo) => {
    if(isTimerActive) return; // Previne iniciar uma nova sessão se uma já estiver ativa
    setCurrentSessionInfo(sessionInfo);
    setIsTimerActive(true);
  };

  const handlePauseTimer = () => setIsTimerActive(false);

  const handleStopTimer = () => {
    if (currentSessionInfo && timer > 0) {
      // 1. Adicionar ao histórico
      const newRecord: StudySessionRecord = {
        id: `session-${Date.now()}`,
        ...currentSessionInfo,
        duration: timer,
        completedAt: new Date().toISOString(),
      };
      setStudyHistory(prevHistory => [newRecord, ...prevHistory]);
      
      // 2. Atualizar o tempo de estudo no tópico do concurso ativo
      if (activeContest && activeContest.progress) {
          const { subject, topic } = currentSessionInfo;
          const subjectProgress = activeContest.progress[subject];
          if(subjectProgress && subjectProgress[topic]) {
              const topicProgress = subjectProgress[topic];
              const newStudyTime = (topicProgress.studyTime || 0) + timer;
              
              const updatedProgress = {
                  ...activeContest.progress,
                  [subject]: {
                      ...subjectProgress,
                      [topic]: {
                          ...topicProgress,
                          studyTime: newStudyTime,
                      }
                  }
              };
              updateContest(activeContest.id, { progress: updatedProgress });
          }
      }
    }
    
    setIsTimerActive(false);
    setTimer(0);
    setCurrentSessionInfo(null);
  };
  
  const handleFetchUpdates = async () => {
    if (!activeContest) return;
    const subjects = Object.keys(activeContest.plan.subjects);
    const updates = await fetchLatestUpdates(activeContest.name, subjects);
    
    const updatedPlan: StudyPlan = {
        ...activeContest.plan,
        latest_updates: updates
    };
    updateContest(activeContest.id, { plan: updatedPlan });
  };


  const dueCards = useMemo(() => {
    const now = new Date();
    return flashcards.filter(card => new Date(card.nextReviewDate) <= now);
  }, [flashcards]);

  const updateFlashcard = (updatedCard: Flashcard) => {
    setFlashcards(currentFlashcards => 
      currentFlashcards.map(card => card.id === updatedCard.id ? updatedCard : card)
    );
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const loggedInUser = await loginWithGoogle();
      setUser(loggedInUser);
      setCurrentPage('dashboard');
    } catch (error) {
      console.error("Falha no login:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard contests={contests} onNavigate={setCurrentPage} />;
      case 'revisoes':
        return <RevisoesPage dueCards={dueCards} updateFlashcard={updateFlashcard} />;
      case 'concursos':
        return <ConcursosPage 
                  contests={contests}
                  setContests={setContests}
                  activeContestId={activeContestId}
                  setActiveContestId={setActiveContestId}
                />;
      case 'materias':
        return <MateriasPage contest={activeContest} updateContest={updateContest} />;
      case 'ciclo':
        return <CicloEstudosPage 
                  contest={activeContest} 
                  onStartSession={handleStartSession}
                  timer={timer}
                  isTimerActive={isTimerActive}
                  currentSessionInfo={currentSessionInfo}
                  onPauseTimer={handlePauseTimer}
                  onStartTimer={() => setIsTimerActive(true)}
                  onStopTimer={handleStopTimer}
                />;
      case 'historico-estudos':
        return <HistoricoEstudosPage history={studyHistory} />;
      case 'metas':
        return <MetasPage goals={goals} setGoals={setGoals} studyHistory={studyHistory} />;
      case 'cursos':
        return <CursosPage courses={courses} setCourses={setCourses} />;
      case 'exercicios':
        return <ExerciciosPage contest={activeContest} updateContest={updateContest} />;
      case 'caderno-de-erros':
        return <CadernoDeErrosPage entries={mistakeEntries} setEntries={setMistakeEntries} contest={activeContest} />;
      case 'progresso':
        return <ProgressoPage contest={activeContest} />;
      case 'diagnostico':
        return <DiagnosticoPage contest={activeContest} />;
      case 'estatisticas':
        return <EstatisticasPage contests={contests} history={studyHistory} />;
      case 'atualizacoes':
        return <AtualizacoesPage contest={activeContest} onFetchUpdates={handleFetchUpdates} />;
      case 'pos-prova':
        return <PosProvaPage contests={contests} analyses={postExamAnalyses} setAnalyses={setPostExamAnalyses} />;
      case 'meu-plano':
        if (activeContest && activeContest.plan) {
            return <StudyPlanDisplay 
                plan={activeContest.plan} 
                isInteractive={true} 
                onPlanUpdate={(newSchedule) => {
                    const newPlan = { ...activeContest.plan!, study_schedule: newSchedule };
                    updateContest(activeContest.id, { plan: newPlan });
                }}
            />;
        }
        return (
            <div>
                <h1 className="text-3xl font-bold text-dark-text mb-4">Meu Plano de Estudos</h1>
                <div className="bg-dark-card p-8 rounded-lg border border-dark-border text-center">
                    <p className="text-dark-secondary-text">
                        Para visualizar seu plano, primeiro crie um concurso na aba "Meus Concursos" e defina-o como ativo.
                    </p>
                </div>
            </div>
        );
      default:
        return <div>Página não encontrada</div>;
    }
  };
  
  const pageTitle = navItems.find(item => item.id === currentPage)?.label || 'Gestor de Estudos';

  if (!user) {
    return <LoginPage onLogin={handleLogin} isLoggingIn={isLoggingIn} />;
  }

  return (
    <div className="flex h-screen bg-dark-bg text-dark-text font-sans">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        isOpen={isSidebarOpen}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header 
          title={pageTitle}
          user={user}
          onLogout={handleLogout}
          timer={timer}
          isTimerActive={isTimerActive}
          onPauseTimer={handlePauseTimer}
          onStopTimer={handleStopTimer}
          onStartTimer={() => setIsTimerActive(true)}
          onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;