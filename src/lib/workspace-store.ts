import { 
  Startup, 
  TargetView, 
  PipelineAssumptions, 
  ApiKeysConfig, 
  ApiKeyItem,
  UserWorkspaceDelta, 
  GtmMetrics,
  VerificationDepth
} from './types';
import { 
  DEFAULT_FINANCIAL_ASSUMPTIONS, 
  calculateCompanyArr, 
  normalizeFunctionalOntology 
} from './ontology';

const STORAGE_KEYS = {
  PIPELINE_ASSUMPTIONS: 'stackpulse_pipeline_assumptions',
  API_KEYS: 'stackpulse_api_keys',
  GUEST_DELTA: 'stackpulse_guest_delta',
  TARGET_VIEW: 'stackpulse_target_view'
};

export const DEFAULT_PIPELINE_ASSUMPTIONS: PipelineAssumptions = {
  tier1Arr: 36000,
  tier2Arr: 24000,
  minDisplacementScore: 50,
  ...DEFAULT_FINANCIAL_ASSUMPTIONS,
};

export function getDefaultApiKeys(): ApiKeysConfig {
  const envGroq = (import.meta.env.VITE_AI_INFERENCE_KEY || import.meta.env.VITE_GROQ_API_KEY || '') as string;
  const envOpenAi = (import.meta.env.VITE_OPENAI_API_KEY || '') as string;
  const envGemini = (import.meta.env.VITE_GEMINI_API_KEY || '') as string;
  const envScraper = (import.meta.env.VITE_SCRAPER_API_KEY || '') as string;

  const llmKeys: ApiKeyItem[] = [];
  if (envGroq) {
    llmKeys.push({
      id: 'env-groq',
      name: 'Primary Groq AI (Env)',
      key: envGroq,
      isActive: true,
      model: 'openai/gpt-oss-20b',
      addedAt: Date.now()
    });
  }
  if (envOpenAi) {
    llmKeys.push({
      id: 'env-openai',
      name: 'OpenAI GPT-4o (Env)',
      key: envOpenAi,
      isActive: llmKeys.length === 0,
      model: 'gpt-4o-mini',
      addedAt: Date.now()
    });
  }
  if (envGemini) {
    llmKeys.push({
      id: 'env-gemini',
      name: 'Google Gemini (Env)',
      key: envGemini,
      isActive: llmKeys.length === 0,
      model: 'gemini-1.5-flash',
      addedAt: Date.now()
    });
  }

  if (llmKeys.length === 0) {
    llmKeys.push({
      id: 'default-groq',
      name: 'Primary AI Inference',
      key: '',
      isActive: true,
      model: 'openai/gpt-oss-20b',
      addedAt: Date.now()
    });
  }

  return {
    activeEngine: envOpenAi && !envGroq ? 'openai' : 'groq',
    llmKeys,
    scraperKeys: [
      {
        id: 'default-scraper',
        name: 'Primary Proxy Scraper',
        key: envScraper,
        isActive: true,
        addedAt: Date.now()
      }
    ]
  };
}

export const DEFAULT_API_KEYS: ApiKeysConfig = getDefaultApiKeys();

export function getSavedPipelineAssumptions(): PipelineAssumptions {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PIPELINE_ASSUMPTIONS);
    if (saved) {
      return { ...DEFAULT_PIPELINE_ASSUMPTIONS, ...JSON.parse(saved) };
    }
  } catch (e) {}
  return DEFAULT_PIPELINE_ASSUMPTIONS;
}

export function getSavedApiKeys(): ApiKeysConfig {
  const defaults = getDefaultApiKeys();
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.API_KEYS);
    if (saved) {
      const parsed = JSON.parse(saved);
      const llmKeys = Array.isArray(parsed.llmKeys) && parsed.llmKeys.length > 0
        ? parsed.llmKeys
        : defaults.llmKeys;
      
      // If saved key is empty but env key is present, hydrate it
      if (defaults.llmKeys[0]?.key && (!llmKeys[0]?.key || llmKeys[0].key.length < 5)) {
        llmKeys[0] = defaults.llmKeys[0];
      }

      return {
        activeEngine: parsed.activeEngine || defaults.activeEngine,
        llmKeys,
        scraperKeys: Array.isArray(parsed.scraperKeys) ? parsed.scraperKeys : defaults.scraperKeys
      };
    }
  } catch (e) {}
  return defaults;
}

export function getSavedGuestDelta(): UserWorkspaceDelta {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.GUEST_DELTA);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}
  return { 
    deleted_ids: [], 
    stack_overrides: {}, 
    verified_overrides: {},
    arr_overrides: {},
    ontology_overrides: {}
  };
}

export function saveGuestDelta(delta: UserWorkspaceDelta): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GUEST_DELTA, JSON.stringify(delta));
  } catch (e) {}
}

export function getProvenanceDepth(startup: Startup): VerificationDepth {
  if (startup.verification_depth) return startup.verification_depth;
  const isVerified = Boolean(startup.database_stack && startup.database_stack !== 'Unknown');
  if (isVerified) return 'confirmed';
  if (startup.stack_source === 'google_search' || startup.stack_source === 'scraper') return 'deep_scraped';
  return 'surface_free';
}

export function getGtmClassification(startup: Startup, targetView: TargetView): {
  isChampion: boolean;
  isTarget: boolean;
  label: string;
  badgeColor: string;
} {
  const norm = normalizeFunctionalOntology(startup);
  const db = norm.primary_database;

  if (targetView === 'supabase') {
    const isChampion = db.includes('Supabase') || (db.includes('Postgres') && norm.vector_engine.includes('pgvector'));
    const isTarget = !isChampion && db !== 'Unknown';
    return {
      isChampion,
      isTarget,
      label: isChampion ? 'Supabase Native Champion' : isTarget ? 'Postgres Migration Target' : 'Unverified',
      badgeColor: isChampion ? 'emerald' : isTarget ? 'amber' : 'zinc'
    };
  } else if (targetView === 'neon') {
    const isChampion = db.includes('Neon');
    const isTarget = db.includes('RDS') || db.includes('Aurora') || db.includes('PostgreSQL');
    return {
      isChampion,
      isTarget,
      label: isChampion ? 'Neon Serverless Champion' : isTarget ? 'Serverless Auto-scale Target' : 'Unverified',
      badgeColor: isChampion ? 'emerald' : isTarget ? 'amber' : 'zinc'
    };
  } else if (targetView === 'planetscale') {
    const isChampion = db.includes('PlanetScale');
    const isTarget = db.includes('MySQL') || db.includes('Aurora');
    return {
      isChampion,
      isTarget,
      label: isChampion ? 'PlanetScale MySQL Champion' : isTarget ? 'Horizontal Sharding Target' : 'Unverified',
      badgeColor: isChampion ? 'emerald' : isTarget ? 'amber' : 'zinc'
    };
  } else if (targetView === 'mongodb') {
    const isChampion = db.includes('MongoDB');
    const isTarget = db.includes('Firestore') || db.includes('DynamoDB');
    return {
      isChampion,
      isTarget,
      label: isChampion ? 'MongoDB Document Champion' : isTarget ? 'Document Consolidation Target' : 'Unverified',
      badgeColor: isChampion ? 'emerald' : isTarget ? 'amber' : 'zinc'
    };
  } else if (targetView === 'clickhouse') {
    const isChampion = db.includes('ClickHouse');
    const isTarget = norm.olap_engine.includes('Elasticsearch') || norm.olap_engine.includes('Snowflake') || db.includes('PostgreSQL');
    return {
      isChampion,
      isTarget,
      label: isChampion ? 'ClickHouse OLAP Champion' : isTarget ? 'Columnar Sub-second OLAP Target' : 'Unverified',
      badgeColor: isChampion ? 'emerald' : isTarget ? 'amber' : 'zinc'
    };
  }

  return {
    isChampion: false,
    isTarget: false,
    label: 'Unassigned',
    badgeColor: 'zinc'
  };
}

export function applyWorkspaceDeltas(
  startups: Startup[], 
  delta: UserWorkspaceDelta
): Startup[] {
  if (!startups || !Array.isArray(startups)) return [];
  const deletedSet = new Set(delta.deleted_ids || []);

  return startups
    .filter(s => !deletedSet.has(s.id))
    .map(s => {
      const stackOverride = delta.stack_overrides?.[s.id];
      const verifiedOverride = delta.verified_overrides?.[s.id];
      const arrOverride = delta.arr_overrides?.[s.id];
      const ontologyOverride = delta.ontology_overrides?.[s.id];

      const database_stack = stackOverride !== undefined ? stackOverride : s.database_stack;
      const verification_status = verifiedOverride !== undefined 
        ? (verifiedOverride ? 'verified' : 'unverified')
        : (database_stack && database_stack !== 'Unknown' ? 'verified' : 'unverified');

      const norm = normalizeFunctionalOntology({ ...s, database_stack });

      return {
        ...s,
        database_stack,
        verification_status,
        verification_depth: getProvenanceDepth({ ...s, database_stack, verification_status }),
        custom_arr_override: arrOverride !== undefined ? arrOverride : s.custom_arr_override,
        primary_database: ontologyOverride?.primary_database || norm.primary_database,
        vector_engine: ontologyOverride?.vector_engine || norm.vector_engine,
        cache_layer: ontologyOverride?.cache_layer || norm.cache_layer,
        olap_engine: ontologyOverride?.olap_engine || norm.olap_engine,
        auth_provider: ontologyOverride?.auth_provider || norm.auth_provider,
        runtime_platform: ontologyOverride?.runtime_platform || norm.runtime_platform,
      };
    });
}

export function calculateGtmMetrics(
  startups: Startup[], 
  targetView: TargetView, 
  assumptions: PipelineAssumptions
): GtmMetrics {
  const tracked_startups = startups.length;
  let verified_count = 0;
  let champions_count = 0;
  let migration_count = 0;
  let totalArrDollars = 0;
  let surface_free_count = 0;
  let deep_scraped_count = 0;

  for (const s of startups) {
    const isVerified = Boolean(s.database_stack && s.database_stack !== 'Unknown');
    const depth = getProvenanceDepth(s);

    if (isVerified) {
      verified_count++;
    } else {
      if (depth === 'deep_scraped') deep_scraped_count++;
      else surface_free_count++;
    }

    const companyArr = calculateCompanyArr(s, assumptions, targetView);
    totalArrDollars += companyArr;

    const classification = getGtmClassification(s, targetView);
    if (classification.isChampion) {
      champions_count++;
    } else if (isVerified && companyArr > 0) {
      migration_count++;
    }
  }

  const supabase_share_pct = tracked_startups > 0 ? (champions_count / tracked_startups) * 100 : 0;
  const unverified_count = tracked_startups - verified_count;

  const formattedArr = totalArrDollars >= 1_000_000 
    ? `$${(totalArrDollars / 1_000_000).toFixed(1)}M`
    : `$${(totalArrDollars / 1_000).toFixed(0)}K`;

  const ai_vector_count = startups.filter(s => {
    const norm = normalizeFunctionalOntology(s);
    return norm.vector_engine && norm.vector_engine !== 'None';
  }).length;
  const ai_vector_penetration_pct = verified_count > 0 ? Math.round((ai_vector_count / verified_count) * 100) : 0;

  return {
    tracked_startups,
    verified_count,
    champions_count,
    migration_count,
    pipeline_arr_cents: Math.round(totalArrDollars * 100),
    pipeline_arr_formatted: formattedArr,
    supabase_share_pct,
    unverified_count,
    surface_free_count,
    deep_scraped_count,
    native_champions: champions_count,
    migration_pipeline_count: migration_count,
    pipeline_identified_usd: formattedArr,
    ai_vector_penetration_pct
  };
}
