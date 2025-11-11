import React, { useState, useEffect, useRef } from 'react';
import { StudyPlan, ScheduleItem } from '../types';
import { Hourglass, Map as MapIcon, Bolt, CalendarDays, Plus, Trash2 } from 'lucide-react';

interface StudyPlanDisplayProps {
  plan: StudyPlan;
  isInteractive?: boolean;
  onPlanUpdate?: (newSchedule: ScheduleItem[]) => void;
}

const StudyPlanDisplay: React.FC<StudyPlanDisplayProps> = ({ plan, isInteractive = false, onPlanUpdate }) => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>(plan?.study_schedule || []);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; colKey: keyof ScheduleItem } | null>(null);
  const [editText, setEditText] = useState('');

  const draggedItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    setSchedule(plan?.study_schedule || []);
  }, [plan]);
  
  const handlePlanUpdate = (newSchedule: ScheduleItem[]) => {
    setSchedule(newSchedule);
    if (onPlanUpdate) {
      onPlanUpdate(newSchedule);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, position: number) => {
    draggedItem.current = position;
    e.dataTransfer.effectAllowed = "move";
    if (e.currentTarget) e.currentTarget.style.opacity = '0.5';
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLTableRowElement>, position: number) => {
    dragOverItem.current = position;
    if (e.currentTarget) e.currentTarget.classList.add('bg-dark-border');
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLTableRowElement>) => {
    if (e.currentTarget) e.currentTarget.classList.remove('bg-dark-border');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLTableRowElement>) => {
    if (e.currentTarget) {
        e.currentTarget.style.opacity = '1';
        const allRows = e.currentTarget.parentElement?.children;
        if (allRows) {
            for (let i = 0; i < allRows.length; i++) {
                allRows[i].classList.remove('bg-dark-border');
            }
        }
    }
  };

  const handleDrop = () => {
    if (draggedItem.current === null || dragOverItem.current === null || draggedItem.current === dragOverItem.current) return;

    const newSchedule = [...schedule];
    const draggedItemContent = newSchedule.splice(draggedItem.current, 1)[0];
    newSchedule.splice(dragOverItem.current, 0, draggedItemContent);
    
    draggedItem.current = null;
    dragOverItem.current = null;
    
    handlePlanUpdate(newSchedule);
  };

  const handleAddNewRow = () => {
    const newRow: ScheduleItem = {
      "Dia": "Novo",
      "Matéria Sugerida": "Clique para editar",
      "Tópico para Estudo": "Clique para editar",
      "Carga Horária (min)": 60,
      "Fonte Utilizada": "",
      "Rendimento %": "",
    };
    handlePlanUpdate([...schedule, newRow]);
  };

  const handleDeleteRow = (index: number) => {
    const newSchedule = schedule.filter((_, i) => i !== index);
    handlePlanUpdate(newSchedule);
  };

  const startEditing = (rowIndex: number, colKey: keyof ScheduleItem, currentText: string) => {
    if (editingCell) saveEdit(); // Save previous edit if any
    setEditingCell({ rowIndex, colKey });
    setEditText(currentText);
  };

  const saveEdit = () => {
    if (!editingCell) return;
    const { rowIndex, colKey } = editingCell;
    const newSchedule = schedule.map((row, index) => {
      if (index === rowIndex) {
        return { ...row, [colKey]: editText };
      }
      return row;
    });
    handlePlanUpdate(newSchedule);
    setEditingCell(null);
    setEditText('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditText(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveEdit();
    }
    if (e.key === 'Escape') {
      setEditingCell(null);
      setEditText('');
    }
  };

  const { countdown, performance_heatmap, latest_updates } = plan || {};

  const editableColumns: (keyof ScheduleItem)[] = ["Dia", "Matéria Sugerida", "Tópico para Estudo"];

  return (
    <div className="space-y-8">
      {isInteractive && (
          <div className="p-4 bg-dark-bg border border-dark-accent rounded-lg text-center">
              <h2 className="text-2xl font-bold text-dark-text mb-2">Meu Plano de Estudos Interativo</h2>
              <p className="text-dark-secondary-text">Arraste para reordenar, clique para editar, adicione ou remova tarefas. Suas alterações são salvas automaticamente.</p>
          </div>
      )}
      {/* Seção de Contagem Regressiva e Mapa de Calor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-dark-bg p-6 rounded-lg border border-dark-border">
          <h4 className="font-bold text-lg text-dark-accent mb-3 flex items-center gap-2"><Hourglass size={18}/>Contagem Regressiva</h4>
          <div className="text-center">
            <p className="text-5xl font-bold text-dark-text">{countdown?.days ?? '...'}</p>
            <p className="text-dark-secondary-text">dias restantes</p>
            <p className="text-2xl font-semibold text-dark-text mt-2">{countdown?.weeks ?? '...'}</p>
            <p className="text-dark-secondary-text">semanas de estudo</p>
          </div>
        </div>
        <div className="lg:col-span-2 bg-dark-bg p-6 rounded-lg border border-dark-border">
          <h4 className="font-bold text-lg text-dark-accent mb-3 flex items-center gap-2"><MapIcon size={18}/>Mapa de Calor</h4>
          {performance_heatmap && performance_heatmap.length > 0 ? (
            <ul className="space-y-2">
              {performance_heatmap.map((item, index) => (
                <li key={index} className="flex justify-between items-center bg-dark-card p-2 rounded">
                  <span className="text-dark-text">{item["Matéria"]}</span>
                  <span className={`font-mono px-2 py-1 rounded text-sm ${
                      item['% Acerto'] >= 80 ? 'bg-green-500/20 text-green-300' :
                      item['% Acerto'] >= 60 ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                  }`}>
                    {item["Status Visual"]} {item["% Acerto"]}%
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-dark-secondary-text">Dados de desempenho não fornecidos.</p>
          )}
        </div>
      </div>

      {/* Seção da Grade de Estudos */}
      <div>
        <h4 className="font-bold text-lg text-dark-accent mb-3 flex items-center gap-2"><CalendarDays size={18}/>Grade de Estudos Sugerida</h4>
        <div className="overflow-x-auto rounded-lg border border-dark-border">
          <table className="w-full text-left bg-dark-bg">
            <thead className="bg-dark-card">
              <tr>
                {schedule.length > 0 && Object.keys(schedule[0]).map(header => (
                  <th key={header} className="p-3 text-sm font-semibold text-dark-secondary-text">{header}</th>
                ))}
                 {isInteractive && schedule.length > 0 && <th className="p-3 text-sm font-semibold text-dark-secondary-text text-center">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, rowIndex) => (
                <tr 
                  key={rowIndex}
                  className={`border-t border-dark-border transition-all ${isInteractive ? 'cursor-move hover:bg-dark-card' : ''}`}
                  draggable={isInteractive}
                  onDragStart={(e) => isInteractive && handleDragStart(e, rowIndex)}
                  onDragEnter={(e) => isInteractive && handleDragEnter(e, rowIndex)}
                  onDragLeave={(e) => isInteractive && handleDragLeave(e)}
                  onDragEnd={(e) => isInteractive && handleDragEnd(e)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => isInteractive && handleDrop()}
                >
                  {Object.entries(row).map(([key, cell]) => {
                    const colKey = key as keyof ScheduleItem;
                    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.colKey === colKey;
                    const isEditable = isInteractive && editableColumns.includes(colKey);

                    return (
                      <td 
                        key={colKey} 
                        className={`p-3 text-sm text-dark-text ${isEditable ? 'cursor-pointer' : ''}`}
                        onClick={() => isEditable && !isEditing && startEditing(rowIndex, colKey, cell.toString())}
                      >
                        {isEditing ? (
                          <input
                            type="text"
                            value={editText}
                            onChange={handleInputChange}
                            onBlur={saveEdit}
                            onKeyDown={handleInputKeyDown}
                            autoFocus
                            className="w-full bg-dark-bg p-1 rounded border border-dark-accent focus:outline-none"
                          />
                        ) : (
                          cell
                        )}
                      </td>
                    );
                  })}
                  {isInteractive && (
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => handleDeleteRow(rowIndex)}
                        className="text-dark-secondary-text hover:text-error transition-colors"
                        title="Remover Tarefa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
           {schedule.length === 0 && (
              <div className="text-center p-4 text-dark-secondary-text">Nenhum cronograma de estudo disponível.</div>
            )}
        </div>
        {isInteractive && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAddNewRow}
              className="bg-dark-accent hover:bg-dark-hover text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={18} /> Adicionar Tarefa
            </button>
          </div>
        )}
      </div>

      {/* Seção de Atualizações */}
      <div>
        <h4 className="font-bold text-lg text-dark-accent mb-3 flex items-center gap-2"><Bolt size={18}/>Últimas Atualizações Relevantes</h4>
        <div className="space-y-3">
          {latest_updates && latest_updates.length > 0 ? (
            latest_updates.map((item, index) => (
              <div key={index} className="bg-dark-bg p-4 rounded-lg border border-dark-border">
                <p className="text-dark-text">{item.update}</p>
                <p className="text-xs text-dark-secondary-text mt-2">Fonte: {item.source}</p>
              </div>
            ))
          ) : (
             <div className="text-center p-4 bg-dark-bg rounded-lg border border-dark-border text-dark-secondary-text">Nenhuma atualização encontrada.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPlanDisplay;