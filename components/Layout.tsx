import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Users, DollarSign, Calendar } from 'lucide-react';

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20 md:pb-0">
      <header className="bg-brand-600 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            ProfBanca
          </h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 max-w-2xl">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20 md:static md:bg-transparent md:border-0 md:shadow-none md:mt-4">
        <div className="flex justify-around md:justify-center md:gap-8 p-2 md:p-0">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `flex flex-col items-center p-2 rounded-lg transition-colors ${isActive ? 'text-brand-600 md:bg-brand-100' : 'text-gray-500 hover:text-brand-600'}`
            }
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Hoje</span>
          </NavLink>
          
          <NavLink 
            to="/students" 
            className={({ isActive }) => 
              `flex flex-col items-center p-2 rounded-lg transition-colors ${isActive ? 'text-brand-600 md:bg-brand-100' : 'text-gray-500 hover:text-brand-600'}`
            }
          >
            <Users className="w-6 h-6" />
            <span className="text-xs mt-1">Alunos</span>
          </NavLink>

          <NavLink 
            to="/billing" 
            className={({ isActive }) => 
              `flex flex-col items-center p-2 rounded-lg transition-colors ${isActive ? 'text-brand-600 md:bg-brand-100' : 'text-gray-500 hover:text-brand-600'}`
            }
          >
            <DollarSign className="w-6 h-6" />
            <span className="text-xs mt-1">Cobrança</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default Layout;