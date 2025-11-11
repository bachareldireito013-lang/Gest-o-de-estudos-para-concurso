import { User, DriveFile } from '../types';

/**
 * Simula um fluxo de login com o Google.
 * Em uma aplicação real, isso usaria uma biblioteca como @react-oauth/google
 * e se comunicaria com um backend para verificar o token e criar uma sessão.
 * @returns Uma Promise que resolve com o objeto User.
 */
export const loginWithGoogle = async (): Promise<User> => {
  console.log("Simulando fluxo de autenticação com Google...");
  
  // Simula um atraso de rede/API
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Retorna um usuário mockado, como se fosse recebido do backend após a validação
  const mockUser: User = {
    id: 'google-1122334455',
    name: 'Concurseiro Fiel',
    avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=Concurseiro Fiel`,
  };
  
  console.log("Login simulado com sucesso para:", mockUser.name);
  return mockUser;
};

/**
 * Simula um fluxo de logout.
 */
export const logout = async (): Promise<void> => {
    console.log("Simulando logout...");
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("Logout simulado com sucesso.");
};


// --- Simulação de Integração com Google Drive ---

const mockDriveFiles: DriveFile[] = [
    { id: 'drive-001', name: 'Edital_Concurso_TJ_SP_2024.pdf', mimeType: 'application/pdf' },
    { id: 'drive-002', name: 'Edital_Analista_RFB.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { id: 'drive-003', name: 'Conteudo_Programatico_Policia_Federal.txt', mimeType: 'text/plain' },
    { id: 'drive-004', name: 'Edital_TRT_Campinas_Analista.pdf', mimeType: 'application/pdf' },
];

/**
 * Simula a verificação de autenticação e autorização do usuário no Google Drive.
 * @returns Uma Promise que resolve com `true` para indicar sucesso.
 */
export const signInWithGoogleDrive = async (): Promise<boolean> => {
    console.log("Simulando autenticação com Google Drive...");
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("Autenticação com Drive simulada com sucesso.");
    return true;
};

/**
 * Simula a listagem de arquivos de editais da conta do Google Drive do usuário.
 * @returns Uma Promise que resolve com uma lista de arquivos mockados.
 */
export const listDriveFiles = async (): Promise<DriveFile[]> => {
    console.log("Simulando listagem de arquivos do Google Drive...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockDriveFiles;
};

/**
 * Simula o download de um arquivo específico do Google Drive.
 * Cria um objeto `File` com conteúdo mockado para ser processado pela aplicação.
 * @param fileId O ID do arquivo a ser "baixado".
 * @returns Uma Promise que resolve com um objeto `File` simulado.
 */
export const downloadDriveFile = async (fileId: string): Promise<File> => {
    console.log(`Simulando download do arquivo ${fileId} do Google Drive...`);
    await new Promise(resolve => setTimeout(resolve, 800));

    const fileInfo = mockDriveFiles.find(f => f.id === fileId);
    if (!fileInfo) {
        throw new Error("Arquivo não encontrado no Drive (simulado).");
    }

    const mockContent = `
CONTEÚDO PROGRAMÁTICO SIMULADO PARA O ARQUIVO: ${fileInfo.name}
DATA DA PROVA: 2024-12-15

-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

CONHECIMENTOS BÁSICOS

LÍNGUA PORTUGUESA:
1. Compreensão e interpretação de textos.
2. Tipologia textual.
3. Ortografia oficial.

RACIOCÍNIO LÓGICO-MATEMÁTICO:
1. Estruturas lógicas.
2. Lógica de argumentação.
3. Diagramas lógicos.

CONHECIMENTOS ESPECÍFICOS

DIREITO CONSTITUCIONAL:
1. Constituição: conceito, classificações, princípios fundamentais.
2. Direitos e garantias fundamentais.
3. Organização do Estado.

DIREITO ADMINISTRATIVO:
1. Estado, governo e Administração Pública: conceitos, elementos, poderes e organização.
2. Ato administrativo.
3. Agentes públicos.

-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
FIM DO EDITAL SIMULADO.
    `;
    
    // Cria um Blob com o conteúdo mockado
    const blob = new Blob([mockContent], { type: 'text/plain' });
    
    // Cria e retorna um objeto File, que é o que a aplicação espera
    return new File([blob], fileInfo.name, { type: 'text/plain' });
};