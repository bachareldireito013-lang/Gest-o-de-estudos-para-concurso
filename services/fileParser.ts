import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Define o caminho para o "worker" do pdf.js, essencial para que ele funcione em um ambiente web.
// A biblioteca foi adicionada via importmap no index.html.
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://aistudiocdn.com/pdfjs-dist@^4.6.0/build/pdf.worker.min.mjs';

/**
 * Extrai o conteúdo de texto de um arquivo (PDF, DOCX, TXT).
 * @param file O objeto File a ser processado.
 * @returns Uma Promise que resolve com o conteúdo de texto extraído como uma string.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return extractTextFromPdf(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return extractTextFromDocx(file);
  } else if (fileType.startsWith('text/') || fileName.endsWith('.txt')) {
    return file.text();
  } else {
    throw new Error('Formato de arquivo não suportado. Por favor, use PDF, DOCX ou TXT.');
  }
}

async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  // Usa Uint8Array, que é o tipo esperado pelo pdf.js
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    // A propriedade 'str' existe em TextItem, mas o tipo é mais genérico.
    // Verificamos se 'str' existe antes de acessá-la.
    const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
    fullText += pageText + '\n\n'; // Adiciona espaço entre as páginas para melhor formatação
  }
  
  return fullText;
}
