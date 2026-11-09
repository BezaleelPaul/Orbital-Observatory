'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { CELESTIAL_BODIES } from '@/lib/constants';
import type { CelestialBodyData, SpacecraftState } from '@/types/simulation';
import { fetchNasaDiscoveries, type NasaLiveTelemetry } from '@/lib/nasaApi';
const SpaceCanvas = dynamic(() => import('@/components/canvas/SpaceCanvas').then(m => m.SpaceCanvas), { ssr: false });
const initialShip: SpacecraftState = { position:[0,2,28],velocity:[0,0,0],rotation:[0,0,0],throttle:0,isBoosting:false,speedKms:0,fuelPercent:100,targetId:null,mode:'free' };
export default function Observatory(){
 const [selected,setSelected]=useState<CelestialBodyData|null>(CELESTIAL_BODIES.find(b=>b.id==='earth')??null);
 const [elapsedDays,setElapsedDays]=useState(0),[speed,setSpeed]=useState(18),[running,setRunning]=useState(true);
 const [cameraMode,setCameraMode]=useState<'free'|'orbit'|'flight'|'cockpit'>('free');
 const [ship,setShip]=useState<SpacecraftState>(initialShip),[nasa,setNasa]=useState<NasaLiveTelemetry|null>(null),[loading,setLoading]=useState(false);
 useEffect(()=>{if(!running)return;const id=window.setInterval(()=>setElapsedDays(v=>v+speed/25),80);return()=>clearInterval(id)},[running,speed]);
 const simDate=new Date(Date.UTC(2026,0,1)+elapsedDays*86400000).toISOString().slice(0,10);
 async function syncNasa(){setLoading(true);try{setNasa(await fetchNasaDiscoveries())}finally{setLoading(false)}}
 return <main className="shell">
  <header className="topbar"><a className="brand" href="https://github.com/BezaleelPaul/Orbital-Observatory"><b>O</b> ORBITAL OBSERVATORY</a><span className="top-meta">● SOL SYSTEM / KEPLERIAN ENGINE</span><a className="source" href="https://github.com/BezaleelPaul/Orbital-Observatory">SOURCE ↗</a></header>
  <section className="intro"><div><p className="eyebrow">INTERACTIVE PLANETARIUM / 001</p><h1>THE SOLAR<br/><em>SYSTEM.</em></h1></div><p>Explore planetary motion through a live 3D model powered by Keplerian orbital mechanics. Select a world, inspect its physical data, and move through simulated time.</p></section>
  <section className="workspace"><div className="visual"><div className="visual-head"><span>● RENDER CORE ONLINE</span><span>WEBGL / THREE.JS</span></div><div className="canvas"><SpaceCanvas elapsedDays={elapsedDays} selectedBody={selected} onSelectBody={setSelected} cameraMode={cameraMode} onSpacecraftUpdate={setShip} spacecraftState={ship}/></div><div className="visual-foot"><span>SIM DATE <b>{simDate}</b></span><span>ORBITAL TIME <b>{Math.floor(elapsedDays)} DAYS</b></span><span>CAMERA <b>{cameraMode.toUpperCase()}</b></span></div></div>
  <aside className="panel"><div className="panel-head"><span>01 / TELEMETRY</span><i>LIVE MODEL</i></div><p className="label">SELECTED BODY</p><h2>{selected?.name??'Select a planet'}</h2><p className="description">{selected?.description??'Choose a celestial body in the simulation.'}</p>
  {selected&&<div className="stats">{[['MEAN ORBIT',selected.orbitalPeriodDays+' days'],['SEMI-MAJOR AXIS',selected.actualSemiMajorAxisAU.toFixed(3)+' AU'],['ECCENTRICITY',selected.eccentricity.toFixed(4)],['GRAVITY',selected.gravityMps2+' m/s²'],['SURFACE TEMP',selected.surfaceTempC+' °C'],['ORBITAL SPEED',selected.orbitalVelocityKms+' km/s']].map(([k,v])=><div key={k}><small>{k}</small><b>{v}</b></div>)}</div>}
  <p className="label">CAMERA MODE</p><div className="modes">{(['free','orbit','flight','cockpit'] as const).map(m=><button className={cameraMode===m?'active':''} key={m} onClick={()=>setCameraMode(m)}>{m}</button>)}</div>
  <p className="label">TIME CONTROL</p><div className="actions"><button onClick={()=>setRunning(!running)}>{running?'Ⅱ PAUSE':'▶ RESUME'}</button><button onClick={()=>{setElapsedDays(0);setRunning(true)}}>↺ RESET</button></div>
  <div className="speed"><span>TIME SCALE</span><b>{speed}×</b></div><input type="range" min="1" max="100" value={speed} onChange={e=>setSpeed(+e.target.value)}/>
  <p className="label">CELESTIAL BODIES</p><div className="bodies">{CELESTIAL_BODIES.filter(b=>!b.parentBodyId).map(b=><button key={b.id} className={selected?.id===b.id?'chosen':''} onClick={()=>setSelected(b)}><i style={{background:b.color}}/>{b.name}</button>)}</div>
  <p className="hint">{cameraMode==='flight'||cameraMode==='cockpit'?'FLIGHT · WASD / ARROWS · Q/E ROLL · SPACE BOOST':'DRAG TO ORBIT · SCROLL TO ZOOM · CLICK A PLANET TO INSPECT'}</p></aside></section>
  <section className="lower"><article><p className="eyebrow">02 / ORBITAL MECHANICS</p><h2>NEWTON-RAPHSON<br/><em>KEPLER SOLVER.</em></h2><p>The engine solves Kepler’s equation <code>M = E − e sin(E)</code> iteratively, then transforms orbital-plane coordinates into a 3D heliocentric frame using inclination, argument of periapsis, and ascending node.</p><div className="metrics"><span><b>30</b> MAX ITERATIONS</span><span><b>10⁻⁶</b> SOLVER TOLERANCE</span><span><b>3D</b> ORBITAL FRAME</span></div></article>
  <article><div className="nasa-head"><p className="eyebrow">03 / OBSERVATION FEED</p><button onClick={syncNasa} disabled={loading}>{loading?'SYNCING…':'SYNC NASA DATA ↗'}</button></div><h2>{nasa?.apod.title??'Beyond the model.'}</h2><p>{nasa?.apod.explanation??'Connect public astronomy feeds for the Astronomy Picture of the Day, near-Earth object summaries, and International Space Station telemetry.'}</p>{nasa&&<div className="nasa-data"><span>APOD / {nasa.apod.date}</span><span>{nasa.neoCountToday} NEO</span><span>ISS / {nasa.iss.altitudeKm.toFixed(1)} KM</span><span>{nasa.source.toUpperCase()}</span></div>}{nasa?.apod.media_type==='image'&&<a className="apod" href={nasa.apod.hdurl||nasa.apod.url} target="_blank" rel="noreferrer">OPEN ASTRONOMY IMAGE ↗</a>}</article></section>
  <footer><span>ORBITAL OBSERVATORY / CELESTIAL MECHANICS</span><span>THREE.JS · REACT THREE FIBER · NEXT.JS</span><a href="https://github.com/BezaleelPaul/Orbital-Observatory">GITHUB ↗</a></footer>
 </main>
}
