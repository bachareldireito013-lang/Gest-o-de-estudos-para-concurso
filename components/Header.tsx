import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { Play, Pause, StopCircle, LogOut, ChevronDown, Menu } from 'lucide-react';

// --- Componente Cronômetro de Sessão Global ---
interface SessionTimerProps {
  time: number;
  isActive: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
}

const SessionTimer: React.FC<SessionTimerProps> = ({ time, isActive, onStart, onPause, onStop }) => {

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="flex items-center bg-dark-bg p-2 rounded-lg border border-dark-border">
      <span className="font-mono text-lg text-dark-text mr-4">{formatTime(time)}</span>
      <div className="flex items-center space-x-2">
        {!isActive ? (
          <button onClick={onStart} title="Iniciar" className="text-success hover:text-green-400 transition-colors">
            <Play size={18}/>
          </button>
        ) : (
          <button onClick={onPause} title="Pausar" className="text-yellow-500 hover:text-yellow-400 transition-colors">
            <Pause size={18}/>
          </button>
        )}
        <button onClick={onStop} title="Finalizar e Zerar" className="text-error hover:text-red-400 transition-colors">
          <StopCircle size={18}/>
        </button>
      </div>
    </div>
  );
};

// --- Componente Cabeçalho ---
interface HeaderProps {
  title: string;
  user: User;
  onLogout: () => void;
  timer: number;
  isTimerActive: boolean;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onStopTimer: () => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, user, onLogout, timer, isTimerActive, onStartTimer, onPauseTimer, onStopTimer, onToggleSidebar }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

  return (
    <header className="flex items-center justify-between p-4 h-16 bg-dark-card border-b border-dark-border z-20">
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="text-dark-secondary-text hover:text-dark-text transition-colors">
          <Menu size={24} />
        </button>
        <h2 className="text-xl font-semibold text-dark-text">{title}</h2>
      </div>
      <div className="flex items-center gap-6">
        <SessionTimer 
            time={timer}
            isActive={isTimerActive}
            onStart={onStartTimer}
            onPause={onPauseTimer}
            onStop={onStopTimer}
        />
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 hover:bg-dark-border p-2 rounded-lg transition-colors">
                <img src={user.avatarUrl} alt="Avatar do usuário" className="w-8 h-8 rounded-full border-2 border-dark-accent"/>
                <span className="font-medium hidden md:block">{user.name}</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-dark-card border border-dark-border rounded-lg shadow-xl py-1 z-50">
                    <button 
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2 text-sm text-dark-secondary-text hover:bg-dark-border hover:text-dark-text transition-colors flex items-center gap-3"
                    >
                        <LogOut size={16} />
                        Sair
                    </button>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;