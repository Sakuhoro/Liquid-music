import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

/**
 * The navigable surfaces of the site, shallowest first. Every one of them is a
 * screen the visitor expects a back gesture to step out of, in the order they
 * opened -- the same way a native app unwinds its stack.
 */
type LayerKey =
  | 'catalog'
  | 'collection'
  | 'product'
  | 'account'
  | 'accountOrders'
  | 'cart'
  | 'auth'
  | 'success'
  | 'studio'
  | 'story';

// Only used to order layers that become active in the same tick. A layer that
// is already on the stack keeps its place, so this never reshuffles a stack the
// visitor has already built up.
const PRIORITY: LayerKey[] = [
  'catalog',
  'collection',
  'product',
  'account',
  'accountOrders',
  'cart',
  'auth',
  'success',
  'studio',
  'story',
];

// The admin cabinet keeps its own address so a reload reopens it; every other
// layer leaves the URL alone.
const ADMIN_PATH = '/Liquidmusic/admin';

type StoreState = ReturnType<typeof useAppStore.getState>;

function activeLayers(state: StoreState): Set<LayerKey> {
  const active = new Set<LayerKey>();
  if (state.viewMode === 'catalog') {
    active.add('catalog');
    // The gallery detail sits on top of the catalogue overview, so leaving it
    // is one back rather than two.
    if (state.activeCollection !== 'All') active.add('collection');
  }
  if (state.inspectedProduct) active.add('product');
  if (state.isAccountModalOpen && state.currentUser) {
    active.add('account');
    if (state.isOrderHistorySubModalOpen) active.add('accountOrders');
  }
  if (state.isCartOpen) active.add('cart');
  if (state.isAuthModalOpen) active.add('auth');
  if (state.isSuccessModalOpen) active.add('success');
  if (state.isStudioModalOpen) active.add('studio');
  if (state.activeStoryFrame !== null) active.add('story');
  return active;
}

// Keeps the order a stack was built in and appends whatever opened since,
// rather than reading a fixed order off the current state: two surfaces can be
// open at once, and the last one opened is the one a back should close.
function mergeOrder(previous: LayerKey[], active: Set<LayerKey>): LayerKey[] {
  const kept = previous.filter((key) => active.has(key));
  const added = PRIORITY.filter((key) => active.has(key) && !kept.includes(key));
  return [...kept, ...added];
}

// Undo one layer. Kept next to activeLayers so the two stay in step.
function closeLayer(key: LayerKey): void {
  const store = useAppStore.getState();
  switch (key) {
    case 'story':
      store.closeStory();
      break;
    case 'studio':
      store.setIsStudioModalOpen(false);
      break;
    case 'success':
      store.setIsSuccessModalOpen(false);
      break;
    case 'auth':
      store.closeAuthModal();
      break;
    case 'accountOrders':
      store.setIsOrderHistorySubModalOpen(false);
      break;
    case 'cart':
      store.setIsCartOpen(false);
      break;
    case 'account':
      store.setIsAccountModalOpen(false);
      break;
    case 'product':
      store.setInspectedProduct(null);
      break;
    case 'collection':
      store.setActiveCollection('All');
      break;
    case 'catalog':
      store.setViewMode('hero');
      break;
  }
}

function sameOrder(a: LayerKey[], b: LayerKey[]): boolean {
  return a.length === b.length && a.every((key, index) => key === b[index]);
}

function commonPrefixLength(a: LayerKey[], b: LayerKey[]): number {
  let index = 0;
  while (index < a.length && index < b.length && a[index] === b[index]) {
    index += 1;
  }
  return index;
}

function pushEntry(key: LayerKey): void {
  const url = key === 'studio' ? ADMIN_PATH : undefined;
  window.history.pushState({ lmLayer: key }, '', url);
}

/**
 * Ties the store's navigational state to the browser's history, so the back
 * button and the swipe-back gesture walk the site's own screens instead of
 * leaving for the browser's previous page.
 *
 * There is no router here and there does not need to be one. The screens are
 * already a function of the store, so this hook only has to keep a matching
 * count of history entries: one per open layer. A forward change (opening a
 * modal or a collection) pushes an entry; a close the visitor made in the UI
 * (an X, a backdrop tap) issues a matching history.go(-n) so the entry leaves
 * with the layer; and a real back gesture pops the top layer through the same
 * close function its own button calls. The browser is therefore never left
 * holding entries for screens that are already gone, which is what would
 * otherwise make a second back jump straight out of the site.
 *
 * A synthetic `popstate` is only ever raised by our own go() calls, so those
 * are counted and ignored -- otherwise closing a modal would immediately pop
 * the screen underneath it as well.
 */
export function useNavigationHistory(): void {
  const orderRef = useRef<LayerKey[]>([]);
  const suppressPopRef = useRef(0);
  const ignoreRemovalRef = useRef(false);
  const didSeedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    // Mark the entry the site loaded on. A deep link to /admin opens the studio
    // before this hook runs, and its entry is that same loaded entry, so the
    // marker keeps a later back from wandering off the site.
    const baseState = window.history.state;
    if (!baseState || !baseState.lmBase) {
      window.history.replaceState({ ...(baseState || {}), lmBase: true }, '');
    }

    // Seed from whatever is already open on first mount (normally nothing; the
    // /admin deep link is the exception) and give each layer its entry.
    if (!didSeedRef.current) {
      didSeedRef.current = true;
      const seeded = mergeOrder([], activeLayers(useAppStore.getState()));
      orderRef.current = seeded;
      for (const key of seeded) pushEntry(key);
    }

    const reconcile = () => {
      const previous = orderRef.current;
      const next = mergeOrder(previous, activeLayers(useAppStore.getState()));
      if (sameOrder(previous, next)) return;

      const prefix = commonPrefixLength(previous, next);
      const removals = previous.length - prefix;
      const additions = next.slice(prefix);

      if (ignoreRemovalRef.current) {
        // This removal is the back gesture we are already inside of; the
        // browser popped its entry, so only the extra layers (if a close took
        // more than one down, as closing the account drops its nested screen
        // too) need their entries walked.
        ignoreRemovalRef.current = false;
        const extra = removals - 1;
        if (extra > 0) {
          suppressPopRef.current += 1;
          window.history.go(-extra);
        }
      } else if (removals > 0) {
        suppressPopRef.current += 1;
        window.history.go(-removals);
      }

      for (const key of additions) pushEntry(key);
      orderRef.current = next;
    };

    const onPopState = () => {
      if (suppressPopRef.current > 0) {
        suppressPopRef.current -= 1;
        return;
      }
      const top = orderRef.current[orderRef.current.length - 1];
      if (!top) {
        // Nothing of ours left to close: this is the visitor leaving the site,
        // so let the browser do what it was asked.
        return;
      }
      ignoreRemovalRef.current = true;
      closeLayer(top);
    };

    const unsubscribe = useAppStore.subscribe(reconcile);
    window.addEventListener('popstate', onPopState);
    return () => {
      unsubscribe();
      window.removeEventListener('popstate', onPopState);
    };
  }, []);
}
