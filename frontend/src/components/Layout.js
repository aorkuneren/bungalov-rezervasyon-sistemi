import React from 'react';
import Navigation from './Navigation';

const Layout = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Top Navigation */}
      <Navigation user={user} onLogout={onLogout} />
      
      {/* Main Content Area with padding for fixed navigation */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};

export default Layout;
