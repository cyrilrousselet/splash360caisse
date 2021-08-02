import React from 'react';
import logger from '../../helpers/Logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true }
  }
  componentDidCatch(error, errorInfo) {
    logger.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Une erreur est survenue</h1>
    }

    return this.props.children;
  }
}

export default ErrorBoundary;