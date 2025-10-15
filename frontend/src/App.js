import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Bungalows from './pages/Bungalows';
import BungalowDetay from './pages/BungalowDetay';
import Customers from './pages/Customers';
import Reservations from './pages/Reservations';
import CreateReservation from './pages/CreateReservation';
import ReservationDetail from './pages/ReservationDetail';
import ReservationEdit from './pages/ReservationEdit';
import ReservationConfirmation from './pages/ReservationConfirmation';
import MailTemplates from './pages/MailTemplates';
import Reports from './pages/Reports';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          // Token'ı backend'de doğrula
          const response = await fetch('http://localhost:8000/api/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setUser(data.user);
              setIsAuthenticated(true);
            } else {
              // Token geçersiz, temizle
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user');
            }
          } else {
            // Token geçersiz, temizle
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Auth check error:', error);
          // Hata durumunda temizle
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      // Revoke remember token if exists
      const rememberToken = localStorage.getItem('remember_token');
      if (rememberToken) {
        try {
          await fetch('http://localhost:8000/api/revoke-remember-token', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ remember_token: rememberToken }),
          });
        } catch (error) {
          console.log('Could not revoke remember token:', error);
        }
      }
      
      // Backend'e logout isteği gönder
      const token = localStorage.getItem('auth_token');
      if (token) {
        await fetch('http://localhost:8000/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Local storage'ı temizle
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      // Remember me seçilmemişse kaydedilmiş bilgileri de temizle
      const rememberMe = localStorage.getItem('remember_me') === 'true';
      if (!rememberMe) {
        localStorage.removeItem('remember_token');
        localStorage.removeItem('remember_token_expires');
        localStorage.removeItem('saved_email');
        localStorage.removeItem('saved_password');
        localStorage.removeItem('remember_me');
      }
      
      // State'i güncelle
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider position="top-right" maxToasts={5}>
      <Router
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true
        }}
      >
        <div className="App">
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <Dashboard user={user} onLogout={handleLogout} />
                  </Layout>
                ) : (
                  <LoginForm onLoginSuccess={handleLoginSuccess} />
                )
              } 
            />
            <Route 
              path="/profile" 
              element={
                isAuthenticated ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <Profile user={user} onLogout={handleLogout} />
                  </Layout>
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/settings" 
              element={
                isAuthenticated ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <Settings user={user} onLogout={handleLogout} />
                  </Layout>
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/bungalows" 
              element={
                isAuthenticated ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <Bungalows user={user} onLogout={handleLogout} />
                  </Layout>
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/bungalows/:id" 
              element={
                isAuthenticated ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <BungalowDetay user={user} onLogout={handleLogout} />
                  </Layout>
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/customers" 
              element={
                isAuthenticated ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <Customers user={user} onLogout={handleLogout} />
                  </Layout>
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/reservations" 
              element={
                isAuthenticated ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <Reservations user={user} onLogout={handleLogout} />
                  </Layout>
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/reservations/create" 
              element={
                isAuthenticated ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <CreateReservation user={user} onLogout={handleLogout} />
                  </Layout>
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/reservations/:id" 
              element={
                isAuthenticated ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <ReservationDetail user={user} onLogout={handleLogout} />
                  </Layout>
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/reservations/:id/edit" 
              element={
                isAuthenticated ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <ReservationEdit user={user} onLogout={handleLogout} />
                  </Layout>
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/confirm/:confirmationCode" 
              element={<ReservationConfirmation />} 
            />
            <Route 
              path="/mail-templates" 
              element={
                isAuthenticated ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <MailTemplates user={user} onLogout={handleLogout} />
                  </Layout>
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/reports" 
              element={
                isAuthenticated ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <Reports user={user} onLogout={handleLogout} />
                  </Layout>
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
