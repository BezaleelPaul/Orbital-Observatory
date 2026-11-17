# Orbital Observatory: 3D Keplerian Engine

An interactive solar-system planetarium built with Next.js, React Three Fiber, Three.js and a custom Keplerian orbital solver.

**Live demo:** https://bezaleelpaul.github.io/Orbital-Observatory/

## Run locally

```bash
npm ci
npm run dev
```

## Testing

The orbital solver (`src/lib/kepler.ts`) is covered by a Vitest suite that
checks Kepler's equation against known solutions, orbital periodicity,
periapsis/apoapsis distances, inclination invariants and path bounds.

```bash
npm run typecheck
npm test
```

CI runs typecheck, tests and the production build before publishing.

## Deploy

GitHub Actions builds a static export and publishes it to GitHub Pages at `https://bezaleelpaul.github.io/Orbital-Observatory/` whenever changes are pushed to `main`.

## License

MIT — see [LICENSE](./LICENSE).

## Controls

- Drag to orbit the camera; scroll to zoom.
- Select a planet to inspect its orbital and physical data.
- Use the time controls to pause or accelerate the simulation.
- Flight mode supports WASD, arrow keys, Q/E roll, and Space boost.

NASA Open API and ISS telemetry are optional live data sources; the 3D solar-system simulation runs locally in the browser.
