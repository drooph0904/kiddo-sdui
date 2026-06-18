/**
 * Explicit, cross-platform cache pipeline for remote campaign animations.
 *
 * Requirement: remote campaign media must not be re-downloaded on every campaign switch.
 * lottie-react-native does its own platform caching, but we make the pipeline explicit and
 * deterministic here: each animation URL is fetched exactly once, its parsed JSON is held in
 * a module-level Map, and every later request (e.g. switching back to a campaign) resolves
 * synchronously from memory — no second network round-trip.
 */
import { useEffect, useState } from 'react';
import type { AnimationObject } from 'lottie-react-native';

/** url -> parsed Lottie composition JSON. Lives for the app session. */
const cache = new Map<string, AnimationObject>();
/** url -> in-flight fetch, so concurrent callers share one request. */
const inflight = new Map<string, Promise<AnimationObject>>();

function load(url: string): Promise<AnimationObject> {
  const cached = cache.get(url);
  if (cached) return Promise.resolve(cached);

  const existing = inflight.get(url);
  if (existing) return existing;

  const request = fetch(url)
    .then((res) => res.json() as Promise<AnimationObject>)
    .then((json) => {
      cache.set(url, json);
      inflight.delete(url);
      return json;
    })
    .catch((err) => {
      inflight.delete(url);
      throw err;
    });

  inflight.set(url, request);
  return request;
}

/**
 * Returns the cached Lottie composition for `url`, fetching it once on first use.
 * `null` while the first fetch is in flight (the overlay simply renders nothing until ready).
 *
 * A cache hit resolves synchronously during render; only a cache miss schedules the async
 * fetch in an effect — so no setState fires inside the effect on the hot (cached) path.
 */
export function useCachedLottie(url: string): AnimationObject | null {
  // Synchronous read of the module cache — a hit returns instantly with no state churn.
  const cached = cache.get(url) ?? null;
  const [fetched, setFetched] = useState<AnimationObject | null>(null);

  useEffect(() => {
    if (cache.has(url)) return; // already available synchronously above
    let active = true;
    load(url)
      .then((json) => {
        if (active) setFetched(json);
      })
      .catch(() => {
        // A failed animation fetch must never break the shopping UI; just stay invisible.
        if (active) setFetched(null);
      });
    return () => {
      active = false;
    };
  }, [url]);

  return cached ?? fetched;
}
