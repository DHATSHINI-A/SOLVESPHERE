import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Compass, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-20 text-center space-y-6 max-w-md mx-auto animate-in fade-in">
      <div className="w-16 h-16 rounded-3xl bg-[#1E2A5E]/10 text-[#1E2A5E] flex items-center justify-center mx-auto shadow-inner">
        <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '10s' }} />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-[#1E2A5E] font-heading">404</h1>
        <h2 className="text-lg font-bold text-slate-800">Page Not Found</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The requested route or platform resource does not exist in the SolutionHub ecosystem.
        </p>
      </div>

      <div className="pt-2">
        <Link to="/">
          <Button variant="primary" size="md" icon={<Home className="w-4 h-4" />}>
            Return to Landing Hub
          </Button>
        </Link>
      </div>
    </div>
  );
};
