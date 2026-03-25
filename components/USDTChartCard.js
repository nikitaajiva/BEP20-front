import React, { useEffect, useRef } from 'react';

export default function USDTChartCard({ usdt }) {
  const tradingViewContainerRef = useRef(null);
  const scriptAppendedRef = useRef(false);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (tradingViewContainerRef.current && !scriptAppendedRef.current) {
        const container = tradingViewContainerRef.current;
        container.innerHTML = '';

        const uniqueIdSuffix = Math.random().toString(36).substr(2, 9);
        const widgetInnerDivId = `tradingview_widget_inner_${uniqueIdSuffix}`;
        const scriptId = `tradingview_script_${uniqueIdSuffix}`;

        const widgetInnerDiv = document.createElement('div');
        widgetInnerDiv.id = widgetInnerDivId;
        widgetInnerDiv.className = 'tradingview-widget-container__widget';
        widgetInnerDiv.style.width = '100%';
        widgetInnerDiv.style.height = '100%';
        container.appendChild(widgetInnerDiv);

        const script = document.createElement('script');
        script.id = scriptId;
        script.type = 'text/javascript';
        script.async = true;
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';

        const config = {
          "symbols": [
            ["BINANCE:USDTUSDC|1Y"],
            ["CRYPTOCAP:USDT|1Y"]
          ],
          "chartOnly": false,
          "width": "100%",
          "height": "100%",
          "locale": "en",
          "colorTheme": "dark",
          "autosize": true,
          "showVolume": false,
          "showMA": false,
          "hideDateRanges": false,
          "hideMarketStatus": false,
          "hideSymbolLogo": false,
          "scalePosition": "right",
          "scaleMode": "Normal",
          "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
          "fontSize": "10",
          "noTimeScale": false,
          "valuesTracking": "1",
          "changeMode": "price-and-percent",
          "chartType": "area",
          "maLineColor": "#141B39",
          "maLineWidth": 1,
          "maLength": 9,
          "headerFontSize": "medium",
          "backgroundColor": "rgba(20, 27, 57, 1)",
          "lineWidth": 1,
          "lineType": 0,
          "dateRanges": [
            "1d|1",
            "3m|60",
            "12m|1D",
            "all|1M"
          ],
          "container_id": widgetInnerDivId
        };

        script.text = JSON.stringify(config);
        container.appendChild(script);
        scriptAppendedRef.current = true;
      }
    }, 100); // Delay of 100ms

    return () => {
      clearTimeout(timerId);
      // Cleanup for TradingView script if it was appended
      if (scriptAppendedRef.current && tradingViewContainerRef.current) {
        // The unique IDs would be out of scope here directly.
        // Relying on the scriptAppendedRef to know if we should clear.
        // And assuming the TradingView script cleans up its specific container_id content
        // or that clearing the main container is sufficient.
        // For a more targeted removal if elements are known, their IDs would need to be stored in refs too.
        tradingViewContainerRef.current.innerHTML = ''; 
      }
      scriptAppendedRef.current = false; // Reset for potential remount
    };
  }, []); // Empty dependency array, runs once on mount and cleans up on unmount

  const detailItems = [
    { label: "Current Price", value: `${usdt?.currentPrice} USDT`, icon: "ri-price-tag-3-line", iconBg: "#3b82f6" },
    { label: "Total Supply", value: `Unlimited`, icon: "ri-stack-line", iconBg: "#22c55e" },
    { label: "Change 24 Hrs", value: usdt?.change24h || "0.00", icon: "ri-arrow-left-right-line", iconBg: "#ef4444" },
    { label: "USDT High", value: `${usdt?.high} USDT`, icon: "ri-arrow-up-line", iconBg: "#14b8a6" },
    { label: "USDT Low", value: `${usdt?.low} USDT`, icon: "ri-arrow-down-line", iconBg: "#f97316" },
  ];

  const detailItemStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.8rem', 
    fontSize: '0.85rem', 
  };

  const iconContainerStyle = {
    marginRight: '0.75rem',
    padding: '0.5rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const labelStyle = {
    color: '#a0a7c4', 
  };

  const valueStyle = {
    marginLeft: 'auto',
    color: '#fff',
    fontWeight: 600,
    textAlign: 'right',
  };

  return (
    <div className="card h-100" style={{ 
      background: '#181f3a', 
      padding: '0', 
      overflow: 'hidden', 
      borderRadius: '22px',
      boxShadow: '0 12px 40px -12px rgba(0,0,0,0.35)'
    }}>
      <div className="row g-0 h-100">
        <div className="col-md-7 col-12 order-2 order-md-1 d-flex flex-column" style={{ padding: '1rem 1rem 0.5rem 1.5rem'}}>
          <div className="card-header border-0 p-0 mb-1">
            <h5 className="mb-0" style={{color: '#fff', fontWeight: 600, fontSize: '1rem'}}>USDT Price Chart</h5>
          </div>
          <div 
            ref={tradingViewContainerRef} 
            className="tradingview-widget-container flex-grow-1" 
            style={{ height: '360px', width: '100%' }}
          >
            {/* Content will be injected here */}
          </div>
        </div>
        <div className="col-md-5 col-12 order-1 order-md-2 d-flex flex-column" 
             style={{
                borderLeft: '1px solid #2a3150', 
                background: '#181f3a', 
                borderTopRightRadius: '22px', 
                borderBottomRightRadius: '22px', 
                padding: '1.5rem' 
             }}>
          <div className="card-header border-0 p-0 mb-2">
            <h5 className="mb-1" style={{color: '#fff', fontWeight: 600, fontSize: '1rem'}}>USDT Details</h5>
          </div>
          <div className="card-body p-0 flex-grow-1">
            {detailItems.map(item => (
              <div key={item.label} style={detailItemStyle}>
                <div style={{...iconContainerStyle, backgroundColor: item.iconBg}}>
                  <i className={item.icon} style={{ fontSize: '1rem', color: '#fff' }}></i>
                </div>
                <span style={labelStyle}>{item.label}</span>
                <span style={valueStyle}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
