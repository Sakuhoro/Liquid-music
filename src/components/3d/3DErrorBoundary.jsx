import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ThreeDErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Liquid Music 3D ErrorBoundary Captured]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-slate-950/90 text-white backdrop-blur-xl text-center">
          <div className="p-4 rounded-3xl bg-red-500/10 border border-red-500/20 max-w-lg space-y-4 shadow-2xl">
            <div className="flex justify-center">
              <AlertTriangle className="w-12 h-12 text-amber-400 animate-bounce" />
            </div>
            <h2 className="text-xl font-extrabold text-white">3D Sanctuary WebGL Context Notice</h2>
            <p className="text-xs text-slate-300">
              {this.state.error?.message || 'A 3D rendering context or asset loading exception occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-5 py-2.5 rounded-2xl bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all mx-auto cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload WebGL Context</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
