import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('UI Runtime Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center p-4 font-sans text-[#212121]">
          <div className="bg-[#f1f3f6] max-w-lg w-full p-8 rounded-3xl shadow-[8px_8px_20px_#c5cad3,-8px_-8px_20px_#ffffff] border border-white text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 text-red-500 flex items-center justify-center shadow-inner">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Something went wrong</h2>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              An unexpected error occurred while rendering this page. You can refresh or return to the health products catalog.
            </p>
            {this.state.error && (
              <div className="p-3 bg-red-50/60 rounded-xl text-left border border-red-200/60 text-[11px] font-mono text-red-800 max-h-28 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="neo-btn-blue px-6 py-2.5 text-xs font-black uppercase flex items-center justify-center gap-2 shadow-md w-full sm:w-auto"
              >
                <RefreshCw size={14} />
                <span>Reload Page</span>
              </button>
              <button
                onClick={() => { window.location.href = '/products'; }}
                className="neo-btn-orange px-6 py-2.5 text-xs font-black uppercase flex items-center justify-center gap-2 shadow-md w-full sm:w-auto"
              >
                <Home size={14} />
                <span>Back to Store</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
