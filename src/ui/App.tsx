import { useCallback, useState } from 'react';
import { GardenScene } from '../world/GardenScene';
export function App() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const onReady = useCallback(() => setStatus('ready'), []);
  const onFailure = useCallback(() => setStatus('error'), []);
  return <main className="shell">
    <header className="masthead"><a className="brand" href="/" aria-label="Little Landkeepers home"><span aria-hidden="true">✿</span> Little Landkeepers</a><span className="badge">Garden preview</span></header>
    <section className="intro"><p className="eyebrow">A little place to make your own</p><h1>Big adventures.<br />Little beginnings.</h1><p>Grow a garden. Make room for friends.<br />Discover what you can create.</p></section>
    <section className="garden" aria-label="Orthographic garden preview"><GardenScene onReady={onReady} onFailure={onFailure} /><div className="scene-note" role="status">{status === 'ready' ? 'Meet Pip. Your garden starts here.' : status === 'error' ? 'The garden needs a WebGL-capable browser.' : 'Preparing the garden…'}</div></section>
    <footer><span>Our first little clearing</span><p>This is an early look at the garden. Building and planting are coming next.</p></footer>
  </main>;
}
