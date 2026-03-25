import React, { useState, useRef, useEffect } from 'react';

export default function DetailModal({ id, kind, rows, onClose, x = 100, y = 80, w = 600, h = 400 }) {
  const [pos, setPos] = useState({ x, y });
  const [size, setSize] = useState({ w, h });
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const startDrag = useRef(null);
  const startSize = useRef(null);

  // bring to front on focus
  const onMouseDownWindow = (e) => {
    e.currentTarget.style.zIndex = Date.now();
  };

  /* ---------------- Drag logic ---------------- */
  const onDragMouseDown = (e) => {
    startDrag.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    window.addEventListener('mousemove', onDragMouseMove);
    window.addEventListener('mouseup', stopDrag);
  };
  const onDragMouseMove = (e) => {
    setPos({ x: e.clientX - startDrag.current.x, y: e.clientY - startDrag.current.y });
  };
  const stopDrag = () => {
    window.removeEventListener('mousemove', onDragMouseMove);
    window.removeEventListener('mouseup', stopDrag);
  };

  /* --------------- Resize logic --------------- */
  const onResizeMouseDown = (e) => {
    startSize.current = { w: size.w, h: size.h, x: e.clientX, y: e.clientY };
    window.addEventListener('mousemove', onResizeMouseMove);
    window.addEventListener('mouseup', stopResize);
    e.stopPropagation();
  };
  const onResizeMouseMove = (e) => {
    const dx = e.clientX - startSize.current.x;
    const dy = e.clientY - startSize.current.y;
    setSize({
      w: Math.max(300, startSize.current.w + dx),
      h: Math.max(200, startSize.current.h + dy),
    });
  };
  const stopResize = () => {
    window.removeEventListener('mousemove', onResizeMouseMove);
    window.removeEventListener('mouseup', stopResize);
  };

  useEffect(() => {
    return () => {
      stopDrag();
      stopResize();
    };
  }, []);

  // Determine preferred order depending on available keys
  const keyOrder = ['ts','txDate','amount','amountXRP','transactionId','txHash','refId','narrative','destination'];
  let headers = rows.length ? Object.keys(rows[0]) : [];
  headers = headers.filter((h)=>h!=='__v');
  headers.sort((a,b)=>{
    const ia = keyOrder.indexOf(a);
    const ib = keyOrder.indexOf(b);
    if (ia===-1 && ib===-1) return a.localeCompare(b);
    if (ia===-1) return 1;
    if (ib===-1) return -1;
    return ia-ib;
  });

  return (
    <div
      onMouseDown={onMouseDownWindow}
      style={{
        position: 'fixed',
        left: '10%', // pos.x,
        top: pos.y,
        width: '80%',//size.w,
        height: '90%',//size.h,
        background: '#101935',
        color: '#fff',
        border: '1px solid #4f8cff',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        ref={dragRef}
        onMouseDown={onDragMouseDown}
        style={{
          cursor: 'move',
          background: '#4f8cff',
          padding: '4px 8px',
          userSelect: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 12 }}>{kind} - rows: {rows.length}</span>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>✖</button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', fontSize: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h} style={{ borderBottom: '1px solid #4f8cff',fontSize:'1rem', padding: '4px 8px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                {headers.map((h) => (
                  <td key={h} style={{ padding: '4px 8px',fontSize:'1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {(() => {
                      const val = row[h];
                      if (h==='ts' || h==='txDate') {
                        return new Date(val).toLocaleString();
                      }
                      if (typeof val==='object' && val!==null && '$numberDecimal' in val) {
                        return parseFloat(val.$numberDecimal).toFixed(6);
                      }
                      return String(val).slice(0, 120);
                    })()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        ref={resizeRef}
        onMouseDown={onResizeMouseDown}
        style={{
          width: 12,
          height: 12,
          background: '#4f8cff',
          position: 'absolute',
          right: 0,
          bottom: 0,
          cursor: 'nwse-resize',
        }}
      />
    </div>
  );
} 
