import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface AsyncBoundaryProps {
  isLoading: boolean;
  isError: boolean;
  error?: Error | string | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyTitle?: string;
  emptyAction?: React.ReactNode;
  onRetry?: () => void;
  loadingFallback?: React.ReactNode;
  children: React.ReactNode;
}

export const AsyncBoundary: React.FC<AsyncBoundaryProps> = ({
  isLoading,
  isError,
  error,
  isEmpty = false,
  emptyTitle = 'No data available',
  emptyMessage = 'No records match your filters or query at this moment.',
  emptyAction,
  onRetry,
  loadingFallback,
  children,
}) => {
  if (isLoading) {
    if (loadingFallback) return <>{loadingFallback}</>;

    return (
      <div className="py-16 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#3E5C9A]/20 border-t-[#1E2A5E] rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500 tracking-wide animate-pulse">
          Loading platform data...
        </p>
      </div>
    );
  }

  if (isError) {
    const errorText = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred while communicating with the server.';

    return (
      <div className="p-8 my-4 rounded-xl bg-rose-50 border border-rose-200 text-center space-y-4 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-rose-900">Failed to Load Content</h3>
          <p className="text-xs text-rose-700 mt-1 leading-relaxed">{errorText}</p>
        </div>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry} icon={<RotateCcw className="w-3.5 h-3.5" />}>
            Retry Request
          </Button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="p-10 my-4 rounded-xl bg-white border border-slate-200 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">{emptyTitle}</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">{emptyMessage}</p>
        {emptyAction && <div className="pt-2">{emptyAction}</div>}
      </div>
    );
  }

  return <>{children}</>;
};
