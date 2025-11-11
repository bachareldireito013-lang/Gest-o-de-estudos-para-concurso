import React from 'react';
import { Page, navItems } from '../types';
import {
  LayoutDashboard, BrainCircuit, Trophy, CalendarDays, BookOpenText,
  RefreshCw, Target, GraduationCap, PenSquare, FileWarning, CheckSquare,
  PieChart, BarChart3, History, Bell, ShieldCheck, LucideProps
} from 'lucide-react';

const iconComponents: { [key: string]: React.FC<LucideProps> } = {
  LayoutDashboard, BrainCircuit, Trophy, CalendarDays, BookOpenText,
  RefreshCw, Target, GraduationCap, PenSquare, FileWarning, CheckSquare,
  PieChart, BarChart3, History, Bell, ShieldCheck,
};

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isOpen }) => {
  return (
    <div className={`fixed top-0 left-0 h-full bg-dark-card border-r border-dark-border flex flex-col transition-all duration-300 z-30 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className={`flex items-center h-16 border-b border-dark-border ${isOpen ? 'px-4' : 'justify-center'}`}>
        {isOpen ? (
            <div className="flex items-center gap-2">
                <Trophy className="text-dark-accent" size={24}/>
                <h1 className="text-xl font-bold text-dark-text">Gestor de Estudos</h1>
            </div>
        ) : (
            <Trophy className="text-dark-accent" size={24}/>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        <ul>
          {navItems.map((item) => {
            const Icon = iconComponents[item.icon];
            return (
              <li key={item.id} className="px-3">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(item.id);
                  }}
                  className={`flex items-center py-3 my-1 rounded-md transition-all duration-200 group ${
                    currentPage === item.id 
                      ? 'bg-dark-accent text-white shadow-lg' 
                      : 'text-dark-secondary-text hover:bg-dark-border hover:text-dark-text'
                  } ${isOpen ? 'px-4' : 'justify-center'}`}
                  title={item.label}
                >
                  {Icon && <Icon className={`transition-transform duration-200 group-hover:scale-110 ${isOpen ? 'mr-3' : 'text-2xl'}`} size={20} />}
                  {isOpen && <span className="font-medium">{item.label}</span>}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;