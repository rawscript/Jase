export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--portfolio-primary)' }}>
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-6"></div>
        <p className="text-black/60 text-sm font-light tracking-wide">LOADING</p>
      </div>
    </div>
  );
}
