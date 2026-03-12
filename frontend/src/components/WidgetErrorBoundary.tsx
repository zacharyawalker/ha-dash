import { Component, type ReactNode, type ErrorInfo } from 'react';
import WidgetErrorFallback from './WidgetErrorFallback';

interface Props {
  children: ReactNode;
  widgetId: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Per-widget error boundary.
 * If a widget throws, only that widget shows the error — rest of the dashboard is fine.
 */
export default class WidgetErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[Widget ${this.props.widgetId}] Error:`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <WidgetErrorFallback error={this.state.error ?? undefined} />;
    }
    return this.props.children;
  }
}
