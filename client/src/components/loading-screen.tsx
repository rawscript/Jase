export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--portfolio-primary)' }}>
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-gray-400">Loading Portfolio...</p>
      </div>
    </div>
  );
}
