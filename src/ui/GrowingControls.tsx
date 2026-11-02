import { useEffect } from 'react';
import { useBuildingStore } from '../game/buildingStore';
import { patchSoils, soilId, type GardenTool } from '../game/growing';
import { items } from '../game/building';

export function useGrowingClock() {
  const dispatch = useBuildingStore((s) => s.dispatch);
  useEffect(() => {
    let previous = performance.now();
    const reset = () => { previous = performance.now(); };
    const interval = window.setInterval(() => {
      const now = performance.now();
      if (document.visibilityState === 'visible') dispatch({ type: 'grow', elapsed: Math.min(1000, now - previous) });
      previous = now;
    }, 1000);
    document.addEventListener('visibilitychange', reset);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', reset); };
  }, [dispatch]);
}
export function GrowingControls({ onBasket, onSoil }: { onBasket: () => void; onSoil: () => void }) {
  const tool = useBuildingStore((s) => s.tool);
  const home = useBuildingStore((s) => s.garden.objects.some((o) => o.kind === 'home'));
  const basket = useBuildingStore((s) => s.growing.basket);
  const dispatch = useBuildingStore((s) => s.dispatch);
  const tools: { id: GardenTool; icon: string; name: string }[] = [
    { id: 'build', icon: '⌂', name: 'Build' }, { id: 'seed', icon: '🌰', name: 'Seeds' },
    { id: 'water', icon: '💧', name: 'Water' }, { id: 'harvest', icon: '🥕', name: 'Harvest' },
  ];
  return <>
    <section className="garden-tools" aria-label="Garden tools">
      {tools.map((t) => <button key={t.id} aria-label={t.name} aria-pressed={tool === t.id} disabled={!home && t.id !== 'build'} onClick={() => dispatch({ type: 'tool', tool: t.id })}><span aria-hidden="true">{t.icon}</span>{t.name}</button>)}
      <button className="basket-button" aria-label={`Basket: ${basket} ${basket === 1 ? 'carrot' : 'carrots'}`} onClick={onBasket}><span aria-hidden="true">🧺</span>Basket <strong>{basket}</strong></button>
    </section>
    {tool !== 'build' && <section className="growing-dock" aria-label="Growing tools">
      <strong>{tool === 'seed' ? '🌰 Seeds' : tool === 'water' ? '💧 Water' : '🥕 Harvest'}</strong>
      <span>{tool === 'seed' ? 'One seed in each empty soil space' : tool === 'water' ? 'One drink starts each seed growing' : 'Orange carrots are ready to pick'}</span>
      <button onClick={onSoil}>Soil spaces</button>
    </section>}
  </>;
}
export function BasketContents() {
  const count = useBuildingStore((s) => s.growing.basket);
  return <><p>{count === 0 ? 'Your basket is empty. Plant, water, and harvest a carrot!' : `You have ${count} ${count === 1 ? 'carrot' : 'carrots'}. Each plant gives one carrot.`}</p>
    <div className="basket-groups" aria-label={`${count} countable carrots`}>
      {Array.from({ length: Math.ceil(count / 10) }, (_, group) => <ol key={group} start={group * 10 + 1} className="carrot-group">{Array.from({ length: Math.min(10, count - group * 10) }, (_, n) => <li key={n} aria-label={`Carrot ${group * 10 + n + 1}`}><span aria-hidden="true">🥕</span></li>)}</ol>)}
    </div><p>Your carrots stay here for Pip’s picnic in the next milestone.</p></>;
}
export function SoilSpaces() {
  const { garden, growing, tool, dispatch } = useBuildingStore();
  const spaces = [...patchSoils.map((id, i) => ({ id, name: `Growing patch, soil ${i + 1}` })), ...garden.objects.filter((o) => o.kind === 'bed').flatMap((o, i) => [0, 1].map((slot) => ({ id: soilId(o.id, slot), name: `${items.bed.name} ${i + 1}, soil ${slot + 1}` })))];
  return <><p>These are the same soil spaces in your garden. Choose Seeds, Water, or Harvest before opening this view.</p><p role="status">{growing.message}</p><ul className="soil-list">{spaces.map((space) => {
    const crop = growing.crops[space.id];
    const status = !crop ? 'Empty' : crop.stage === 'seed' ? 'Seed' : crop.stage === 'growing' ? 'Growing' : 'Ripe carrot';
    return <li key={space.id}><button disabled={tool === 'build'} onClick={() => dispatch({ type: 'tend', soilId: space.id })} aria-label={`${space.name}: ${status}`}><span>{space.name}</span><strong>{!crop ? '◌' : crop.stage === 'seed' ? '🌰' : crop.stage === 'growing' ? '🌱' : '🥕'} {status}</strong></button></li>;
  })}</ul></>;
}
