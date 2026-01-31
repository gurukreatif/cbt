
import React, { useState } from 'react';
import LandingPage from './LandingPage.tsx';
import LoginPage from './LoginPage.tsx';
import { UserRole } from '../types.ts';

interface PublicPortalProps {
  onLoginSuccess: (user: any, role: UserRole) => void;
}

const PublicPortal: React.FC<PublicPortalProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<'landing' | 'login'>('landing');

  if (view === 'login') {
    // Fix: Pass the required onBackToLanding prop to allow navigation back to the landing view
    return <LoginPage onLoginSuccess={onLoginSuccess} onBackToLanding={() => setView('landing')} />;
  }

  return <LandingPage onGoToLogin={() => setView('login')} />;
};

export default PublicPortal;
