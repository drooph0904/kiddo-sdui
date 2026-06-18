import { getProductVisual } from './productVisual';

describe('getProductVisual', () => {
  it('maps known product keywords to a relevant emoji', () => {
    expect(getProductVisual('Pampers Baby-Dry Diapers Tape S').emoji).toBe('🧷');
    expect(getProductVisual('Act II Caramel Popcorn Party Tub').emoji).toBe('🍿');
    expect(getProductVisual('Nestle NAN PRO 1 Infant Formula').emoji).toBe('🍼');
    expect(getProductVisual('Fisher-Price Soothing Rattle').emoji).toBe('🧸');
  });

  it('returns a stable pastel background for each match', () => {
    const v = getProductVisual('Himalaya Baby Gentle Wipes');
    expect(v.bg).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it('falls back to a default for unrecognized titles', () => {
    const v = getProductVisual('Quantum Flux Capacitor 9000');
    expect(v.emoji).toBe('🛒');
  });
});
