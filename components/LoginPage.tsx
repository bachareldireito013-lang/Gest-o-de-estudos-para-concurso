import React from 'react';
import { Trophy, Loader } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
  isLoggingIn: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, isLoggingIn }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-bg text-dark-text p-4">
      <div className="text-center p-8 max-w-lg w-full bg-dark-card border border-dark-border rounded-2xl shadow-2xl">
        <div className="flex justify-center items-center mb-6">
            <Trophy className="h-16 w-16 text-dark-accent" />
        </div>
        <h1 className="text-4xl font-bold mb-2 text-dark-text">Gestor de Estudos Inteligente</h1>
        <p className="text-dark-secondary-text mb-8 max-w-md mx-auto">Sua jornada para a aprovação começa aqui. Organize seus estudos de forma inteligente e conquiste seu cargo.</p>
        <button
          onClick={onLogin}
          disabled={isLoggingIn}
          className="bg-white text-gray-800 font-semibold py-3 px-6 rounded-lg flex items-center justify-center w-full max-w-xs mx-auto hover:bg-gray-200 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isLoggingIn ? (
            <>
              <Loader className="animate-spin w-6 h-6 mr-4" />
              Autenticando...
            </>
          ) : (
            <>
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google logo" className="w-6 h-6 mr-4" />
              Entrar com o Google
            </>
          )}
        </button>
      </div>
       <p className="text-sm text-dark-secondary-text mt-8">
         &copy; {new Date().getFullYear()} Gestor de Estudos. Todos os direitos reservados.
      </p>
    </div>
  );
};

export default LoginPage;