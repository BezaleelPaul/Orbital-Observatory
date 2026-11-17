import { describe, expect, it } from 'vitest';
import {
  calculateOrbitPosition,
  calculateVisVivaVelocity,
  generateOrbitPath,
  solveKepler,
} from '@/lib/kepler';
import type { CelestialBodyData } from '@/types/simulation';

const TWO_PI = Math.PI * 2;

function body(overrides: Partial<CelestialBodyData> = {}): CelestialBodyData {
  return {
    id: 'test',
    name: 'Test',
    type: 'planet',
    radius: 1,
    actualRadiusKm: 6371,
    color: '#fff',
    glowColor: '#fff',
    semiMajorAxis: 10,
    actualSemiMajorAxisAU: 1,
    eccentricity: 0,
    orbitalPeriodDays: 365.25,
    inclinationDeg: 0,
    argumentOfPeriapsisDeg: 0,
    longitudeOfAscendingNodeDeg: 0,
    meanAnomalyEpochDeg: 0,
    rotationPeriodHours: 24,
    axialTiltDeg: 0,
    massKg: '1',
    gravityMps2: 9.8,
    surfaceTempC: 15,
    orbitalVelocityKms: 29.78,
    atmosphericComposition: [],
    description: 'test body',
    ...overrides,
  };
}

describe('solveKepler', () => {
  it('is the identity for circular orbits', () => {
    for (const M of [0, 0.3, Math.PI, 5.9]) {
      expect(solveKepler(M, 0)).toBeCloseTo(M, 6);
    }
  });

  it('satisfies Kepler\'s equation to tolerance across eccentricities', () => {
    for (const e of [0.01, 0.1, 0.3, 0.5, 0.8, 0.9]) {
      for (const M of [0, 0.25, 1, Math.PI, 4, TWO_PI - 0.1]) {
        const E = solveKepler(M, e);
        const residual = E - e * Math.sin(E) - M;
        expect(Math.abs(residual)).toBeLessThan(1e-5);
      }
    }
  });

  it('converges for the high-eccentricity seed path (e > 0.8)', () => {
    const E = solveKepler(0.2, 0.95);
    expect(Math.abs(E - 0.95 * Math.sin(E) - 0.2)).toBeLessThan(1e-5);
  });
});

describe('calculateOrbitPosition', () => {
  it('places a body with no orbit at the origin', () => {
    const p = calculateOrbitPosition(body({ semiMajorAxis: 0 }), 123);
    expect(p.x).toBe(0);
    expect(p.y).toBe(0);
    expect(p.z).toBe(0);
  });

  it('starts a circular, uninclined orbit on the +x axis', () => {
    const p = calculateOrbitPosition(body({ eccentricity: 0 }), 0);
    expect(p.x).toBeCloseTo(10, 6);
    expect(p.y).toBeCloseTo(0, 6);
    expect(p.z).toBeCloseTo(0, 6);
  });

  it('moves a quarter period along +z for a circular orbit', () => {
    const b = body({ eccentricity: 0, semiMajorAxis: 10 });
    const p = calculateOrbitPosition(b, b.orbitalPeriodDays / 4);
    expect(p.x).toBeCloseTo(0, 5);
    expect(p.y).toBeCloseTo(0, 6);
    expect(p.z).toBeCloseTo(10, 5);
  });

  it('is periodic over one orbital period', () => {
    const b = body({ eccentricity: 0.4, semiMajorAxis: 12 });
    const start = calculateOrbitPosition(b, 17);
    const next = calculateOrbitPosition(b, 17 + b.orbitalPeriodDays);
    expect(next.x).toBeCloseTo(start.x, 4);
    expect(next.y).toBeCloseTo(start.y, 4);
    expect(next.z).toBeCloseTo(start.z, 4);
  });

  it('reaches periapsis and apoapsis distances for an eccentric orbit', () => {
    const b = body({ eccentricity: 0.5, semiMajorAxis: 10 });
    const peri = calculateOrbitPosition(b, 0).length();
    const apo = calculateOrbitPosition(b, b.orbitalPeriodDays / 2).length();
    expect(peri).toBeCloseTo(5, 5);
    expect(apo).toBeCloseTo(15, 5);
  });

  it('preserves the orbit radius when inclined and rotated', () => {
    const b = body({
      eccentricity: 0.2,
      inclinationDeg: 23.4,
      argumentOfPeriapsisDeg: 45,
      longitudeOfAscendingNodeDeg: 120,
    });
    for (const t of [0, 20, 90, 300]) {
      const radius = calculateOrbitPosition(b, t).length();
      expect(radius).toBeGreaterThanOrEqual(10 * (1 - 0.2) - 1e-6);
      expect(radius).toBeLessThanOrEqual(10 * (1 + 0.2) + 1e-6);
    }
  });
});

describe('generateOrbitPath', () => {
  it('returns an empty path for a body with no orbit', () => {
    expect(generateOrbitPath(body({ semiMajorAxis: 0 }))).toEqual([]);
  });

  it('closes the loop and keeps every vertex inside the orbital bounds', () => {
    const b = body({ eccentricity: 0.3, semiMajorAxis: 10, inclinationDeg: 15 });
    const points = generateOrbitPath(b, 120);
    expect(points).toHaveLength(121);

    const min = 10 * (1 - 0.3);
    const max = 10 * (1 + 0.3);
    for (const p of points) {
      expect(p.length()).toBeGreaterThanOrEqual(min - 1e-6);
      expect(p.length()).toBeLessThanOrEqual(max + 1e-6);
    }
    expect(points[0].distanceTo(points[points.length - 1])).toBeLessThan(1e-6);
  });

  it('agrees with calculateOrbitPosition at periapsis', () => {
    const b = body({ eccentricity: 0.2, semiMajorAxis: 8 });
    const path = generateOrbitPath(b, 90);
    const position = calculateOrbitPosition(b, 0);
    expect(path[0].distanceTo(position)).toBeLessThan(1e-6);
  });
});

describe('calculateVisVivaVelocity', () => {
  it('returns zero for degenerate inputs', () => {
    expect(calculateVisVivaVelocity(0, 1, 30)).toBe(0);
    expect(calculateVisVivaVelocity(1, 0, 30)).toBe(0);
    expect(calculateVisVivaVelocity(-1, 1, 30)).toBe(0);
  });

  it('returns the base velocity for a circular orbit (r = a)', () => {
    expect(calculateVisVivaVelocity(1, 1, 29.78)).toBe(29.78);
  });

  it('increases as the body falls toward periapsis', () => {
    const atApoapsis = calculateVisVivaVelocity(1.5, 1, 30);
    const atPeriapsis = calculateVisVivaVelocity(0.5, 1, 30);
    expect(atPeriapsis).toBeGreaterThan(atApoapsis);
  });
});
