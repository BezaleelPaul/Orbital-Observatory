# Orbital Observatory: 3D Keplerian Engine

An interactive solar-system planetarium built with Next.js, React Three Fiber, Three.js and a custom Keplerian orbital solver.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

GitHub Actions builds a static export and publishes it to GitHub Pages at `https://bezaleelpaul.github.io/Orbital-Observatory/`.

## Controls

- Drag to orbit the camera; scroll to zoom.
- Select a planet to inspect its orbital and physical data.
- Use the time controls to pause or accelerate the simulation.
- Flight mode supports WASD, arrow keys, Q/E roll, and Space boost.

NASA Open API and ISS telemetry are optional live data sources; the 3D solar-system simulation runs locally in the browser.
