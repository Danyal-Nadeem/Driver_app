import React from 'react';

const LogSheet = ({ logData, isMini = false, driverName = "Danyal Nadeem", truckNumber = "LPK-2921", carrierName = "Spotter AI Logistics" }) => {
  const { date, segments, total_miles, total_on_duty, hours_available } = logData;
  
  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const STATUSES = [
    { id: 1, label: 'OFF DUTY', color: '#94a3b8', bg: '#f1f5f9' },
    { id: 2, label: 'SLEEPER BERTH', color: '#6366f1', bg: '#eef2ff' },
    { id: 3, label: 'DRIVING', color: '#22c55e', bg: '#f0fdf4' },
    { id: 4, label: 'ON DUTY (ND)', color: '#f59e0b', bg: '#fffbeb' }
  ];

  const cellWidth = isMini ? 10 : 30; 
  const rowHeight = isMini ? 15 : 40;
  const gridWidth = cellWidth * 24;
  const gridHeight = rowHeight * 4;

  const points = [];
  segments.forEach((seg) => {
    const xStart = seg.start_hour * cellWidth;
    const xEnd = (seg.start_hour + seg.duration) * cellWidth;
    const y = (seg.status - 1) * rowHeight + rowHeight / 2;
    points.push(`${xStart},${y}`);
    points.push(`${xEnd},${y}`);
  });

  return (
    <div className="log-sheet" style={{ 
      background: 'white', 
      borderRadius: 16, 
      overflow: 'visible',
      boxShadow: isMini ? 'none' : '0 10px 25px -5px rgba(0,0,0,0.1)',
      border: isMini ? 'none' : '1px solid #e2e8f0'
    }}>
      {!isMini && (
        <div style={{ 
          padding: '20px 24px', 
          background: '#1e293b', 
          color: 'white', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>DRIVER'S DAILY LOG</h2>
            <p style={{ fontSize: 11, opacity: 0.7, margin: 0 }}>ELD Compliant Simulation</p>
          </div>
          <div style={{ textAlign: 'right', paddingRight: 50 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{date}</span>
          </div>
        </div>
      )}

      {!isMini && (
        <div style={{ padding: '16px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <p style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Driver</p>
            <p style={{ fontSize: 14, fontWeight: 600 }}>{driverName}</p>
          </div>
          <div>
            <p style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Vehicle / Truck</p>
            <p style={{ fontSize: 14, fontWeight: 600 }}>{truckNumber}</p>
          </div>
          <div>
            <p style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Carrier</p>
            <p style={{ fontSize: 14, fontWeight: 600 }}>{carrierName}</p>
          </div>
        </div>
      )}

      <div style={{ padding: isMini ? 10 : 30, overflowX: 'auto' }}>
        <div style={{ position: 'relative', width: 'fit-content', background: '#fff', borderRadius: 8 }}>
          <div style={{ display: 'flex' }}>
            <div className="status-column">
              {STATUSES.map(s => (
                <div key={s.id} style={{ 
                  height: rowHeight, 
                  width: isMini ? 60 : 130, 
                  fontSize: isMini ? 6 : 11, 
                  fontWeight: 800, 
                  display: 'flex', 
                  alignItems: 'center', 
                  paddingLeft: 12,
                  color: s.color,
                  background: s.bg,
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                  borderRight: '2px solid #1e293b'
                }}>
                  {s.label}
                </div>
              ))}
            </div>
            
            <div className="grid-main" style={{ position: 'relative', width: gridWidth, height: gridHeight, background: '#fff', borderRight: '1px solid #eee' }}>
              {/* Hour Grid lines */}
              {HOURS.map(h => (
                <div key={h} style={{ 
                  position: 'absolute', 
                  left: h * cellWidth, 
                  top: 0, 
                  bottom: 0, 
                  width: 1, 
                  borderLeft: h % 2 === 0 ? '1px solid #e2e8f0' : '1px dashed #f1f5f9'
                }}>
                  {!isMini && <span style={{ fontSize: 12, position: 'absolute', top: -25, left: -4, fontWeight: 700, color: '#64748b' }}>{h === 0 ? 'MID' : h === 12 ? 'NOON' : h}</span>}
                </div>
              ))}
              
              {/* Status Row Backgrounds */}
              {STATUSES.map((s, i) => (
                <div key={i} style={{ 
                  position: 'absolute', 
                  top: i * rowHeight, 
                  left: 0, 
                  right: 0, 
                  height: rowHeight, 
                  background: s.bg, 
                  opacity: 0.3,
                  borderBottom: '1px solid #f1f5f9'
                }} />
              ))}

              {/* The Line - Modern Styled */}
              <svg style={{ position: 'absolute', top: 0, left: 0, width: gridWidth, height: gridHeight, overflow: 'visible', filter: 'drop-shadow(0 0 2px rgba(239, 68, 68, 0.5))' }}>
                <polyline 
                  points={points.join(' ')} 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="3" 
                  strokeLinejoin="round" 
                  strokeLinecap="round" 
                />
                {/* Dots at joints */}
                {points.map((p, i) => {
                    const [x, y] = p.split(',');
                    return <circle key={i} cx={x} cy={y} r="4" fill="#ef4444" stroke="white" strokeWidth="1.5" />;
                })}
              </svg>
            </div>

            {/* Total Column - Modern */}
            <div style={{ width: isMini ? 25 : 60, background: '#f8fafc', borderLeft: '2px solid #1e293b' }}>
                <div style={{ height: isMini ? 10 : 20, fontSize: isMini ? 4 : 8, textAlign: 'center', color: '#64748b', fontWeight: 900, paddingTop: isMini ? 0 : 4 }}>TOTAL</div>
                {[1, 2, 3, 4].map(s_id => {
                    const hrs = segments.filter(seg => seg.status === s_id).reduce((acc, curr) => acc + curr.duration, 0);
                    return (
                        <div key={s_id} style={{ height: rowHeight, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f1f5f9', fontWeight: 800, color: '#1e293b', fontSize: isMini ? 7 : 12 }}>
                            {hrs.toFixed(1)}
                        </div>
                    );
                })}
            </div>
          </div>
        </div>
      </div>

      {!isMini && (
        <div style={{ padding: '24px', background: '#f8fafc', display: 'flex', gap: 40 }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: 11, color: '#64748b', marginBottom: 12, textTransform: 'uppercase' }}>Remarks & Locations</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {segments.filter(s => s.remark).map((s, i) => (
                    <div key={i} style={{ background: 'white', padding: '6px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12 }}>
                        <strong style={{ color: '#6366f1' }}>{Math.floor(s.start_hour)}:00</strong> — {s.remark}
                    </div>
                ))}
            </div>
          </div>
          <div style={{ width: 280 }}>
            <h4 style={{ fontSize: 11, color: '#64748b', marginBottom: 12, textTransform: 'uppercase' }}>Cycle Recap</h4>
            <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '10px 15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: 12 }}>On-Duty Today</span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{total_on_duty}h</span>
                </div>
                <div style={{ padding: '10px 15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: 12 }}>Last 7 Days</span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{(70 - hours_available).toFixed(1)}h</span>
                </div>
                <div style={{ padding: '10px 15px', display: 'flex', justifyContent: 'space-between', background: '#f0fdf4' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>Available Tomorrow</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#166534' }}>{hours_available}h</span>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogSheet;
