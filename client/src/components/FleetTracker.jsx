import React, { useEffect, useRef, useState, useMemo } from 'react';
import Globe from 'globe.gl';
import * as THREE from 'three';
import { io } from 'socket.io-client';
import FlightStatisticsModal from './FlightStatisticsModal';
import FlightSettingsModal from './FlightSettingsModal';
import FlightLeaderboardModal from './FlightLeaderboardModal';

export default function FleetTracker() {
  const globeRef = useRef(null);
  const globeInstanceRef = useRef(null);
  
  // States
  const [flights, setFlights] = useState([]);
  const [activeFlight, setActiveFlight] = useState(null);
  const [statsOpen, setStatsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  
  const [settings, setSettings] = useState({
    showPathPrediction: true,
    showLabels: false,
    iconSize: window.innerWidth <= 768 ? 2.0 : 1.0,
    autoRotate: true,
    rotationSpeed: 0.4
  });

  // Socket Connection
  useEffect(() => {
    // In production, this connects to the same origin where the Node server is hosted
    const socket = io(); 
    
    socket.on('connect', () => {
      setSocketConnected(true);
      console.log('Live flight stream connected');
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('flights-update', (data) => {
      setFlights(data);
      // Auto-update active flight if it's currently selected
      setActiveFlight(prev => {
        if (!prev) return null;
        const updated = data.find(f => f.id === prev.id);
        return updated || prev;
      });
    });

    return () => socket.disconnect();
  }, []);

  // Initialize Globe
  useEffect(() => {
    if (!globeRef.current) return;

    const world = Globe()(globeRef.current)
      // High-res realistic earth textures
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png') // Starry background like Flight-Viz
      .backgroundColor('#05070c');
    
    globeInstanceRef.current = world;

    // Add Aesthetic 360 Grid Sphere (Wireframe) wrapping the earth slightly larger
    const gridGeometry = new THREE.SphereGeometry(101, 32, 32);
    const gridMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x3b82f6, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.08 
    });
    const gridSphere = new THREE.Mesh(gridGeometry, gridMaterial);
    world.scene().add(gridSphere);

    // Initial controls
    world.controls().autoRotate = settings.autoRotate;
    world.controls().autoRotateSpeed = settings.rotationSpeed;
    world.controls().enableZoom = true;

    return () => {
      if (world && typeof world._destructor === 'function') {
        world._destructor();
      }
    };
  }, []);

  // Effect to handle settings updates dynamically
  useEffect(() => {
    if (!globeInstanceRef.current) return;
    const world = globeInstanceRef.current;
    world.controls().autoRotate = settings.autoRotate;
    world.controls().autoRotateSpeed = settings.rotationSpeed;
  }, [settings.autoRotate, settings.rotationSpeed]);

  // Effect to update flights on the globe
  useEffect(() => {
    if (!globeInstanceRef.current) return;
    const world = globeInstanceRef.current;

    // Performance Optimization: Limit rendered flights based on device
    const isMobile = window.innerWidth <= 768;
    const MAX_FLIGHTS = isMobile ? 150 : 600;
    const visibleFlights = flights.slice(0, MAX_FLIGHTS);

    // Custom 3D Airplane Material
    const planeMaterial = new THREE.MeshLambertMaterial({ color: '#d4af37' });
    
    // Instead of lines, we draw actual 3D Custom Objects (Planes)
    world.customLayerData(visibleFlights)
      .customThreeObject((d) => {
        // A realistic stylized airplane using assembled geometries
        const group = new THREE.Group();
        
        // Extrude settings for wings and tail for a smooth 3D aerodynamic look
        const extrudeSettings = { depth: 0.05, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: 0.01, bevelThickness: 0.01 };
        
        // Fuselage (Sleek body)
        const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.2, 12), planeMaterial);
        fuselage.rotation.x = Math.PI / 2;
        group.add(fuselage);
        
        // Nose (Pointed)
        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 12), planeMaterial);
        nose.rotation.x = Math.PI / 2;
        nose.position.z = 1.35;
        group.add(nose);
        
        // Swept Wings
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.lineTo(1.4, -0.6); // Swept back
        wingShape.lineTo(1.4, -0.9);
        wingShape.lineTo(0, -0.3);
        
        const wings = new THREE.Mesh(new THREE.ExtrudeGeometry(wingShape, extrudeSettings), planeMaterial);
        wings.rotation.x = Math.PI / 2;
        wings.position.set(0, 0, 0.3);
        group.add(wings);
        
        // Mirror Right Wing to Left Wing
        const wingsLeft = wings.clone();
        wingsLeft.scale.set(-1, 1, 1);
        group.add(wingsLeft);
        
        // Tail Stabilizers (Horizontal)
        const tailShape = new THREE.Shape();
        tailShape.moveTo(0, 0);
        tailShape.lineTo(0.5, -0.3);
        tailShape.lineTo(0.5, -0.5);
        tailShape.lineTo(0, -0.2);
        
        const tail = new THREE.Mesh(new THREE.ExtrudeGeometry(tailShape, extrudeSettings), planeMaterial);
        tail.rotation.x = Math.PI / 2;
        tail.position.set(0, 0, -0.9);
        group.add(tail);
        
        const tailLeft = tail.clone();
        tailLeft.scale.set(-1, 1, 1);
        group.add(tailLeft);
        
        // Vertical Stabilizer
        const vertTail = new THREE.Mesh(new THREE.ExtrudeGeometry(tailShape, extrudeSettings), planeMaterial);
        vertTail.rotation.y = -Math.PI / 2;
        vertTail.position.set(0, 0.1, -0.9);
        group.add(vertTail);

        // Apply dynamic scale from settings
        group.scale.set(settings.iconSize, settings.iconSize, settings.iconSize);
        return group;
      })
      .customThreeObjectUpdate((obj, d) => {
        // Position and Orient the plane based on Lat/Lng/Heading
        Object.assign(obj.position, world.getCoords(d.latitude, d.longitude, d.altitude / 30000)); // Normalize altitude
        
        // Rotate the object to face its heading (true_track) tangent to the globe surface
        const lookAt = world.getCoords(d.latitude + 0.1 * Math.cos((d.true_track || 0) * Math.PI / 180), d.longitude + 0.1 * Math.sin((d.true_track || 0) * Math.PI / 180), d.altitude / 30000);
        obj.lookAt(lookAt.x, lookAt.y, lookAt.z);
        // Apply settings scale dynamically
        obj.scale.set(settings.iconSize, settings.iconSize, settings.iconSize);
      });

    // Handle user clicks on flights
    world.onCustomLayerClick((d) => {
      setActiveFlight(d);
      // Flash UI Effect
      const card = document.getElementById('active-flight-card');
      if (card) {
        card.style.borderColor = '#22c55e';
        setTimeout(() => card.style.borderColor = 'rgba(212, 175, 55, 0.15)', 600);
      }
    });

    // Render HTML Labels for callsigns if enabled
    if (settings.showLabels) {
      world.htmlElementsData(visibleFlights.slice(0, 50)) // Cap labels aggressively to prevent DOM lag
        .htmlElement(d => {
          const el = document.createElement('div');
          el.innerHTML = d.callsign;
          el.style.color = 'rgba(255, 255, 255, 0.7)';
          el.style.fontSize = `${10 * settings.iconSize}px`;
          el.style.pointerEvents = 'none';
          el.style.transform = `translate(-50%, 15px)`;
          return el;
        })
        .htmlLat(d => d.latitude)
        .htmlLng(d => d.longitude);
    } else {
      world.htmlElementsData([]);
    }

    // Render Trails/Paths if enabled
    if (settings.showPathPrediction && visibleFlights.length > 0) {
      // Create trailing lines based on current pos and a simulated past/future pos based on heading
      const paths = visibleFlights.map(f => {
        return {
          coords: [
            [f.latitude - 1.5 * Math.cos((f.true_track || 0) * Math.PI / 180), f.longitude - 1.5 * Math.sin((f.true_track || 0) * Math.PI / 180)], // Past trail
            [f.latitude, f.longitude] // Current
          ],
          airline: f.airline
        };
      });
      
      world.pathsData(paths)
        .pathPoints('coords')
        .pathPointLat(p => p[0])
        .pathPointLng(p => p[1])
        .pathColor(() => 'rgba(212, 175, 55, 0.4)')
        .pathDashLength(0.1)
        .pathDashGap(0.05)
        .pathDashAnimateTime(2000)
        .pathStroke(0.5);
    } else {
      world.pathsData([]);
    }

  }, [flights, settings.showPathPrediction, settings.showLabels, settings.iconSize]);

  const handleLeaderboard = () => {
    setLeaderboardOpen(true);
  };

  return (
    <section id="vanir-fleet-tracker" style={{ position: 'relative', width: '100%', height: '85vh', backgroundColor: '#05070c', overflow: 'hidden', borderBottom: '1px solid #1a2333' }}>
      
      {/* Left Sidebar UI - Glassmorphism */}
      <div id="tracker-sidebar" className="absolute bottom-0 left-0 w-full md:top-5 md:bottom-auto md:left-5 md:w-[380px] max-h-[50vh] md:max-h-[calc(100%-40px)] bg-[#0a0f1e]/85 backdrop-blur-md border border-[#d4af37]/20 rounded-t-2xl md:rounded-2xl p-4 md:p-6 text-white z-10 shadow-2xl overflow-y-auto flex flex-col gap-4 md:gap-5">
        
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo-vanir.png" alt="Vanir Group" style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'contain', boxShadow: '0 0 15px rgba(212,175,55,0.4)', background: '#fff' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
          <div style={{ display: 'none', width: '45px', height: '45px', background: 'linear-gradient(135deg, #d4af37, #aa7c11)', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', color: '#000', boxShadow: '0 0 15px rgba(212,175,55,0.4)' }}>V</div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#ffffff', fontWeight: '700', letterSpacing: '0.5px' }}>VANIR GROUP</h2>
            <span style={{ fontSize: '11px', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '1px' }}>Real-Time Flight Viz</span>
          </div>
        </div>

        {/* Global Navigation Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setStatsOpen(true)} style={{ flex: 1, padding: '8px 0', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#22c55e', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
            Statistics
          </button>
          <button onClick={handleLeaderboard} style={{ flex: 1, padding: '8px 0', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#d4af37', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
            Leaderboard
          </button>
          <button onClick={() => setSettingsOpen(true)} style={{ flex: 1, padding: '8px 0', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#a0aec0', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
            Settings
          </button>
        </div>

        {/* Status Radar */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#a0aec0' }}>{socketConnected ? 'Live Connection Active' : 'Connecting to Satellite...'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', background: socketConnected ? '#22c55e' : '#f59e0b', borderRadius: '50%', display: 'inline-block', boxShadow: socketConnected ? '0 0 8px #22c55e' : 'none' }}></span>
            <span style={{ color: socketConnected ? '#22c55e' : '#f59e0b', fontSize: '12px', fontWeight: 'bold' }}>{flights.length} flights</span>
          </div>
        </div>

        {/* Active Flight Detailed Telemetry Card */}
        <div id="active-flight-card" style={{ background: 'rgba(212, 175, 55, 0.05)', border: '1px solid rgba(212, 175, 55, 0.15)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'border-color 0.3s' }}>
          {activeFlight ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#d4af37', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeFlight.airline || 'Unknown Airline'}</span>
                <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{activeFlight.callsign}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#cbd5e1', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                <div><strong>Origin Country:</strong> <span style={{ color: '#fff' }}>{activeFlight.origin_country}</span></div>
                <div><strong>Altitude:</strong> <span style={{ color: '#22c55e' }}>{activeFlight.altitude} m</span></div>
                <div><strong>Speed:</strong> <span style={{ color: '#22c55e' }}>{activeFlight.velocity} km/h</span></div>
                <div><strong>Heading (Track):</strong> <span style={{ color: '#fff' }}>{activeFlight.true_track}°</span></div>
                <div><strong>Coordinates:</strong> <span style={{ color: '#a0aec0' }}>{activeFlight.latitude?.toFixed(4)}, {activeFlight.longitude?.toFixed(4)}</span></div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#a0aec0', fontSize: '13px' }}>
              <span style={{ display: 'block', fontSize: '24px', marginBottom: '10px' }}>🌍</span>
              Click any golden aircraft on the globe to intercept live radar telemetry.
            </div>
          )}
        </div>

      </div>

      {/* WebGL Canvas Centered next to Sidebar */}
      <div className="w-full h-full md:pl-[380px] transition-all duration-300">
        <div ref={globeRef} style={{ width: '100%', height: '100%', cursor: 'grab' }}></div>
      </div>

      {/* Modals */}
      <FlightStatisticsModal open={statsOpen} onOpenChange={setStatsOpen} flights={flights} />
      <FlightLeaderboardModal open={leaderboardOpen} onOpenChange={setLeaderboardOpen} flights={flights} />
      <FlightSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} settings={settings} setSettings={setSettings} />
    </section>
  );
}
