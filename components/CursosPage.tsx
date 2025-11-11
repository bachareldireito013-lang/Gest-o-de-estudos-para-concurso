import React, { useState, Dispatch, SetStateAction } from 'react';
import { Course } from '../types';
import { GraduationCap, Plus, Edit, Trash2, X, Link } from 'lucide-react';

interface CourseModalProps {
  course?: Course | null;
  onSave: (course: Omit<Course, 'id'>) => void;
  onClose: () => void;
}

const CourseModal: React.FC<CourseModalProps> = ({ course, onSave, onClose }) => {
  const [title, setTitle] = useState(course?.title || '');
  const [url, setUrl] = useState(course?.url || '');
  const [progress, setProgress] = useState(course?.progress || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, url, progress: Number(progress) });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-dark-card w-full max-w-lg rounded-lg border border-dark-border p-8 m-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-dark-accent">{course ? 'Editar Curso' : 'Adicionar Curso'}</h2>
            <button type="button" onClick={onClose} className="text-dark-secondary-text hover:text-dark-text"><X /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-dark-secondary-text mb-1">Título do Curso</label>
              <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Curso Completo de Direito Administrativo" required className="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-dark-text" />
            </div>
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-dark-secondary-text mb-1">URL (Link)</label>
              <input id="url" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.cursoparaconcurso.com.br/..." required className="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-dark-text" />
            </div>
            <div>
              <label htmlFor="progress" className="block text-sm font-medium text-dark-secondary-text mb-1">Progresso ({progress}%)</label>
              <input id="progress" type="range" min="0" max="100" value={progress} onChange={e => setProgress(Number(e.target.value))} className="w-full h-2 bg-dark-border rounded-lg appearance-none cursor-pointer accent-dark-accent" />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-dark-secondary-text hover:bg-dark-border">Cancelar</button>
            <button type="submit" className="bg-dark-accent hover:bg-dark-hover px-4 py-2 rounded-lg text-white font-bold">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};


interface CourseCardProps {
    course: Course;
    onEdit: (course: Course) => void;
    onDelete: (id: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onEdit, onDelete }) => (
    <div className="bg-dark-card p-6 rounded-lg border border-dark-border flex flex-col justify-between">
        <div>
            <h3 className="text-lg font-semibold text-dark-text mb-3">{course.title}</h3>
            <div className="flex justify-between items-center text-sm text-dark-secondary-text mb-2">
                <span>Progresso</span>
                <span>{course.progress}%</span>
            </div>
            <div className="w-full bg-dark-border rounded-full h-2.5">
                <div className="bg-dark-accent h-2.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
            </div>
        </div>
        <div className="flex justify-between items-center mt-4 border-t border-dark-border pt-4">
             <a href={course.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-dark-accent hover:underline">
                <Link size={16} /> Acessar Curso
             </a>
            <div className="flex gap-2">
                <button onClick={() => onEdit(course)} className="p-2 text-dark-secondary-text hover:text-dark-accent"><Edit size={16} /></button>
                <button onClick={() => onDelete(course.id)} className="p-2 text-dark-secondary-text hover:text-error"><Trash2 size={16} /></button>
            </div>
        </div>
    </div>
);


interface CursosPageProps {
  courses: Course[];
  setCourses: Dispatch<SetStateAction<Course[]>>;
}

export const CursosPage: React.FC<CursosPageProps> = ({ courses, setCourses }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const handleSaveCourse = (courseData: Omit<Course, 'id'>) => {
    if (editingCourse) {
      setCourses(courses.map(c => c.id === editingCourse.id ? { ...editingCourse, ...courseData } : c));
    } else {
      const newCourse: Course = { id: `course-${Date.now()}`, ...courseData };
      setCourses([...courses, newCourse]);
    }
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dark-text flex items-center gap-3">
          <GraduationCap className="text-dark-accent" />Cursos e Aulas
        </h1>
        <button onClick={() => { setEditingCourse(null); setIsModalOpen(true); }} className="bg-dark-accent hover:bg-dark-hover text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
          <Plus size={18} /> Adicionar Curso
        </button>
      </div>

       {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} onEdit={(c) => { setEditingCourse(c); setIsModalOpen(true); }} onDelete={handleDeleteCourse} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-dark-card rounded-lg border border-dark-border">
          <GraduationCap className="mx-auto h-16 w-16 text-dark-accent mb-4" />
          <h2 className="text-2xl font-bold text-dark-text mb-2">Sua Biblioteca de Cursos</h2>
          <p className="text-dark-secondary-text">Adicione seu primeiro curso para começar a organizar seu material de estudo.</p>
        </div>
      )}

      {isModalOpen && <CourseModal course={editingCourse} onSave={handleSaveCourse} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};
