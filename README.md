# Orbital Observatory

An interactive 3D solar-system planetarium built with **Next.js, React Three Fiber, Three.js**, and a custom Keplerian orbital solver.

**Live demo:** https://bezaleelpaul.github.io/Orbital-Observatory/  
**Source:** https://github.com/BezaleelPaul/Orbital-Observatory

## What it does

- Renders an interactive solar-system scene in the browser.
- Uses a custom Keplerian solver to calculate orbital positions.
- Lets visitors inspect planetary orbital and physical data.
- Includes simulation time controls and a flight mode.
- Can optionally display live information from NASA Open APIs and ISS telemetry; the core solar-system simulation runs locally in the browser.

## Technology

- Next.js and React
- React Three Fiber and Three.js
- TypeScript
- Vitest for solver tests
- GitHub Actions and GitHub Pages for static deployment

## Run locally

Use a Node.js version compatible with the repository's package configuration.

```bash
git clone https://github.com/BezaleelPaul/Orbital-Observatory.git
cd Orbital-Observatory
npm ci
npm run dev
```

Open the local URL printed by Next.js.

## Verify changes

```bash
npm run typecheck
npm test
```

The Vitest suite for `src/lib/kepler.ts` checks known Kepler-equation solutions, orbital periodicity, periapsis and apoapsis distances, inclination invariants, and path bounds.

The repository's GitHub Actions workflow runs type checking, tests, and a production build before publishing. Run the commands above locally before opening a pull request.

## Controls

- **Drag:** orbit the camera.
- **Scroll:** zoom.
- **Select a planet:** inspect its orbital and physical data.
- **Time controls:** pause or change simulation speed.
- **Flight mode:** WASD / arrow keys to move, Q/E to roll, Space to boost.

## Deployment

The project is configured for a static GitHub Pages deployment:

https://bezaleelpaul.github.io/Orbital-Observatory/

Changes pushed to `main` trigger the repository's GitHub Actions deployment workflow.

## Scope and limitations

This is an educational visualization, not a precision ephemeris or mission-planning tool. Orbital calculations use the model implemented in the repository; external live-data integrations may depend on network availability and third-party API limits.

## License

MIT. See [LICENSE](./LICENSE).
