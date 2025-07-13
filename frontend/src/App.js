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
  const [showUpdates, setShowUpdates] = useState(false);
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
        resetForm();
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
        resetForm();
        alert('App editado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao editar app:', error);
      alert('Erro ao editar app');
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

  const resetForm = () => {
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
  };

  const formatDownloads = (downloads) => {
    if (downloads >= 1000000) {
      return `${(downloads / 1000000).toFixed(1)}M+`;
    } else if (downloads >= 1000) {
      return `${(downloads / 1000).toFixed(1)}K+`;
    }
    return downloads.toString();
  };

  const getStarRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`text-sm ${i < fullStars ? 'text-yellow-400' : i === fullStars && hasHalfStar ? 'text-yellow-400' : 'text-gray-400'}`}>
            {i < fullStars ? '★' : i === fullStars && hasHalfStar ? '★' : '☆'}
          </span>
        ))}
        <span className="text-xs text-gray-400 ml-1">{rating}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <div className="text-red-500 text-xl font-semibold">Carregando Play Modz Pro...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-red-900 to-black shadow-2xl border-b border-red-800/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">P</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Play Modz Pro</h1>
                <p className="text-red-300 text-sm">Sua loja de apps modificados</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowUpdates(!showUpdates)}
                className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🔄 Atualizações
              </button>
              <button
                onClick={() => setShowAdmin(!showAdmin)}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
              >
                👤 Admin
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Updates Section */}
      {showUpdates && (
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
          <div className="max-w-7xl mx-auto p-4">
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/20">
              <h2 className="text-xl font-bold mb-4 text-blue-300">🆕 Atualizações Disponíveis</h2>
              <div className="grid gap-3">
                {apps.slice(0, 3).map(app => (
                  <div key={app.id} className="flex items-center justify-between bg-black/30 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <img src={app.icon_url} alt={app.name} className="w-10 h-10 rounded-lg" onError={(e) => e.target.src = 'https://via.placeholder.com/40x40/dc2626/ffffff?text=APP'} />
                      <div>
                        <div className="font-semibold">{app.name}</div>
                        <div className="text-xs text-gray-400">Nova versão {app.version}</div>
                      </div>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors">
                      Atualizar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {showAdmin && (
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
          {!isAuthenticated ? (
            <div className="max-w-md mx-auto p-6">
              <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 rounded-xl p-6 border border-red-500/20">
                <h2 className="text-xl font-bold mb-4 text-red-300">🔐 Login Administrativo</h2>
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="Digite a senha"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none transition-colors"
                    onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                  />
                  <button
                    onClick={handleAdminLogin}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 px-4 py-3 rounded-lg transition-all duration-300 font-semibold"
                  >
                    Entrar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto p-6">
              <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-xl p-6 border border-green-500/20">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-green-300">⚙️ Painel Administrativo</h2>
                  <button
                    onClick={() => setShowAddApp(true)}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                  >
                    ➕ Adicionar App
                  </button>
                </div>
                
                {/* Add/Edit App Form */}
                {(showAddApp || editingApp) && (
                  <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-600">
                    <h3 className="text-lg font-bold mb-4 text-blue-300">
                      {editingApp ? '✏️ Editar App' : '➕ Adicionar Novo App'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Nome do App"
                        value={newApp.name}
                        onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="Versão"
                        value={newApp.version}
                        onChange={(e) => setNewApp({ ...newApp, version: e.target.value })}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                      <select
                        value={newApp.category}
                        onChange={(e) => setNewApp({ ...newApp, category: e.target.value })}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                      >
                        <option value="jogos">🎮 Jogos</option>
                        <option value="aplicativos">📱 Aplicativos</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Desenvolvedor"
                        value={newApp.developer}
                        onChange={(e) => setNewApp({ ...newApp, developer: e.target.value })}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="URL do Ícone"
                        value={newApp.icon_url}
                        onChange={(e) => setNewApp({ ...newApp, icon_url: e.target.value })}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="URL do APK"
                        value={newApp.apk_url}
                        onChange={(e) => setNewApp({ ...newApp, apk_url: e.target.value })}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="Tamanho (ex: 100 MB)"
                        value={newApp.size}
                        onChange={(e) => setNewApp({ ...newApp, size: e.target.value })}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                      <input
                        type="number"
                        placeholder="Rating (1-5)"
                        min="1"
                        max="5"
                        step="0.1"
                        value={newApp.rating}
                        onChange={(e) => setNewApp({ ...newApp, rating: parseFloat(e.target.value) })}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <textarea
                      placeholder="Descrição detalhada do app"
                      value={newApp.description}
                      onChange={(e) => setNewApp({ ...newApp, description: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 mt-4 focus:border-blue-500 focus:outline-none transition-colors"
                      rows="3"
                    />
                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={editingApp ? handleEditApp : handleAddApp}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 px-6 py-3 rounded-lg transition-all duration-300 font-semibold"
                      >
                        {editingApp ? '💾 Salvar Edição' : '➕ Adicionar App'}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddApp(false);
                          setEditingApp(null);
                          resetForm();
                        }}
                        className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 px-6 py-3 rounded-lg transition-all duration-300 font-semibold"
                      >
                        ❌ Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category Filter */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600'
              }`}
            >
              🏠 Todos
            </button>
            <button
              onClick={() => setSelectedCategory('jogos')}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === 'jogos'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600'
              }`}
            >
              🎮 Jogos
            </button>
            <button
              onClick={() => setSelectedCategory('aplicativos')}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === 'aplicativos'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600'
              }`}
            >
              📱 Aplicativos
            </button>
          </div>
        </div>
      </div>

      {/* Apps Grid */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-500 transform hover:-translate-y-2 border border-gray-700/50 backdrop-blur-sm"
            >
              <div className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="relative">
                    <img
                      src={app.icon_url}
                      alt={app.name}
                      className="w-16 h-16 rounded-2xl object-cover shadow-lg group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/64x64/dc2626/ffffff?text=APP';
                      }}
                    />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-800"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-white mb-1 truncate group-hover:text-red-300 transition-colors">
                      {app.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2">{app.developer}</p>
                    {getStarRating(app.rating)}
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">{app.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {formatDownloads(app.downloads)} downloads
                  </span>
                  <span className="bg-gray-700/50 px-2 py-1 rounded-full text-xs">{app.size}</span>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handleDownload(app)}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/30 group-hover:animate-pulse"
                  >
                    📥 Download
                  </button>
                  
                  {isAuthenticated && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(app)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-3 py-2 rounded-lg transition-all duration-300 text-sm font-semibold"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeleteApp(app.id)}
                        className="flex-1 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 text-white px-3 py-2 rounded-lg transition-all duration-300 text-sm font-semibold"
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredApps.length === 0 && (
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-2xl p-12 border border-gray-700/50">
              <div className="text-6xl mb-4">📱</div>
              <p className="text-xl text-gray-400 mb-2">Nenhum app encontrado nesta categoria</p>
              <p className="text-gray-500">Tente selecionar uma categoria diferente</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-black to-gray-900 border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto text-center p-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="text-xl font-bold text-white">Play Modz Pro</span>
          </div>
          <p className="text-gray-400">
            © 2025 Play Modz Pro - Sua loja de apps modificados premium
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Desenvolvido com ❤️ para entusiastas de apps modificados
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;