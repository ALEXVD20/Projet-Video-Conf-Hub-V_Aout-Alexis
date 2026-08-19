import { Link, NavLink } from 'react-router-dom';

const BarreNavigation = () => (
    <nav className="bg-[#0f131c]/90 backdrop-blur-md border-b border-[#232a3b] fixed w-full z-30 top-0 left-0 px-6 py-4 flex justify-between items-center shadow-lg">
        <Link to="/" className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
            VideoConf Hub
        </Link>
        <div className="flex space-x-6">
            <NavLink
                to="/"
                className={({ isActive }) =>
                    isActive ? "text-blue-500 font-semibold" : "text-gray-400 hover:text-blue-400 transition-colors"
                }
            >
                Accueil
            </NavLink>
            <NavLink
                to="/recherche"
                className={({ isActive }) =>
                    isActive ? "text-blue-500 font-semibold" : "text-gray-400 hover:text-blue-400 transition-colors"
                }
            >
                Recherche
            </NavLink>
            <NavLink
                to="/a-voir"
                className={({ isActive }) =>
                    isActive ? "text-blue-500 font-semibold" : "text-gray-400 hover:text-blue-400 transition-colors"
                }
            >
                À voir plus tard
            </NavLink>
            <NavLink
                to="/historique"
                className={({ isActive }) =>
                    isActive ? "text-blue-500 font-semibold" : "text-gray-400 hover:text-blue-400 transition-colors"
                }
            >
                Historique
            </NavLink>
        </div>
    </nav>
);

export default BarreNavigation;