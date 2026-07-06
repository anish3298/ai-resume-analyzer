import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, FileText, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 backdrop-blur bg-white/80 dark:bg-gray-900/80 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary-600">
          <FileText size={22} />
          ResumeAI
        </Link>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <Link
                to="/dashboard"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600"
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600"
                >
                  <ShieldCheck size={16} /> Admin
                </Link>
              )}
            </>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user ? (
            <button onClick={handleLogout} className="btn-secondary flex items-center gap-1.5 text-sm">
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <Link to="/login" className="btn-primary text-sm">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
