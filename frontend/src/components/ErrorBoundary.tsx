import { Component, type ReactNode, type ErrorInfo } from 'react';
import Icon from '@mdi/react';
import { mdiAlertCircle, mdiRefresh } from '@mdi/js';

interface Props {
  children: ReactNode;
  /** Optional fallback — if not provided, uses the default error card */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary catches runtime errors in the React tree.
 * Shows a friendly error card with retry instead of a blank screen.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="flex flex-col items-center justify-center h-screen gap-4"
          style={{ background: 'var(--color-surface-page)' }}
        >
          <Icon path={mdiAlertCircle} size={2} color="var(--color-error)" />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Something went wrong
          </h2>
          <p className="text-sm max-w-md text-center" style={{ color: 'var(--color-text-secondary)' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors"
            style={{ background: 'var(--color-accent)', color: 'white' }}
          >
            <Icon path={mdiRefresh} size={0.7} />
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
