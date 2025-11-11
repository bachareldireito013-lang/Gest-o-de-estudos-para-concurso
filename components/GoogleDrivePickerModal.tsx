import React, { useState, useEffect } from 'react';
import { DriveFile } from '../types';
import { listDriveFiles, downloadDriveFile } from '../services/authService';
import { X, FileText, Loader, FolderUp } from 'lucide-react';

interface GoogleDrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
}

const GoogleDrivePickerModal: React.FC<GoogleDrivePickerModalProps> = ({ isOpen, onClose, onFileSelect }) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setSelectedFileId(null);
      listDriveFiles()
        .then(setFiles)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  const handleImport = async () => {
    if (!selectedFileId) return;
    setIsDownloading(true);
    try {
      const downloadedFile = await downloadDriveFile(selectedFileId);
      onFileSelect(downloadedFile);
    } catch (error) {
      console.error("Erro ao 'baixar' arquivo do Drive:", error);
      alert("Não foi possível importar o arquivo selecionado.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

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
          <h2 className="text-2xl font-bold text-dark-accent flex items-center gap-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo.png" alt="Google Drive" className="w-7 h-7" />
            Selecionar Edital do Drive
          </h2>
          <button onClick={onClose} className="text-dark-secondary-text hover:text-dark-text transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto pr-4 -mr-4 mb-6 border-t border-b border-dark-border py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 text-dark-secondary-text">
              <Loader className="animate-spin mb-4" size={32} />
              <p>Buscando arquivos...</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {files.map(file => (
                <li key={file.id}>
                  <button
                    onClick={() => setSelectedFileId(file.id)}
                    className={`w-full text-left p-3 rounded-md border-2 transition-all flex items-center gap-3 ${
                      selectedFileId === file.id
                        ? 'bg-dark-accent/20 border-dark-accent'
                        : 'bg-dark-bg border-transparent hover:border-dark-border'
                    }`}
                  >
                    <FileText className="text-dark-secondary-text flex-shrink-0" />
                    <span className="text-dark-text font-medium">{file.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-2 rounded-lg text-dark-secondary-text hover:bg-dark-border transition-colors">Cancelar</button>
          <button 
            onClick={handleImport} 
            disabled={!selectedFileId || isDownloading}
            className="bg-dark-accent hover:bg-dark-hover px-6 py-2 rounded-lg text-white font-bold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDownloading ? <Loader className="animate-spin" size={20}/> : <FolderUp size={20} />}
            {isDownloading ? 'Importando...' : 'Importar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleDrivePickerModal;
