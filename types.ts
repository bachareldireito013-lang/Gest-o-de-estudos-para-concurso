export type Page = 
  | 'dashboard' 
  | 'concursos' 
  | 'meu-plano' 
  | 'ciclo' 
  | 'metas' 
  | 'cursos' 
  | 'exercicios' 
  | 'caderno-de-erros' 
  | 'materias' 
  | 'progresso' 
  | 'diagnostico' 
  | 'estatisticas' 
  | 'historico-estudos' 
  | 'atualizacoes' 
  | 'pos-prova'
  | 'revisoes';

export interface NavItem {
    id: Page;
    label: string;
    icon: string; // Lucide icon name
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  nextReviewDate: string; // ISO String
  srsLevel: number; // 0 for new, increases with correct answers
}

// --- Estrutura de Dados para o Plano de Estudos Gerado pela IA ---

export interface Countdown {
  days: number;
  weeks: number;
}

export interface ScheduleItem {
  "Dia": string;
  "Matéria Sugerida": string;
  "Tópico para Estudo": string;
  "Carga Horária (min)": number;
  "Fonte Utilizada": string;
  "Rendimento %": string;
}

export interface HeatmapItem {
  "Matéria": string;
  "% Acerto": number;
  "Status Visual": string;
}

export interface UpdateItem {
  update: string;
  source: string;
}

export interface StudyPlan {
  nome_concurso: string; // Extraído pela IA
  data_prova: string; // Extraído pela IA (formato YYYY-MM-DD)
  countdown: Countdown;
  study_schedule: ScheduleItem[];
  performance_heatmap: HeatmapItem[];
  latest_updates: UpdateItem[];
  subjects: Record<string, string[]>; // Mapeia uma matéria a uma lista de seus tópicos
}

// --- Estruturas de Progresso ---
export interface TopicProgressHistory {
  date: string; // ISO String
  correct: number;
  total: number;
}

export interface TopicProgress {
  correct: number;
  total: number;
  studyTime?: number; // em segundos
  completed?: boolean;
  history?: TopicProgressHistory[];
}

export interface SubjectProgress {
  [topic: string]: TopicProgress;
}

export interface ContestProgress {
  [subject: string]: SubjectProgress;
}

// Estrutura para armazenar os dados de um concurso processado
export interface Contest {
  id: string;
  name: string;
  plan: StudyPlan;
  progress?: ContestProgress;
  currentCycleDay?: number;
}

// Estrutura para armazenar os dados de uma sessão de estudo em andamento
export interface StudySessionInfo {
  subject: string;
  topic: string;
  source: string;
}

// Estrutura para armazenar uma sessão de estudo concluída no histórico
export interface StudySessionRecord extends StudySessionInfo {
  id: string;
  duration: number; // em segundos
  completedAt: string; // ISO String
}

// --- Novas Estruturas ---

export interface Goal {
  id: string;
  description: string;
  type: 'hours' | 'questions' | 'flashcards';
  target: number;
  current: number;
  completed: boolean;
}

export interface Course {
  id: string;
  title: string;
  url: string;
  progress: number; // percentual de 0 a 100
}

export interface MistakeEntry {
  id: string;
  subject: string;
  topic: string;
  question: string;
  notes: string;
  createdAt: string; // ISO String
}

export interface PostExamAnalysis {
  contestId: string;
  officialKey: string[];
  userAnswers: string[];
  score?: number;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}


export const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Centro de Comando', icon: 'LayoutDashboard' },
    { id: 'revisoes', label: 'Revisões Agendadas', icon: 'BrainCircuit' },
    { id: 'concursos', label: 'Meus Concursos', icon: 'Trophy' },
    { id: 'meu-plano', label: 'Meu Plano', icon: 'CalendarDays' },
    { id: 'materias', label: 'Matérias e Progresso', icon: 'BookOpenText' },
    { id: 'ciclo', label: 'Ciclo de Estudos', icon: 'RefreshCw' },
    { id: 'historico-estudos', label: 'Histórico', icon: 'History' },
    { id: 'metas', label: 'Metas', icon: 'Target' },
    { id: 'cursos', label: 'Cursos e Aulas', icon: 'GraduationCap' },
    { id: 'exercicios', label: 'Centro de Treinamento', icon: 'PenSquare' },
    { id: 'caderno-de-erros', label: 'Caderno de Erros', icon: 'FileWarning' },
    { id: 'progresso', label: 'Progresso do Edital', icon: 'CheckSquare' },
    { id: 'diagnostico', label: 'Diagnóstico', icon: 'PieChart' },
    { id: 'estatisticas', label: 'Estatísticas', icon: 'BarChart3' },
    { id: 'atualizacoes', label: 'Atualizações', icon: 'Bell' },
    { id: 'pos-prova', label: 'Análise Pós-Prova', icon: 'ShieldCheck' },
];