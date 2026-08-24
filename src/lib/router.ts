import { TargetView } from './types';

const VALID_VIEWS: TargetView[] = ['supabase', 'neon', 'planetscale', 'mongodb', 'clickhouse', 'redis'];

export interface RouteState {
  targetView: TargetView;
  activeTab: 'landscape' | 'cohorts';
  statusFilter: string;
  unverifiedSubFilter: 'all' | 'surface_free' | 'deep_scraped' | 'unscanned';
  accountId: string | null;
}

export function parseCurrentUrl(): RouteState {
  if (typeof window === 'undefined') {
    return {
      targetView: 'supabase',
      activeTab: 'landscape',
      statusFilter: 'all',
      unverifiedSubFilter: 'all',
      accountId: null
    };
  }

  // 1. Pathname-based Target View: /supabase, /neon, /mongodb, etc.
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  let targetView: TargetView = 'supabase';
  
  if (VALID_VIEWS.includes(path as TargetView)) {
    targetView = path as TargetView;
  } else {
    // Fallback to localStorage or default
    const saved = localStorage.getItem('stackpulse_target_view');
    if (saved && VALID_VIEWS.includes(saved as TargetView)) {
      targetView = saved as TargetView;
    }
  }

  // 2. Query Parameters
  const params = new URLSearchParams(window.location.search);
  
  // Tab: ?tab=landscape | ?tab=cohorts
  const tabParam = params.get('tab');
  const activeTab: 'landscape' | 'cohorts' = tabParam === 'cohorts' ? 'cohorts' : 'landscape';

  // Status Filter: ?status=all | ?status=champion | ?status=migration | ?status=verified | ?status=unverified
  const statusFilter = params.get('status') || 'all';

  // Unverified Sub-Filter: ?unverified=surface_free | ?unverified=deep_scraped | ?unverified=unscanned
  const unverifiedParam = params.get('unverified');
  const unverifiedSubFilter = (['all', 'surface_free', 'deep_scraped', 'unscanned'].includes(unverifiedParam || '')
    ? unverifiedParam
    : 'all') as 'all' | 'surface_free' | 'deep_scraped' | 'unscanned';

  // Account Deep Link: ?account=slug-or-id or ?id=id
  const accountId = params.get('account') || params.get('id') || null;

  return {
    targetView,
    activeTab,
    statusFilter,
    unverifiedSubFilter,
    accountId
  };
}

export function syncUrl(state: Partial<RouteState>, replace: boolean = false): void {
  if (typeof window === 'undefined') return;

  const current = parseCurrentUrl();
  const next: RouteState = {
    targetView: state.targetView ?? current.targetView,
    activeTab: state.activeTab ?? current.activeTab,
    statusFilter: state.statusFilter ?? current.statusFilter,
    unverifiedSubFilter: state.unverifiedSubFilter ?? current.unverifiedSubFilter,
    accountId: state.accountId !== undefined ? state.accountId : current.accountId
  };

  // Build Path
  const pathname = `/${next.targetView}`;

  // Build Query
  const params = new URLSearchParams();
  if (next.activeTab !== 'landscape') {
    params.set('tab', next.activeTab);
  }
  if (next.statusFilter !== 'all') {
    params.set('status', next.statusFilter);
  }
  if (next.statusFilter === 'unverified' && next.unverifiedSubFilter !== 'all') {
    params.set('unverified', next.unverifiedSubFilter);
  }
  if (next.accountId) {
    params.set('account', next.accountId);
  }

  const queryString = params.toString();
  const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

  if (window.location.pathname + window.location.search !== newUrl) {
    if (replace) {
      window.history.replaceState(null, '', newUrl);
    } else {
      window.history.pushState(null, '', newUrl);
    }
  }
}
