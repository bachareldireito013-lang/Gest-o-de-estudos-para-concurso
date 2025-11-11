import { GoogleGenAI } from "@google/genai";
import { StudyPlan, UpdateItem } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface UserData {
  performance?: { [subject: string]: number };
  organizingBody?: string;
  knowledgeLevel?: 'iniciante' | 'intermediário' | 'avançado';
}

export async function generateStudyPlan(
  syllabusContent: string, 
  userData: UserData,
  onStatusUpdate: (message: string) => void
): Promise<StudyPlan> {
  const model = 'gemini-2.5-pro';
  
  const systemInstruction = `Você é o "Gestor de Estudos para concursos", um especialista em otimizar a produtividade. Sua tarefa é analisar o conteúdo do edital fornecido e os dados do usuário para criar um plano de estudos *altamente personalizado* e *único*. Baseie-se ESTRITAMENTE no conteúdo do edital para extrair matérias, tópicos detalhados, o nome do concurso e a data da prova. Sua função é receber o conteúdo do edital e dados do usuário e retornar uma resposta estritamente em formato JSON.

Ferramenta Obrigatória: Google Search (Grounding) deve estar ATIVADA.

A sua saída DEVE ser um único objeto JSON válido, sem qualquer formatação markdown (sem \`\`\`json no início ou fim), que corresponda à seguinte estrutura TypeScript:
interface Countdown { days: number; weeks: number; }
interface ScheduleItem { "Dia da Semana": string; "Matéria Sugerida": string; "Tópico para Estudo": string; "Carga Horária (min)": number; "Fonte Utilizada": string; "Rendimento %": string; }
interface HeatmapItem { "Matéria": string; "% Acerto": number; "Status Visual": string; }
interface UpdateItem { update: string; source: string; }
interface StudyPlan { nome_concurso: string; data_prova: string; // Formato YYYY-MM-DD countdown: Countdown; study_schedule: ScheduleItem[]; performance_heatmap: HeatmapItem[]; latest_updates: UpdateItem[]; }

OBJETIVOS:
1. Análise do Edital: Extraia o **nome do concurso** (ex: "TJ-RJ - Analista Judiciário") e a **data da prova** (formato YYYY-MM-DD) do texto. Extraia Matérias e Tópicos do "Conteúdo Programático". Calcule uma estimativa de Carga Horária para cada matéria.
2. Grade de Estudos Otimizada: Crie uma tabela de cronograma semanal. As colunas "Fonte Utilizada" e "Rendimento %" devem vir vazias.
3. Personalização Avançada:
    - **Nível de Conhecimento:** Adapte a profundidade e a ordem dos tópicos. Para 'iniciante', comece com os fundamentos. Para 'intermediário', equilibre teoria e prática. Para 'avançado', foque em tópicos complexos, jurisprudência e resolução massiva de questões.
    - **Banca Organizadora:** Utilize o Google Search para pesquisar o perfil da banca (ex: Cebraspe, FGV, FCC). Incorpore no plano dicas específicas, como o estilo das questões (múltipla escolha, certo/errado), os tópicos mais cobrados por ela e sugestões de como treinar para suas particularidades.
4. Cronômetro: Calcule os dias e semanas restantes até a data da prova que você extraiu.
5. Mapa de Calor de Rendimento: Se dados de rendimento forem fornecidos, gere o mapa de calor visual com emojis (🟩 > 80%, 🟨 60-79%, 🟥 < 60%).
6. Atualizações Contextualizadas: Use a pesquisa na web para buscar as três atualizações mais recentes e relevantes (legislação, jurisprudência, notícias da banca) que impactem o edital. Forneça a fonte.`;

  const userPrompt = `
Conteúdo do Edital:
---
${syllabusContent}
---

Dados do Usuário (Opcional):
${userData.performance ? `- Desempenho Atual: ${JSON.stringify(userData.performance)}` : ''}
${userData.organizingBody ? `- Banca Organizadora: ${userData.organizingBody}` : ''}
${userData.knowledgeLevel ? `- Nível de Conhecimento: ${userData.knowledgeLevel}` : ''}

Por favor, analise o edital, extraia todas as informações necessárias, incluindo o nome do concurso e a data da prova, e gere o plano de estudos estruturado em JSON conforme as instruções.
`;

  const MAX_RETRIES = 3;
  const INITIAL_BACKOFF_MS = 2000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 1) {
        onStatusUpdate(`Tentativa ${attempt} de ${MAX_RETRIES}...`);
      }
      
      const response = await ai.models.generateContent({
        model,
        contents: userPrompt,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });
      
      onStatusUpdate('Analisando a resposta da IA...');
      const text = response.text.trim();
      
      const cleanedText = text.startsWith('```json') ? text.substring(7, text.length - 3).trim() : text;
      
      const parsedPlan: StudyPlan = JSON.parse(cleanedText);

      if (!parsedPlan.study_schedule || parsedPlan.study_schedule.length === 0 || !parsedPlan.nome_concurso || !parsedPlan.data_prova) {
        throw new Error("A IA não conseguiu extrair informações essenciais (plano, nome ou data) do edital. Tente um arquivo com formatação mais clara.");
      }

      return parsedPlan;

    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('JSON')) {
        throw new Error("A IA retornou uma resposta em um formato inválido. Tente novamente com um arquivo de edital mais claro.");
      }

      if (errorMessage.includes('"code":503') || errorMessage.includes('UNAVAILABLE')) {
        if (attempt === MAX_RETRIES) {
          throw new Error("O serviço da IA está temporariamente indisponível após múltiplas tentativas. Por favor, tente novamente mais tarde.");
        }
        
        const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
        onStatusUpdate(`Serviço indisponível. Tentando novamente em ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));

      } else {
        console.error("Erro não recuperável ao gerar o plano:", error);
        throw new Error(`Falha na comunicação com a IA. Detalhes: ${errorMessage}`);
      }
    }
  }
  
  throw new Error("Falha ao gerar o plano de estudos após múltiplas tentativas.");
}

export async function fetchLatestUpdates(
  contestName: string,
  subjects: string[]
): Promise<UpdateItem[]> {
  const model = 'gemini-2.5-flash';
  
  const systemInstruction = `Você é um assistente de estudos para concursos públicos especializado em encontrar as últimas novidades. Sua tarefa é usar a ferramenta de busca (Google Search) para encontrar as 3 (três) atualizações mais recentes e relevantes (mudanças de legislação, decisões jurisprudenciais importantes, ou notícias sobre o concurso/banca) para as matérias listadas. Retorne a resposta em um formato JSON contendo um array de objetos, onde cada objeto tem as chaves "update" e "source".

A sua saída DEVE ser um único objeto JSON válido, sem qualquer formatação markdown, com a estrutura:
{ "updates": [{ "update": "...", "source": "..." }] }`;

  const userPrompt = `
Nome do Concurso: ${contestName}
Matérias de Interesse: ${subjects.join(', ')}

Busque as três atualizações mais recentes e relevantes para estas matérias e retorne no formato JSON especificado.
`;
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text.trim();
    const cleanedText = text.startsWith('```json') ? text.substring(7, text.length - 3).trim() : text;
    const parsedResponse = JSON.parse(cleanedText);
    
    return parsedResponse.updates || [];

  } catch (error) {
    console.error("Erro ao buscar atualizações:", error);
    const errorMessage = error instanceof Error ? error.message : "Falha na comunicação com a IA.";
    throw new Error(`Não foi possível buscar as atualizações. Detalhes: ${errorMessage}`);
  }
}