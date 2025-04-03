import { Link, useLocation } from "wouter";
import { Calendar, Settings, User } from "lucide-react";

export function Header() {
  const [location] = useLocation();
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-semibold text-primary hover:text-primary/90 cursor-pointer">
              Sistema de Escalas Escolares
            </h1>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/schedule">
              <div className={`flex items-center text-sm font-medium ${location === '/schedule' ? 'text-primary' : 'text-gray-600 hover:text-primary'} cursor-pointer`}>
                <Calendar className="mr-2 h-4 w-4" />
                Escalas
              </div>
            </Link>
            <Link href="/settings">
              <div className={`flex items-center text-sm font-medium ${location === '/settings' ? 'text-primary' : 'text-gray-600 hover:text-primary'} cursor-pointer`}>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </div>
            </Link>
          </nav>
          
          <div className="flex space-x-2 items-center">
            <span className="text-sm text-gray-500">Olá, Administrador</span>
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
              <User className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
