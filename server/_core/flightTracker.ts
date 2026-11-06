import { Server } from "socket.io";
import axios from "axios";

// Fallback dynamic generator in case OpenSky is rate-limited or blocks the server IP
function generateFallbackFlights(count: number) {
  const flights: any[] = [];
  const airlines = ['VANIR PRIVATE JET', 'Emirates', 'Qatar Airways', 'Lufthansa', 'Delta Air Lines', 'Air France', 'Ryanair', 'Turkish Airlines', 'United Airlines', 'easyJet', 'Saudi Airlines'];
  const countries = ['United States', 'United Kingdom', 'United Arab Emirates', 'France', 'Germany', 'Saudi Arabia', 'Egypt', 'Turkey', 'Ireland', 'China', 'Malta'];
  
  for (let i = 0; i < count; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    flights.push({
      id: `fallback-${i}`,
      callsign: `${airline.substring(0, 3).toUpperCase()}${100 + i}`,
      origin_country: countries[Math.floor(Math.random() * countries.length)],
      longitude: (Math.random() * 360) - 180,
      latitude: (Math.random() * 180) - 90,
      altitude: Math.floor(Math.random() * (12000 - 3000 + 1)) + 3000,
      velocity: Math.floor(Math.random() * (950 - 400 + 1)) + 400,
      true_track: Math.random() * 360, // Heading in degrees
      airline: airline
    });
  }
  
  // Slightly move them each tick to simulate live tracking
  setInterval(() => {
    flights.forEach(f => {
      // Very basic movement calculation for visual effect
      f.longitude += (Math.cos((f.true_track - 90) * (Math.PI / 180)) * f.velocity) / 40000;
      f.latitude -= (Math.sin((f.true_track - 90) * (Math.PI / 180)) * f.velocity) / 40000;
      
      // Wrap around globe
      if (f.longitude > 180) f.longitude -= 360;
      if (f.longitude < -180) f.longitude += 360;
      if (f.latitude > 90) f.latitude = 90;
      if (f.latitude < -90) f.latitude = -90;
    });
  }, 1000);

  return flights;
}

const fallbackCache = generateFallbackFlights(2000);

export function initializeFlightTracker(io: Server) {
  let activeConnections = 0;
  
  io.on("connection", (socket) => {
    activeConnections++;
    console.log(`[FlightTracker] Client connected. Total: ${activeConnections}`);
    
    // Immediately send current cache to the new client
    socket.emit("flights-update", fallbackCache);

    socket.on("disconnect", () => {
      activeConnections--;
      console.log(`[FlightTracker] Client disconnected. Total: ${activeConnections}`);
    });
  });

  // Poll OpenSky API every 15 seconds
  setInterval(async () => {
    if (activeConnections === 0) return; // Save bandwidth if no one is watching

    try {
      // Bounding box for global (or can be restricted). Fetching all might be heavy, but we'll try.
      const response = await axios.get("https://opensky-network.org/api/states/all", {
        auth: {
          username: "roshdi",
          password: "Roshdi82@a"
        },
        timeout: 8000
      });
      
      const states = response.data.states;
      if (!states || states.length === 0) throw new Error("No data returned");
      
      // Map OpenSky Array to Object
      // OpenSky format: [0: icao24, 1: callsign, 2: origin_country, 3: time_position, 4: last_contact, 5: longitude, 6: latitude, 7: baro_altitude, 8: on_ground, 9: velocity, 10: true_track, ...]
      const liveFlights = states
        .filter((s: any) => !s[8] && s[5] !== null && s[6] !== null && s[7] !== null) // Only airborne with coords
        .map((s: any) => {
          let airlineName = s[2];
          // Simple mock mapper for recognizable names in UI
          if (s[1] && typeof s[1] === 'string') {
            const cs = s[1].toUpperCase();
            if (cs.startsWith('EK') || cs.startsWith('UAE')) airlineName = 'Emirates';
            else if (cs.startsWith('QTR')) airlineName = 'Qatar Airways';
            else if (cs.startsWith('SVA')) airlineName = 'Saudi Airlines';
            else if (cs.startsWith('BAW')) airlineName = 'British Airways';
            else if (cs.startsWith('DAL')) airlineName = 'Delta Air Lines';
            else if (cs.startsWith('RYR')) airlineName = 'Ryanair';
            else if (cs.startsWith('THY')) airlineName = 'Turkish Airlines';
            else if (cs.startsWith('UAL')) airlineName = 'United Airlines';
          }
          return {
            id: s[0],
            callsign: s[1]?.trim() || "UNKNOWN",
            origin_country: s[2],
            longitude: s[5],
            latitude: s[6],
            altitude: s[7], // meters
            velocity: (s[9] * 3.6).toFixed(0), // m/s to km/h
            true_track: s[10], // Heading
            airline: airlineName
          }
        })
        .slice(0, 2500); // Limit to 2500 flights to not overload client browser WebGL

      io.emit("flights-update", liveFlights);

    } catch (error: any) {
      // console.log("[FlightTracker] OpenSky API Error, falling back to simulated data.", error.message);
      // Broadcast simulated data if the API rate limits us
      io.emit("flights-update", fallbackCache);
    }
  }, 15000);
}
