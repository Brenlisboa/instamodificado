import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [apps, setApps] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAddApp, setShowAddApp] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newApp, setNewApp] = useState({
    name: '',
    description: '',
    version: '',
    category: 'jogos',
    icon_url: '',
    apk_url: '',
    size: '',
    developer: '',
    rating: 4.5
  });

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredApps(apps);
    } else {
      setFilteredApps(apps.filter(app => app.category === selectedCategory));
    }
  }, [apps, selectedCategory]);

  const fetchApps = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/apps`);
      const data = await response.json();
      setApps(data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar apps:', error);
      setLoading(false);
    }
  };

  const handleDownload = async (app) => {
    try {
      // Track download
      await fetch(`${API_BASE_URL}/api/apps/${app.id}/download`, {
        method: 'POST'
      });
      
      // Open APK URL
      window.open(app.apk_url, '_blank');
      
      // Update local state
      setApps(apps.map(a => 
        a.id === app.id ? { ...a, downloads: a.downloads + 1 } : a
      ));
    } catch (error) {
      console.error('Erro ao fazer download:', error);
    }
  };

  const handleAdminLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: adminPassword })
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setAdminPassword('');
      } else {
        alert('Senha incorreta!');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro ao fazer login');
    }
  };

  const handleAddApp = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/apps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newApp)
      });

      if (response.ok) {
        const createdApp = await response.json();
        setApps([...apps, createdApp]);
        setNewApp({
          name: '',
          description: '',
          version: '',
          category: 'jogos',
          icon_url: '',
          apk_url: '',
          size: '',
          developer: '',
          rating: 4.5
        });
        setShowAddApp(false);
      }
    } catch (error) {
      console.error('Erro ao adicionar app:', error);
    }
  };

  const handleEditApp = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/apps/${editingApp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newApp)
      });

      if (response.ok) {
        const updatedApp = await response.json();
        setApps(apps.map(app => app.id === editingApp.id ? updatedApp : app));
        setEditingApp(null);
        setNewApp({
          name: '',
          description: '',
          version: '',
          category: 'jogos',
          icon_url: '',
          apk_url: '',
          size: '',
          developer: '',
          rating: 4.5
        });
      }
    } catch (error) {
      console.error('Erro ao editar app:', error);
    }
  };

  const handleDeleteApp = async (appId) => {
    if (window.confirm('Tem certeza que deseja excluir este app?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/apps/${appId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setApps(apps.filter(app => app.id !== appId));
        }
      } catch (error) {
        console.error('Erro ao excluir app:', error);
      }
    }
  };

  const startEdit = (app) => {
    setEditingApp(app);
    setNewApp({
      name: app.name,
      description: app.description,
      version: app.version,
      category: app.category,
      icon_url: app.icon_url,
      apk_url: app.apk_url,
      size: app.size,
      developer: app.developer,
      rating: app.rating
    });
  };

  const formatDownloads = (downloads) => {
    if (downloads >= 1000000) {
      return `${(downloads / 1000000).toFixed(1)}M+`;
    } else if (downloads >= 1000) {
      return `${(downloads / 1000).toFixed(1)}K+`;
    }
    return downloads.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-black to-red-900 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Play Modz Pro</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAdmin(!showAdmin)}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
            >
              Admin
            </button>
          </div>
        </div>
      </header>

      {/* Admin Panel */}
      {showAdmin && (
        <div className="bg-gray-900 p-4">
          {!isAuthenticated ? (
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-bold mb-4">Login Administrativo</h2>
              <div className="flex space-x-2">
                <input
                  type="password"
                  placeholder="Senha"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2"
                />
                <button
                  onClick={handleAdminLogin}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
                >
                  Entrar
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Painel Administrativo</h2>
                <button
                  onClick={() => setShowAddApp(true)}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors"
                >
                  Adicionar App
                </button>
              </div>
              
              {/* Add/Edit App Form */}
              {(showAddApp || editingApp) && (
                <div className="bg-gray-800 p-4 rounded-lg mb-4">
                  <h3 className="text-lg font-bold mb-4">
                    {editingApp ? 'Editar App' : 'Adicionar Novo App'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nome do App"
                      value={newApp.name}
                      onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Versão"
                      value={newApp.version}
                      onChange={(e) => setNewApp({ ...newApp, version: e.target.value })}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    />
                    <select
                      value={newApp.category}
                      onChange={(e) => setNewApp({ ...newApp, category: e.target.value })}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    >
                      <option value="jogos">Jogos</option>
                      <option value="aplicativos">Aplicativos</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Desenvolvedor"
                      value={newApp.developer}
                      onChange={(e) => setNewApp({ ...newApp, developer: e.target.value })}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="URL do Ícone"
                      value={newApp.icon_url}
                      onChange={(e) => setNewApp({ ...newApp, icon_url: e.target.value })}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="URL do APK"
                      value={newApp.apk_url}
                      onChange={(e) => setNewApp({ ...newApp, apk_url: e.target.value })}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Tamanho (ex: 100 MB)"
                      value={newApp.size}
                      onChange={(e) => setNewApp({ ...newApp, size: e.target.value })}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    />
                    <input
                      type="number"
                      placeholder="Rating (1-5)"
                      min="1"
                      max="5"
                      step="0.1"
                      value={newApp.rating}
                      onChange={(e) => setNewApp({ ...newApp, rating: parseFloat(e.target.value) })}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    />
                  </div>
                  <textarea
                    placeholder="Descrição"
                    value={newApp.description}
                    onChange={(e) => setNewApp({ ...newApp, description: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 mt-4"
                    rows="3"
                  />
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={editingApp ? handleEditApp : handleAddApp}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors"
                    >
                      {editingApp ? 'Salvar' : 'Adicionar'}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddApp(false);
                        setEditingApp(null);
                        setNewApp({
                          name: '',
                          description: '',
                          version: '',
                          category: 'jogos',
                          icon_url: '',
                          apk_url: '',
                          size: '',
                          developer: '',
                          rating: 4.5
                        });
                      }}
                      className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Category Filter */}
      <div className="bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedCategory('jogos')}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === 'jogos'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Jogos
            </button>
            <button
              onClick={() => setSelectedCategory('aplicativos')}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === 'aplicativos'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Aplicativos
            </button>
          </div>
        </div>
      </div>

      {/* Apps Grid */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-start space-x-3 mb-3">
                  <img
                    src={app.icon_url}
                    alt={app.name}
                    className="w-16 h-16 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/64x64/dc2626/ffffff?text=APP';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-white mb-1">{app.name}</h3>
                    <p className="text-gray-400 text-sm">{app.developer}</p>
                    <div className="flex items-center mt-1">
                      <div className="flex text-yellow-400">
                        {'★'.repeat(Math.floor(app.rating))}
                        {'☆'.repeat(5 - Math.floor(app.rating))}
                      </div>
                      <span className="text-gray-400 text-sm ml-2">{app.rating}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">{app.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <span>{formatDownloads(app.downloads)} downloads</span>
                  <span>{app.size}</span>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(app)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Download
                  </button>
                  {isAuthenticated && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => startEdit(app)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteApp(app.id)}
                        className="bg-red-800 hover:bg-red-900 text-white px-3 py-2 rounded transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredApps.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <p className="text-xl">Nenhum app encontrado nesta categoria.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-center p-4 mt-8">
        <p className="text-gray-400">
          © 2025 Play Modz Pro - Sua loja de apps modificados
        </p>
      </footer>
    </div>
  );
}

export default App;