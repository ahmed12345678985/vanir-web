import React, { useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { X } from 'lucide-react';

export default function FlightStatisticsModal({ open, onOpenChange, flights }) {
  // Compute Top 10 Airlines
  const airlineStats = useMemo(() => {
    if (!flights) return [];
    const counts = {};
    flights.forEach(f => {
      const name = f.airline || 'Unknown';
      if (!counts[name]) counts[name] = { count: 0, icao: f.callsign ? f.callsign.substring(0, 3) : '' };
      counts[name].count++;
    });
    return Object.entries(counts)
      .map(([name, data]) => ({ name, count: data.count, icao: data.icao }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [flights]);

  // Compute Top 10 Countries
  const countryStats = useMemo(() => {
    if (!flights) return [];
    const counts = {};
    flights.forEach(f => {
      const name = f.origin_country || 'Unknown';
      if (!counts[name]) counts[name] = { count: 0 };
      counts[name].count++;
    });
    return Object.entries(counts)
      .map(([name, data]) => ({ name, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [flights]);

  const getCountryCode = (name) => {
    const map = { 'United States': 'us', 'United Kingdom': 'gb', 'United Arab Emirates': 'ae', 'France': 'fr', 'Germany': 'de', 'Saudi Arabia': 'sa', 'Egypt': 'eg', 'Turkey': 'tr', 'Ireland': 'ie', 'China': 'cn', 'Malta': 'mt', 'Spain': 'es', 'Japan': 'jp', 'Poland': 'pl', 'Austria': 'at', 'India': 'in', 'Canada': 'ca', 'Australia': 'au', 'Republic of Korea': 'kr' };
    return map[name] || 'un';
  };

  const CustomAirlineTick = ({ x, y, payload }) => {
    const item = airlineStats.find(a => a.name === payload.value);
    return (
      <g transform={`translate(${x},${y})`}>
        {item && item.icao && (
          <image href={`https://pics.avs.io/60/60/${item.icao}.png`} x="-110" y="-12" height="24" width="24" style={{ borderRadius: '4px', background: '#fff' }} />
        )}
        <text x="-75" y="4" fill="#a0aec0" fontSize="12" textAnchor="start">
          {payload.value.length > 12 ? payload.value.substring(0, 12) + '...' : payload.value}
        </text>
      </g>
    );
  };

  const CustomCountryTick = ({ x, y, payload }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <image href={`https://flagcdn.com/24x18/${getCountryCode(payload.value)}.png`} x="-110" y="-9" height="18" width="24" />
        <text x="-75" y="4" fill="#a0aec0" fontSize="12" textAnchor="start">
          {payload.value.length > 12 ? payload.value.substring(0, 12) + '...' : payload.value}
        </text>
      </g>
    );
  };

  const colors = ['#d4af37', '#8a2be2', '#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', zIndex: 40 }} />
        <Dialog.Content style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90vw', maxWidth: '600px', maxHeight: '85vh', backgroundColor: 'rgba(15, 20, 35, 0.95)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '16px', padding: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', zIndex: 50, color: '#fff', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '20px' }}>
            <Dialog.Title style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#d4af37' }}>
              Flight Statistics
            </Dialog.Title>
            <Dialog.Close style={{ background: 'transparent', border: 'none', color: '#a0aec0', cursor: 'pointer' }}>
              <X size={20} />
            </Dialog.Close>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#cbd5e1' }}>
              <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{flights?.length || 0}</span> Active Flights Tracked
            </h3>
            
            <h4 style={{ color: '#d4af37', marginBottom: '10px' }}>Top Airlines</h4>
            <div style={{ width: '100%', height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={airlineStats} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} tick={<CustomAirlineTick />} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f1423', border: '1px solid #d4af37', borderRadius: '8px' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12}>
                    {airlineStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#d4af37', marginBottom: '10px' }}>Top Countries</h4>
            <div style={{ width: '100%', height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryStats} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} tick={<CustomCountryTick />} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f1423', border: '1px solid #d4af37', borderRadius: '8px' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12}>
                    {countryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[(index + 3) % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
