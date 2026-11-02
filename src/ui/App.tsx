import { useCallback, useState, type KeyboardEvent } from 'react';
import { items, placementError, footprint, type ItemKind } from '../game/building';
import { useBuildingStore } from '../game/buildingStore';
import { GardenScene } from '../world/GardenScene';

export function App() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [help, setHelp] = useState(false);
  const garden = useBuildingStore((s) => s.garden);
  const dispatch = useBuildingStore((s) => s.dispatch);
  const onReady = useCallback(() => setStatus('ready'), []);
  const onFailure = useCallback(() => setStatus('error'), []);
  const draft = garden.draft;
  const error = draft ? placementError(garden.objects, draft) : null;
  const keyboard = (event: KeyboardEvent) => {
    if (!draft || event.target instanceof HTMLButtonElement) return;
    const directions: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (directions[event.key]) { event.preventDefault(); const [dx, dz] = directions[event.key]; dispatch({ type: 'nudge', dx, dz }); }
    if (event.key === 'Escape') { event.preventDefault(); dispatch({ type: 'cancel' }); }
    if (event.key.toLowerCase() === 'r') { event.preventDefault(); dispatch({ type: 'rotate' }); }
    if (event.key === 'Enter' && !error) { event.preventDefault(); dispatch({ type: 'confirm' }); }
  };
  return <main className="shell" onKeyDown={keyboard}>
    <header className="masthead"><span className="brand"><span aria-hidden="true">✿</span> Little Landkeepers</span><div className="header-actions"><span className="badge">Building preview</span><button className="help-button" onClick={() => setHelp(!help)} aria-expanded={help} aria-controls="building-help">? <span>Help</span></button></div></header>
    <div className="intro"><div><p className="eyebrow">Your first little clearing</p><h1>Make room for imagination.</h1></div><p>Build a cozy home. Add a winding path.<br />Make this garden yours.</p></div>
    {help && <section id="building-help" className="help-card" aria-label="Building help"><h2>Let’s build together</h2><ol><li>Choose a piece from the tray.</li><li>Tap a garden space to see where it will fit.</li><li>Turn it if you like, then choose <strong>Place here</strong>.</li></ol><p>Tap something you’ve built to move it or return it to the tray. Cancel leaves it just where it was. The carrot patch, picnic blanket, and entrance stay open for friends.</p><p>Keyboard: focus the garden and use arrow keys to move a preview, R to turn, Enter to place, and Escape to cancel.</p></section>}
    <div className="workspace">
      <section className="garden" aria-label="Garden building area" tabIndex={0} data-testid="garden-world" data-render-status={status}>
        <GardenScene onReady={onReady} onFailure={onFailure} />
        <div className="world-caption" aria-hidden="true">{draft ? 'Tap a space to try it out' : 'Tap a piece to move it'}</div>
      </section>
      <aside className="builder-panel" aria-label="Building controls">
        {draft ? <>
          <p className="eyebrow">{draft.movingId ? 'Make a little change' : 'A new addition'}</p>
          <h2>{items[draft.kind].name}</h2>
          <p className="piece-size">{footprint(draft.kind, draft.rotation).width} × {footprint(draft.kind, draft.rotation).depth} garden spaces</p>
          <button className="turn-button" onClick={() => dispatch({ type: 'rotate' })}><span aria-hidden="true">↻</span> Turn piece</button>
          <div className={`feedback ${draft.position && error ? 'invalid' : ''}`} role="status" data-testid="placement-feedback">{error ?? 'This spot works! Ready to place it?'}</div>
          <button className="primary" disabled={status !== 'ready' || !!error} onClick={() => dispatch({ type: 'confirm' })}>{draft.movingId ? 'Keep this spot' : 'Place here'} <span aria-hidden="true">✓</span></button>
          <button className="secondary" onClick={() => dispatch({ type: 'cancel' })}>Cancel</button>
          {draft.movingId && <button className="return-button" onClick={() => dispatch({ type: 'remove' })}>↩ Return to tray</button>}
          <details className="placement-controls"><summary>Placement arrows</summary><p>Move the preview one garden space at a time.</p><div className="direction-pad">
            <button aria-label="Move preview north" onClick={() => dispatch({ type: 'nudge', dx: 0, dz: -1 })}>↑</button><button aria-label="Move preview west" onClick={() => dispatch({ type: 'nudge', dx: -1, dz: 0 })}>←</button><button aria-label="Move preview east" onClick={() => dispatch({ type: 'nudge', dx: 1, dz: 0 })}>→</button><button aria-label="Move preview south" onClick={() => dispatch({ type: 'nudge', dx: 0, dz: 1 })}>↓</button>
          </div><p className="coordinates">{draft.position ? `Column ${draft.position.x + 1}, row ${draft.position.z + 1}` : 'Choose a space or use an arrow.'}</p></details>
        </> : <>
          <div className="pip-portrait" aria-hidden="true">🐰</div><p className="eyebrow">Pip’s tip</p><h2>A place for every idea.</h2>
          <p>Choose a piece below, then tap where you’d like it to go.</p>
          <div className="feedback" role="status">{status === 'loading' ? 'Preparing the garden…' : status === 'error' ? 'The garden needs a WebGL-capable browser.' : garden.message}</div>
          <p className="small-note">You can move things as often as you like.</p>
        </>}
        <details className="object-list"><summary>Garden pieces ({garden.objects.length})</summary><ul>{garden.objects.map((object, i) => <li key={object.id}><button onClick={() => dispatch({ type: 'select', id: object.id })} disabled={status !== 'ready'} aria-label={`Move ${items[object.kind].name} ${i + 1}`}><span aria-hidden="true">{items[object.kind].icon}</span> {items[object.kind].name}<span aria-hidden="true">↗</span></button></li>)}</ul></details>
      </aside>
    </div>
    <section className="tray" aria-label="Building tray"><div className="tray-heading"><h2>Your building tray</h2><span>Choose something to make</span></div><div className="tray-items">{(Object.keys(items) as ItemKind[]).map((kind) => {
      const item = items[kind]; const available = item.supply - garden.objects.filter((o) => o.kind === kind).length;
      return <button key={kind} className={`tray-piece ${draft?.kind === kind && !draft.movingId ? 'active' : ''}`} aria-label={`Build ${item.name}`} aria-pressed={draft?.kind === kind && !draft.movingId} disabled={!available || status !== 'ready'} onClick={() => dispatch({ type: 'choose', kind })}><span className={`piece-icon ${kind}`} aria-hidden="true">{item.icon}</span><strong>{item.name}</strong><span className="availability">{available} in tray</span></button>;
    })}</div></section>
    <footer><span>Planting and picnics are coming next.</span><span>This building preview resets when you reload.</span></footer>
  </main>;
}
