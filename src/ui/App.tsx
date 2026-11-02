import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { canBuild, items, placementError, type ItemKind } from '../game/building';
import { useBuildingStore } from '../game/buildingStore';
import { GardenScene } from '../world/GardenScene';

type Anchor = { x: number; y: number } | null;
function PieceMenu({ anchor }: { anchor: Anchor }) {
  const garden = useBuildingStore((s) => s.garden);
  const dispatch = useBuildingStore((s) => s.dispatch);
  const selected = garden.objects.find((o) => o.id === garden.selectedId);
  const menu = useRef<HTMLElement>(null);
  useEffect(() => { if (selected) menu.current?.querySelector('button')?.focus(); }, [selected?.id]);
  if (!selected || !anchor) return null;
  return <section ref={menu} className="move-popup piece-menu" role="dialog" aria-label="Piece actions" style={{ left: `clamp(150px, ${anchor.x}px, calc(100% - 150px))`, top: `clamp(245px, ${anchor.y - 22}px, calc(100% - 155px))` }}>
    <h2>{items[selected.kind].name}</h2><div>
      <button className="primary move-action" onClick={() => dispatch({ type: 'select', id: selected.id })}>
        <svg aria-hidden="true" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3v26M3 16h26M11 8l5-5 5 5M11 24l5 5 5-5M8 11l-5 5 5 5M24 11l5 5-5 5" /></svg>Move
      </button><button className="secondary" onClick={() => dispatch({ type: 'dismiss' })}>✕ Cancel</button>
    </div>
  </section>;
}
function MoveConfirmation({ anchor }: { anchor: Anchor }) {
  const garden = useBuildingStore((s) => s.garden);
  const dispatch = useBuildingStore((s) => s.dispatch);
  const button = useRef<HTMLButtonElement>(null);
  const draft = garden.draft;
  const error = draft ? placementError(garden.objects, draft) : null;
  useEffect(() => { if (draft?.pending) button.current?.focus(); }, [draft?.pending, !!anchor]);
  if (!draft?.movingId || !draft.pending || !anchor) return null;
  return <section className="move-popup" role="dialog" aria-label="Confirm move" style={{ left: `clamp(150px, ${anchor.x}px, calc(100% - 150px))`, top: `clamp(245px, ${anchor.y - 22}px, calc(100% - 155px))` }}>
    <h2>{error ? 'Try another spot' : 'Move it here?'}</h2>
    <p>{error ?? 'Pip likes this spot. Keep the change?'}</p>
    <div><button ref={button} className="primary" disabled={!!error} onClick={() => dispatch({ type: 'confirm' })}>✓ Move here</button><button className="secondary" onClick={() => dispatch({ type: 'cancel' })}>✕ Cancel</button></div>
  </section>;
}
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="game-dialog" aria-label={title} onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <div className="dialog-heading"><h2>{title}</h2><button aria-label={`Close ${title}`} onClick={onClose}>✕</button></div>{children}
  </dialog>;
}
export function App() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [panel, setPanel] = useState<'help' | 'pieces' | null>(null);
  const [anchor, setAnchor] = useState<Anchor>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [screenNote, setScreenNote] = useState('');
  const shell = useRef<HTMLElement>(null);
  const garden = useBuildingStore((s) => s.garden);
  const dispatch = useBuildingStore((s) => s.dispatch);
  const onReady = useCallback(() => setStatus('ready'), []);
  const onFailure = useCallback(() => setStatus('error'), []);
  const onMoveAnchor = useCallback((point: Anchor) => setAnchor((old) => old?.x === point?.x && old?.y === point?.y ? old : point), []);
  const draft = garden.draft;
  const error = draft ? placementError(garden.objects, draft) : null;
  const hasHome = garden.objects.some((o) => o.kind === 'home');
  useEffect(() => {
    const changed = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', changed);
    return () => document.removeEventListener('fullscreenchange', changed);
  }, []);
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (shell.current?.requestFullscreen) await shell.current.requestFullscreen();
      else setScreenNote('Your browser already shows the full game area. Fullscreen is not supported here.');
    } catch { setScreenNote('Fullscreen is unavailable here. You can keep playing in this window.'); }
  };
  const keyboard = (event: KeyboardEvent) => {
    if (panel) return;
    if (event.key === 'Escape' && (draft || garden.selectedId)) { event.preventDefault(); dispatch({ type: 'cancel' }); return; }
    if (!draft || event.target instanceof HTMLButtonElement) return;
    const directions: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (directions[event.key]) { event.preventDefault(); const [dx, dz] = directions[event.key]; dispatch({ type: 'nudge', dx, dz }); }
    if (event.key.toLowerCase() === 'r') { event.preventDefault(); dispatch({ type: 'rotate' }); }
    if (event.key === 'Enter' && !error && status === 'ready') { event.preventDefault(); dispatch({ type: 'confirm' }); }
  };
  const tip = status === 'loading' ? 'Preparing the garden…' : status === 'error' ? 'The garden needs a WebGL-capable browser.'
    : !hasHome ? draft?.position && error ? error : draft?.kind === 'home' ? 'Hi, I’m Pip! Tap a space to build my home.' : 'Pip needs a cozy home. Choose Home from your tray.'
    : garden.selectedId ? 'Choose Move to find a new spot, or tap away to keep exploring.' : draft ? draft.position && error ? error : draft.movingId ? 'Move your pointer to preview a spot, then tap and choose Move here.' : `Tap a space to place your ${items[draft.kind].name.toLowerCase()}.` : garden.message;
  return <main ref={shell} className="game-shell" onKeyDown={keyboard} onPointerDownCapture={(event) => {
    if (garden.selectedId && !(event.target instanceof Element && event.target.closest('.piece-menu'))) dispatch({ type: 'dismiss' });
  }}>
    <section className="garden" aria-label="Garden building area" tabIndex={0} data-testid="garden-world" data-render-status={status}>
      <GardenScene onReady={onReady} onFailure={onFailure} onMoveAnchor={onMoveAnchor} />
    </section>
    <header className="game-header"><h1><span aria-hidden="true">✿</span> Little Landkeepers</h1><nav aria-label="Game controls">
      <button className="round-button" aria-label="Garden pieces" onClick={() => setPanel('pieces')}>⌂</button>
      <button className="round-button" aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} onClick={toggleFullscreen}>⛶</button>
      <button className="round-button" aria-label="Help" onClick={() => setPanel('help')}>?</button>
    </nav></header>
    <div className={`pip-tip ${draft?.position && error ? 'warning' : ''}`}><span className="pip-face" aria-hidden="true">🐰</span><div><strong>Pip</strong><p role="status" data-testid="placement-feedback">{tip}</p></div></div>
    {screenNote && <div className="screen-note" role="status">{screenNote}<button aria-label="Dismiss fullscreen message" onClick={() => setScreenNote('')}>✕</button></div>}
    {draft && <div className="edit-tools" aria-label="Placement tools">
      <span>{items[draft.kind].name}</span><button onClick={() => dispatch({ type: 'rotate' })}>↻ Turn</button>
      {draft.movingId && <button onClick={() => dispatch({ type: 'remove' })}>↩ Return to tray</button>}
      <button onClick={() => dispatch({ type: 'cancel' })}>✕ Cancel</button>
    </div>}
    <PieceMenu anchor={anchor} /><MoveConfirmation anchor={anchor} />
    {!draft && !garden.selectedId && garden.lastPlacementId && <button className="undo-button" onClick={() => dispatch({ type: 'undo' })}>↶ Undo placement</button>}
    <section className="tray" aria-label="Building tray"><div className="tray-heading"><h2>{hasHome ? 'What will you make next?' : 'A home for Pip'}</h2><span>{hasHome ? 'Choose a piece · tap to build' : 'Place Pip’s home to open your tray'}</span></div><div className="tray-items">{(Object.keys(items) as ItemKind[]).map((kind) => {
      const item = items[kind]; const available = item.supply - garden.objects.filter((o) => o.kind === kind).length;
      return <button key={kind} className={`tray-piece ${draft?.kind === kind && !draft.movingId ? 'active' : ''}`} aria-label={`Build ${item.name}`} aria-pressed={draft?.kind === kind && !draft.movingId} disabled={!canBuild(garden, kind) || status !== 'ready'} onClick={() => dispatch({ type: 'choose', kind })}><span className={`piece-icon ${kind}`} aria-hidden="true">{item.icon}</span><strong>{item.name}</strong><span className="availability">{!hasHome && kind !== 'home' ? 'After Pip’s home' : `${available} in tray`}</span></button>;
    })}</div></section>
    <small className="preview-note">Your garden resets on reload while we build saving.</small>
    {panel === 'help' && <Modal title="Let’s build together" onClose={() => setPanel(null)}>
      <ol><li>Choose a piece from the tray.</li><li>Turn it if you like, then tap a clear space. It builds right away!</li><li>To move a piece, tap it, choose the four-arrow <strong>Move</strong> button, then preview and tap a new spot. Choose <strong>Move here</strong> in the pop-up.</li></ol>
      <p>Tap away or choose Cancel to close a piece’s menu. Cancel keeps a moved piece in its original spot. Undo returns your newest piece to the tray. The growing patch, picnic blanket, and entrance stay open for friends.</p>
      <p>Keyboard: focus the garden, use arrows to position a piece, R to turn, Enter to place, and Escape to cancel.</p>
    </Modal>}
    {panel === 'pieces' && <Modal title="Garden pieces" onClose={() => setPanel(null)}><p>{garden.objects.length ? 'Choose a piece to move or return to the tray.' : 'Your clearing is ready. Let’s build Pip a home!'}</p><ul className="object-list">{garden.objects.map((object, i) => <li key={object.id}><button onClick={() => { dispatch({ type: 'select', id: object.id }); setPanel(null); }} aria-label={`Move ${items[object.kind].name} ${i + 1}`}><span aria-hidden="true">{items[object.kind].icon}</span> {items[object.kind].name}<span aria-hidden="true">↗</span></button></li>)}</ul></Modal>}
  </main>;
}
