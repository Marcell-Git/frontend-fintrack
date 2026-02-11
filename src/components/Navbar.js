import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { GrMoney } from "react-icons/gr";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md transition-all duration-300">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="text-xl bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl p-2.5 shadow-lg shadow-indigo-200 transition-transform group-hover:scale-110 duration-200">
            <GrMoney className="text-white text-lg" />
          </div>
          <div className="text-xl font-bold text-gray-800 tracking-tight">
            Fin<span className="text-indigo-600">Track</span>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          
          <div className="flex items-center gap-3 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-full p-1.5 pr-2 md:pr-4 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
            <div className="bg-white p-2 rounded-full shadow-sm text-indigo-500">
              <FaUser size={14} />
            </div>
            <p className="font-semibold text-sm text-gray-600 hidden md:block">
              Rizky Hasan
            </p>
          </div>

          <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

          <button className="group flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50">
            <FaSignOutAlt className="text-lg group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-semibold text-sm hidden md:block">Logout</span>
          </button>
          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;