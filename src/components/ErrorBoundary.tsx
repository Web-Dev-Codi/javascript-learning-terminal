import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div style={{
          padding: '2rem',
          margin: '1rem',
          border: '1px solid #f44336',
          borderRadius: '4px',
          backgroundColor: '#1a1a1a',
          color: '#f44336',
          fontFamily: 'monospace',
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Something went wrong</h3>
          <p style={{ margin: 0, color: '#aaa' }}>
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              border: '1px solid #f44336',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              color: '#f44336',
              cursor: 'pointer',
              fontFamily: 'monospace',
            }}
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}