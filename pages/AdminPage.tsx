
import React, { useState, useEffect } from 'react';
import { AI_NAME } from '../constants';
import { UserCircleIcon } from '../components/icons/UserCircleIcon'; 
import { TrashIcon } from '../components/icons/TrashIcon';

const EditIconFC: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);
const PlusIconFC: React.FC<{className?: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
     <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);


interface MockUser {
  id: string;
  username: string;
  password?: string; 
}

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<MockUser[]>(() => {
    const savedUsers = localStorage.getItem('luxoreAdminMockUsers');
    return savedUsers ? JSON.parse(savedUsers) : [
      { id: 'admin-001', username: 'admin', password: 'admin' },
      { id: 'user-002', username: 'testuser1', password: 'password1' },
      { id: 'user-003', username: 'testuser2', password: 'password2' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('luxoreAdminMockUsers', JSON.stringify(users));
  }, [users]);

  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [editingUser, setEditingUser] = useState<MockUser | null>(null);
  const [editingPassword, setEditingPassword] = useState('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim() && newPassword.trim()) {
      if (users.find(u => u.username === newUsername.trim())) {
        alert("El nombre de usuario ya existe.");
        return;
      }
      setUsers([...users, { 
        id: `user-${Date.now()}`, 
        username: newUsername.trim(),
        password: newPassword.trim() 
      }]);
      setNewUsername('');
      setNewPassword('');
      setShowAddUserForm(false);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === 'admin-001') {
      alert("No se puede eliminar al usuario administrador principal.");
      return;
    }
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario? Esta acción es simulada y solo afectará esta sesión.")) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleOpenChangePasswordModal = (user: MockUser) => {
    setEditingUser(user);
    setEditingPassword(user.password || ''); 
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser && editingPassword.trim()) {
      setUsers(users.map(u => 
        u.id === editingUser.id ? { ...u, password: editingPassword.trim() } : u
      ));
      setEditingUser(null);
      setEditingPassword('');
    }
  };
  
  const theme = typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light';

  return (
    <div className={`h-full flex flex-col p-4 md:p-6 overflow-y-auto ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900'}`}>
      <h1 className={`text-2xl md:text-3xl font-bold mb-6 ${theme === 'light' ? 'text-accentBlue-700' : 'text-accentBlue-400'}`}>Panel de Administración de ${AI_NAME}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Management Section */}
        <div className={`p-6 rounded-lg shadow-lg ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>Gestión de Usuarios (Simulada)</h2>
            <button 
              onClick={() => setShowAddUserForm(!showAddUserForm)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center transition-colors ${
                theme === 'light' 
                ? 'bg-accentBlue-600 text-white hover:bg-accentBlue-700' 
                : 'bg-accentBlue-500 text-white hover:bg-accentBlue-600'
              }`}
            >
              <PlusIconFC className="w-4 h-4 mr-1.5" />
              {showAddUserForm ? 'Cancelar' : 'Añadir Usuario'}
            </button>
          </div>

          {showAddUserForm && (
            <form onSubmit={handleAddUser} className={`mb-6 p-4 border rounded-md ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-700 border-slate-600'}`}>
              <div className="mb-3">
                <label className={`block text-xs font-medium mb-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Nuevo Usuario:</label>
                <input 
                  type="text" 
                  value={newUsername} 
                  onChange={(e) => setNewUsername(e.target.value)} 
                  placeholder="Nombre de usuario"
                  className={`w-full p-2 text-sm border rounded-md ${theme === 'light' ? 'bg-white border-slate-300 focus:ring-accentBlue-500 focus:border-accentBlue-500' : 'bg-slate-600 border-slate-500 text-white focus:ring-accentBlue-500 focus:border-accentBlue-500'}`}
                  required 
                />
              </div>
              <div className="mb-3">
                <label className={`block text-xs font-medium mb-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Contraseña:</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Contraseña"
                  className={`w-full p-2 text-sm border rounded-md ${theme === 'light' ? 'bg-white border-slate-300 focus:ring-accentBlue-500 focus:border-accentBlue-500' : 'bg-slate-600 border-slate-500 text-white focus:ring-accentBlue-500 focus:border-accentBlue-500'}`}
                  required 
                />
              </div>
              <button type="submit" className={`w-full px-3 py-1.5 text-sm font-medium rounded-md ${theme === 'light' ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                Guardar Usuario
              </button>
            </form>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {users.map(user => (
              <div key={user.id} className={`p-3 border rounded-md flex items-center justify-between ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-700/50 border-slate-600'}`}>
                <div className="flex items-center">
                  <UserCircleIcon className={`w-6 h-6 mr-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`} />
                  <div>
                    <p className={`font-medium text-sm ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>{user.username}</p>
                    {user.password && <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Pass (sim): {user.password}</p>}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleOpenChangePasswordModal(user)}
                    className={`p-1.5 rounded-md transition-colors ${theme === 'light' ? 'text-blue-500 hover:bg-blue-100' : 'text-blue-400 hover:bg-slate-600'}`} title="Cambiar Contraseña (Simulado)">
                    <EditIconFC className="w-4 h-4" />
                  </button>
                  {user.id !== 'admin-001' && (
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className={`p-1.5 rounded-md transition-colors ${theme === 'light' ? 'text-red-500 hover:bg-red-100' : 'text-red-400 hover:bg-slate-600'}`} title="Eliminar Usuario (Simulado)">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className={`mt-4 text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            Nota: La gestión de usuarios es simulada y los cambios no son permanentes. Se requiere un backend para funcionalidad completa y segura.
          </p>
        </div>

        {/* Statistics Section */}
        <div className={`p-6 rounded-lg shadow-lg ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <h2 className={`text-xl font-semibold mb-4 ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>Estadísticas y Configuración</h2>
          <div className={`p-4 border rounded-md ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-700 border-slate-600'}`}>
            <p className={`text-lg font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>Usuarios Registrados (Simulados): {users.length}</p>
          </div>
          <div className={`mt-4 p-4 border rounded-md ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-700 border-slate-600'}`}>
            <h3 className={`text-md font-semibold mb-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>Estadísticas de Uso por Usuario:</h3>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              Esta funcionalidad requiere un backend completo para registrar y analizar la actividad de los usuarios.
            </p>
          </div>
           <div className={`mt-4 p-4 border rounded-md ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-700 border-slate-600'}`}>
            <h3 className={`text-md font-semibold mb-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>Fotos de Perfil de Usuario:</h3>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              La capacidad para que los usuarios suban y cambien su foto de perfil requiere un backend para el almacenamiento seguro de archivos.
            </p>
          </div>
        </div>
      </div>

      {/* Modal for Changing Password */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`p-6 rounded-lg shadow-xl w-full max-w-md ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>Cambiar Contraseña para {editingUser.username}</h3>
            <form onSubmit={handleChangePassword}>
              <label className={`block text-sm font-medium mb-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Nueva Contraseña:</label>
              <input 
                type="password" 
                value={editingPassword} 
                onChange={(e) => setEditingPassword(e.target.value)}
                className={`w-full p-2 border rounded-md mb-4 ${theme === 'light' ? 'bg-white border-slate-300 focus:ring-accentBlue-500 focus:border-accentBlue-500' : 'bg-slate-600 border-slate-500 text-white focus:ring-accentBlue-500 focus:border-accentBlue-500'}`}
                required 
              />
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${theme === 'light' ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-600 text-slate-200 hover:bg-slate-500'}`}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${theme === 'light' ? 'bg-accentBlue-600 text-white hover:bg-accentBlue-700' : 'bg-accentBlue-500 text-white hover:bg-accentBlue-600'}`}
                >
                  Guardar Cambios (Simulado)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
