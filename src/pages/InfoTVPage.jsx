import InfoTVScreen from '../components/InfoTV/InfoTVScreen';
import ErrorBoundary from '../components/shared/ErrorBoundary';

export default function InfoTVPage() {
  return (
    <ErrorBoundary>
      <InfoTVScreen />
    </ErrorBoundary>
  );
}
