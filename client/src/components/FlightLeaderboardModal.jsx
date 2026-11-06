import React, { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export default function FlightLeaderboardModal({ open, onOpenChange, flights }) {
  const [activeTab, setActiveTab] = useState('Fastest');

  const leaderboardData = useMemo(() => {
    if (!flights || flights.length === 0) return [];
    
    let sorted = [...flights];
    if (activeTab === 'Fastest') {
      sorted.sort((a, b) => Number(b.velocity) - Number(a.velocity));
    } else if (activeTab === 'Highest') {
      sorted.sort((a, b) => Number(b.altitude) - Number(a.altitude));
    } else if (activeTab === 'Lowest') {
      // Filter out planes on ground (altitude < 100) for a better 'lowest airborne' metric
      sorted = sorted.filter(f => Number(f.altitude) > 100).sort((a, b) => Number(a.altitude) - Number(b.altitude));
    }
    return sorted.slice(0, 15); // Top 15
  }, [flights, activeTab]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', zIndex: 40 }} />
        <Dialog.Content style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90vw', maxWidth: '700px', maxHeight: '85vh', backgroundColor: 'rgba(15, 20, 35, 0.95)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '16px', padding: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', zIndex: 50, color: '#fff', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '20px' }}>
            <Dialog.Title style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#d4af37' }}>
              Leaderboard
            </Dialog.Title>
            <Dialog.Close style={{ background: 'transparent', border: 'none', color: '#a0aec0', cursor: 'pointer' }}>
              <X size={20} />
            </Dialog.Close>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['Fastest', 'Highest', 'Lowest'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '6px 16px', 
                  borderRadius: '20px', 
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  backgroundColor: activeTab === tab ? '#d4af37' : 'rgba(255,255,255,0.05)',
                  color: activeTab === tab ? '#000' : '#a0aec0',
                  transition: 'all 0.2s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ width: '100%', borderCollapse: 'collapse' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '8px', color: '#a0aec0', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
              <div style={{ width: '10%' }}>#</div>
              <div style={{ width: '20%' }}>Flight</div>
              <div style={{ width: '40%' }}>Airline</div>
              <div style={{ width: '30%', textAlign: 'right' }}>{activeTab === 'Fastest' ? 'Speed' : 'Altitude'}</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {leaderboardData.map((flight, index) => (
                <div key={flight.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '14px' }}>
                  <div style={{ width: '10%', color: '#a0aec0' }}>{index + 1}</div>
                  <div style={{ width: '20%', color: '#3b82f6', fontWeight: 'bold' }}>{flight.callsign}</div>
                  <div style={{ width: '40%', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img 
                      src={`https://pics.avs.io/60/60/${flight.callsign.substring(0,3)}.png`} 
                      onError={(e) => { e.target.style.display = 'none'; }} 
                      alt="" 
                      style={{ width: '20px', height: '20px', objectFit: 'contain', background: '#fff', borderRadius: '4px' }} 
                    />
                    <span style={{ color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{flight.airline || 'Unknown'}</span>
                  </div>
                  <div style={{ width: '30%', textAlign: 'right', color: '#22c55e' }}>
                    {activeTab === 'Fastest' ? `${flight.velocity} km/h` : `${flight.altitude} m`}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
