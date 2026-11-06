import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Switch from '@radix-ui/react-switch';
import * as Slider from '@radix-ui/react-slider';
import { X } from 'lucide-react';

export default function FlightSettingsModal({ open, onOpenChange, settings, setSettings }) {
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', zIndex: 40 }} />
        <Dialog.Content style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90vw', maxWidth: '400px', backgroundColor: 'rgba(15, 20, 35, 0.95)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '16px', padding: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', zIndex: 50, color: '#fff' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '20px' }}>
            <Dialog.Title style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#d4af37' }}>
              Tracker Settings
            </Dialog.Title>
            <Dialog.Close style={{ background: 'transparent', border: 'none', color: '#a0aec0', cursor: 'pointer' }}>
              <X size={20} />
            </Dialog.Close>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Display Section */}
            <div>
              <h4 style={{ color: '#d4af37', marginBottom: '12px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Display</h4>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '15px', color: '#fff' }}>Flight path prediction</label>
                  <p style={{ fontSize: '11px', color: '#a0aec0', margin: '2px 0 0 0' }}>Dashed line from plane to destination</p>
                </div>
                <Switch.Root 
                  checked={settings.showPathPrediction}
                  onCheckedChange={(v) => updateSetting('showPathPrediction', v)}
                  style={{ width: '42px', height: '24px', backgroundColor: settings.showPathPrediction ? '#22c55e' : 'rgba(255,255,255,0.2)', borderRadius: '9999px', position: 'relative', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
                >
                  <Switch.Thumb style={{ display: 'block', width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '9999px', transition: 'transform 0.2s', transform: `translateX(${settings.showPathPrediction ? '20px' : '2px'})` }} />
                </Switch.Root>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '15px', color: '#fff' }}>Flight labels</label>
                  <p style={{ fontSize: '11px', color: '#a0aec0', margin: '2px 0 0 0' }}>Callsign labels on the map</p>
                </div>
                <Switch.Root 
                  checked={settings.showLabels}
                  onCheckedChange={(v) => updateSetting('showLabels', v)}
                  style={{ width: '42px', height: '24px', backgroundColor: settings.showLabels ? '#22c55e' : 'rgba(255,255,255,0.2)', borderRadius: '9999px', position: 'relative', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
                >
                  <Switch.Thumb style={{ display: 'block', width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '9999px', transition: 'transform 0.2s', transform: `translateX(${settings.showLabels ? '20px' : '2px'})` }} />
                </Switch.Root>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '15px', color: '#fff' }}>Icon size</label>
                  <p style={{ fontSize: '11px', color: '#a0aec0', margin: '2px 0 0 0' }}>Adjust aircraft marker size</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Slider.Root 
                    value={[settings.iconSize]}
                    onValueChange={(v) => updateSetting('iconSize', v[0])}
                    max={3} min={0.5} step={0.1}
                    style={{ position: 'relative', display: 'flex', alignItems: 'center', userSelect: 'none', touchAction: 'none', width: '100px', height: '20px' }}
                  >
                    <Slider.Track style={{ backgroundColor: 'rgba(255,255,255,0.2)', position: 'relative', flexGrow: 1, borderRadius: '9999px', height: '4px' }}>
                      <Slider.Range style={{ position: 'absolute', backgroundColor: '#d4af37', borderRadius: '9999px', height: '100%' }} />
                    </Slider.Track>
                    <Slider.Thumb style={{ display: 'block', width: '16px', height: '16px', backgroundColor: '#d4af37', boxShadow: '0 2px 10px rgba(0,0,0,0.3)', borderRadius: '10px', outline: 'none' }} />
                  </Slider.Root>
                  <span style={{ fontSize: '12px', color: '#a0aec0', width: '30px' }}>{settings.iconSize.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Globe Section */}
            <div>
              <h4 style={{ color: '#d4af37', marginBottom: '12px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Globe</h4>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '15px', color: '#fff' }}>Auto-rotate on startup</label>
                </div>
                <Switch.Root 
                  checked={settings.autoRotate}
                  onCheckedChange={(v) => updateSetting('autoRotate', v)}
                  style={{ width: '42px', height: '24px', backgroundColor: settings.autoRotate ? '#22c55e' : 'rgba(255,255,255,0.2)', borderRadius: '9999px', position: 'relative', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
                >
                  <Switch.Thumb style={{ display: 'block', width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '9999px', transition: 'transform 0.2s', transform: `translateX(${settings.autoRotate ? '20px' : '2px'})` }} />
                </Switch.Root>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <label style={{ fontSize: '15px', color: '#fff' }}>Rotation speed</label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Slider.Root 
                    value={[settings.rotationSpeed]}
                    onValueChange={(v) => updateSetting('rotationSpeed', v[0])}
                    max={3} min={0} step={0.1}
                    style={{ position: 'relative', display: 'flex', alignItems: 'center', userSelect: 'none', touchAction: 'none', width: '100px', height: '20px' }}
                  >
                    <Slider.Track style={{ backgroundColor: 'rgba(255,255,255,0.2)', position: 'relative', flexGrow: 1, borderRadius: '9999px', height: '4px' }}>
                      <Slider.Range style={{ position: 'absolute', backgroundColor: '#d4af37', borderRadius: '9999px', height: '100%' }} />
                    </Slider.Track>
                    <Slider.Thumb style={{ display: 'block', width: '16px', height: '16px', backgroundColor: '#d4af37', boxShadow: '0 2px 10px rgba(0,0,0,0.3)', borderRadius: '10px', outline: 'none' }} />
                  </Slider.Root>
                  <span style={{ fontSize: '12px', color: '#a0aec0', width: '30px' }}>{settings.rotationSpeed.toFixed(1)}</span>
                </div>
              </div>
            </div>

          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
