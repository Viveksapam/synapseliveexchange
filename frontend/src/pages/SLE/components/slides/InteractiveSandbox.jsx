import React, { useState, useRef, useEffect, useMemo } from 'react';
import './InteractiveSandbox.css';
import { SyntaxHighlighter } from './SyntaxHighlighter';

// Helper to convert rgb, rgba, shorthand hex (#fff), or common color names to 7-character hex for HTML5 color input
const parseToHex = (strColor) => {
  if (!strColor) return '#ffffff';
  strColor = strColor.trim().toLowerCase();
  
  if (strColor.startsWith('#')) {
    if (strColor.length === 4) { // e.g. #fff -> #ffffff
      return '#' + strColor[1] + strColor[1] + strColor[2] + strColor[2] + strColor[3] + strColor[3];
    }
    return strColor.substring(0, 7);
  }

  // Handle rgb and rgba formats
  const arrRgbMatch = strColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (arrRgbMatch) {
    const strRed = parseInt(arrRgbMatch[1], 10).toString(16).padStart(2, '0');
    const strGreen = parseInt(arrRgbMatch[2], 10).toString(16).padStart(2, '0');
    const strBlue = parseInt(arrRgbMatch[3], 10).toString(16).padStart(2, '0');
    return `#${strRed}${strGreen}${strBlue}`;
  }

  const objColorMap = {
    white: '#ffffff',
    black: '#000000',
    red: '#ff0000',
    green: '#008000',
    blue: '#0000ff',
    yellow: '#ffff00',
    purple: '#800080',
    orange: '#ffa500',
    pink: '#ffc0cb',
    gray: '#808080',
    grey: '#808080',
    indigo: '#4b0082',
    violet: '#ee82ee',
    cyan: '#00ffff',
    magenta: '#ff00ff',
    crimson: '#dc143c',
    navy: '#000080',
    teal: '#008080',
    transparent: '#ffffff'
  };

  return objColorMap[strColor] || '#ffffff';
};

// Custom Stepper Component that has NO range sliders and uses custom increment/decrement buttons
function NumberStepper({ numValue, onChange, numMin = 0, numMax = 200, numStep = 1, strLabel }) {
  const handleDecrement = () => {
    onChange(Math.max(numMin, numValue - numStep));
  };
  const handleIncrement = () => {
    onChange(Math.min(numMax, numValue + numStep));
  };

  return (
    <div className="stepper-container">
      {strLabel && <label className="stepper-label">{strLabel}</label>}
      <div className="stepper-controls-wrapper">
        <button onClick={handleDecrement} type="button" className="stepper-btn" aria-label="Decrease">-</button>
        <input 
          type="number" 
          value={numValue} 
          onChange={e => onChange(Math.max(numMin, Math.min(numMax, parseInt(e.target.value) || 0)))}
          className="stepper-input"
        />
        <button onClick={handleIncrement} type="button" className="stepper-btn" aria-label="Increase">+</button>
      </div>
    </div>
  );
}

// Custom Color Picker component combined with Hex text inputs
function ColorSelector({ strValue, onChange, strLabel }) {
  return (
    <div className="color-selector-container">
      <label className="color-selector-label">{strLabel}</label>
      <div className="color-selector-controls">
        <input 
          type="color" 
          value={strValue} 
          onChange={e => onChange(e.target.value)}
          className="color-picker-input"
        />
        <input 
          type="text" 
          value={strValue} 
          onChange={e => {
            const strVal = e.target.value;
            if (strVal.startsWith('#') && (strVal.length === 4 || strVal.length === 7)) {
              onChange(strVal);
            }
          }}
          className="color-hex-input"
          placeholder="#ffffff"
        />
      </div>
    </div>
  );
}

export function InteractiveSandbox({ htmlContent, initialCss }) {
  const [strActiveTabState, setStrActiveTabState] = useState('gui'); // 'gui' or 'code'
  const [strCssCodeState, setStrCssCodeState] = useState(initialCss || '');
  const [strTargetSelState, setStrTargetSelState] = useState('.sandbox-container');
  const [strViewportState, setStrViewportState] = useState('desktop'); // 'desktop' or 'mobile'
  const [objContainerSizeState, setObjContainerSizeState] = useState({ numWidth: 800, numHeight: 450 });

  const [objGuiStateState, setObjGuiStateState] = useState({
    strDisplay: 'flex',
    strFlexDirection: 'row',
    strJustifyContent: 'center',
    strAlignItems: 'center',
    numGap: 20,
    strBackground: '#ffffff',
    numPadding: 40,
    numBorderRadius: 24,
    numBorderWidth: 1,
    strBorderStyle: 'solid',
    strBorderColor: '#334155',
    strColor: '#ffffff',
    strFontSize: '1rem',
    strFontWeight: '400',
    strTextAlign: 'left',
    strGridTemplateColumns: 'repeat(2, 1fr)'
  });

  const [arrSelectorsListState, setArrSelectorsListState] = useState([
    '.sandbox-container',
    '.sandbox-item',
    '.item-1',
    '.item-2',
    '.item-3',
    '.item-4'
  ]);

  const preRef = useRef(null);
  const previewRef = useRef(null);

  const objCssKeys = useMemo(() => ({
    strDisplay: 'display',
    strFlexDirection: 'flex-direction',
    strJustifyContent: 'justify-content',
    strAlignItems: 'align-items',
    numGap: 'gap',
    strBackground: 'background-color',
    numPadding: 'padding',
    numBorderRadius: 'border-radius',
    numBorderWidth: 'border-width',
    strBorderStyle: 'border-style',
    strBorderColor: 'border-color',
    strColor: 'color',
    strFontSize: 'font-size',
    strFontWeight: 'font-weight',
    strTextAlign: 'text-align',
    strGridTemplateColumns: 'grid-template-columns'
  }), []);

  // Listen to container resizing to auto-scale the viewport preview panel
  useEffect(() => {
    if (!previewRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setObjContainerSizeState({
          numWidth: entry.contentRect.width,
          numHeight: entry.contentRect.height
        });
      }
    });
    observer.observe(previewRef.current);
    return () => observer.disconnect();
  }, []);

  // Parse selectors from CSS to auto-populate target dropdown
  useEffect(() => {
    const regex = /([.#a-zA-Z0-9_>\s-]+)\s*\{/g;
    const found = new Set(['.sandbox-container', '.sandbox-item', '.item-1', '.item-2', '.item-3', '.item-4']);
    let match;
    while ((match = regex.exec(strCssCodeState)) !== null) {
      const strSel = match[1].trim();
      if (strSel && !strSel.startsWith('@') && !strSel.startsWith('/*') && strSel.length < 50) {
        found.add(strSel);
      }
    }
    setArrSelectorsListState(Array.from(found));
  }, [strCssCodeState]);

  // Two-way sync: Update objGuiStateState when strTargetSelState or strCssCodeState changes
  useEffect(() => {
    const strEscapedSelector = strTargetSelState.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const blockRegex = new RegExp(`${strEscapedSelector}\\s*\\{([^}]+)\\}`, 'i');
    const match = strCssCodeState.match(blockRegex);
    
    if (match) {
      const objPropsMap = {};
      match[1].split(';').forEach(rule => {
        const parts = rule.split(':');
        if (parts.length >= 2) {
          const key = parts[0].trim().toLowerCase();
          const val = parts.slice(1).join(':').trim();
          if (key) objPropsMap[key] = val;
        }
      });
      
      setObjGuiStateState({
        strDisplay: objPropsMap['display'] || 'block',
        strFlexDirection: objPropsMap['flex-direction'] || 'row',
        strJustifyContent: objPropsMap['justify-content'] || 'flex-start',
        strAlignItems: objPropsMap['align-items'] || 'stretch',
        numGap: parseInt(objPropsMap['gap']) || 0,
        strBackground: parseToHex(objPropsMap['background-color'] || objPropsMap['background'] || '#ffffff'),
        numPadding: parseInt(objPropsMap['padding']) || 0,
        numBorderRadius: parseInt(objPropsMap['border-radius']) || 0,
        numBorderWidth: parseInt(objPropsMap['border-width']) || 0,
        strBorderStyle: objPropsMap['border-style'] || 'none',
        strBorderColor: parseToHex(objPropsMap['border-color'] || '#334155'),
        strColor: parseToHex(objPropsMap['color'] || '#ffffff'),
        strFontSize: objPropsMap['font-size'] || '1rem',
        strFontWeight: objPropsMap['font-weight'] || '400',
        strTextAlign: objPropsMap['text-align'] || 'left',
        strGridTemplateColumns: objPropsMap['grid-template-columns'] || 'none'
      });
    } else {
      setObjGuiStateState({
        strDisplay: 'block',
        strFlexDirection: 'row',
        strJustifyContent: 'flex-start',
        strAlignItems: 'stretch',
        numGap: 0,
        strBackground: '#ffffff',
        numPadding: 0,
        numBorderRadius: 0,
        numBorderWidth: 0,
        strBorderStyle: 'none',
        strBorderColor: '#334155',
        strColor: '#ffffff',
        strFontSize: '1rem',
        strFontWeight: '400',
        strTextAlign: 'left',
        strGridTemplateColumns: 'none'
      });
    }
  }, [strTargetSelState, strCssCodeState]);

  // Two-way sync: Trigger CSS generation when a GUI control is edited
  const handleGuiChange = (strKey, val) => {
    setObjGuiStateState(prev => ({ ...prev, [strKey]: val }));
    
    const strCssKey = objCssKeys[strKey];
    let strCssValue = val;
    
    if (strKey === 'numGap' || strKey === 'numPadding' || strKey === 'numBorderRadius' || strKey === 'numBorderWidth') {
      strCssValue = `${val}px`;
    }
    
    const strEscapedSelector = strTargetSelState.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const blockRegex = new RegExp(`(${strEscapedSelector}\\s*\\{)([^}]+)(\\})`, 'i');
    
    setStrCssCodeState(prev => {
      const match = prev.match(blockRegex);
      const strDeclaration = `  ${strCssKey}: ${strCssValue};`;
      
      if (!match) {
        return prev.trim() + `\n\n${strTargetSelState} {\n${strDeclaration}\n}`;
      }
      
      const strInnerCss = match[2];
      const propRegex = new RegExp(`(${strCssKey}\\s*:\\s*)([^;]+)(;?)`, 'i');
      
      let strUpdatedInnerCss;
      if (propRegex.test(strInnerCss)) {
        strUpdatedInnerCss = strInnerCss.replace(propRegex, `$1${strCssValue}$3`);
      } else {
        strUpdatedInnerCss = strInnerCss.trimEnd() + `\n${strDeclaration}\n`;
      }
      
      return prev.replace(blockRegex, `$1${strUpdatedInnerCss}$3`);
    });
  };

  // Viewport scaling calculations
  const numTargetWidth = strViewportState === 'desktop' ? 1280 : 375;
  const numTargetHeight = strViewportState === 'desktop' ? 720 : 667;
  const numPad = 32;
  const numScaleX = objContainerSizeState.numWidth > numPad ? (objContainerSizeState.numWidth - numPad) / numTargetWidth : 0.1;
  const numScaleY = objContainerSizeState.numHeight > numPad ? (objContainerSizeState.numHeight - numPad) / numTargetHeight : 0.1;
  const numScale = Math.max(0.1, Math.min(numScaleX, numScaleY, 1));

  const objIframeContainerStyle = {
    width: `${numTargetWidth}px`,
    height: `${numTargetHeight}px`,
    transform: `scale(${numScale})`,
    transformOrigin: 'center center',
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: `-${numTargetWidth / 2}px`,
    marginTop: `-${numTargetHeight / 2}px`,
    borderRadius: strViewportState === 'mobile' ? '36px' : '16px',
    border: '12px solid var(--sle-bg-darker, #0f172a)',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
    overflow: 'hidden',
    backgroundColor: '#0f172a'
  };

  const strIframeSrc = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 2rem; font-family: 'Inter', sans-serif; background: #0f172a; color: #f8fafc; min-height: 100vh; overflow-x: hidden; display: flex; align-items: center; justify-content: center; }
        * { box-sizing: border-box; transition: all 0.3s ease; }
        ${strCssCodeState}
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;

  return (
    <div className="sandbox-panel">
      {/* Control Station (Tabs and Interactive Custom GUI) */}
      <div className="sandbox-control-station">
        <div className="sandbox-controls-wrapper">
            <div className="sandbox-gui-controls">
              {/* Layout Properties */}
              <div className="gui-section-title">Layout & Display</div>
              <div className="gui-row">
                <label>Display</label>
                <select 
                  value={objGuiStateState.strDisplay} 
                  onChange={e => handleGuiChange('strDisplay', e.target.value)}
                  className="gui-select"
                >
                  <option value="block">block</option>
                  <option value="flex">flex</option>
                  <option value="grid">grid</option>
                  <option value="inline-block">inline-block</option>
                  <option value="none">none</option>
                </select>
              </div>

              {(objGuiStateState.strDisplay === 'flex' || objGuiStateState.strDisplay === 'grid') && (
                <>
                  {objGuiStateState.strDisplay === 'flex' && (
                    <div className="gui-row">
                      <label>Flex Direction</label>
                      <select 
                        value={objGuiStateState.strFlexDirection} 
                        onChange={e => handleGuiChange('strFlexDirection', e.target.value)}
                        className="gui-select"
                      >
                        <option value="row">row</option>
                        <option value="column">column</option>
                        <option value="row-reverse">row-reverse</option>
                        <option value="column-reverse">column-reverse</option>
                      </select>
                    </div>
                  )}

                  {objGuiStateState.strDisplay === 'grid' && (
                    <div className="gui-row">
                      <label>Grid Columns</label>
                      <select 
                        value={objGuiStateState.strGridTemplateColumns} 
                        onChange={e => handleGuiChange('strGridTemplateColumns', e.target.value)}
                        className="gui-select"
                      >
                        <option value="none">none</option>
                        <option value="1fr">1 column (1fr)</option>
                        <option value="1fr 1fr">2 columns (1fr 1fr)</option>
                        <option value="1fr 1fr 1fr">3 columns (1fr 1fr 1fr)</option>
                        <option value="repeat(2, 1fr)">repeat(2, 1fr)</option>
                        <option value="repeat(auto-fit, minmax(100px, 1fr))">auto-fit (100px min)</option>
                      </select>
                    </div>
                  )}

                  <div className="gui-row">
                    <label>Justify Content</label>
                    <select 
                      value={objGuiStateState.strJustifyContent} 
                      onChange={e => handleGuiChange('strJustifyContent', e.target.value)}
                      className="gui-select"
                    >
                      <option value="flex-start">flex-start</option>
                      <option value="center">center</option>
                      <option value="flex-end">flex-end</option>
                      <option value="space-between">space-between</option>
                      <option value="space-around">space-around</option>
                      <option value="space-evenly">space-evenly</option>
                    </select>
                  </div>

                  <div className="gui-row">
                    <label>Align Items</label>
                    <select 
                      value={objGuiStateState.strAlignItems} 
                      onChange={e => handleGuiChange('strAlignItems', e.target.value)}
                      className="gui-select"
                    >
                      <option value="stretch">stretch</option>
                      <option value="center">center</option>
                      <option value="flex-start">flex-start</option>
                      <option value="flex-end">flex-end</option>
                      <option value="baseline">baseline</option>
                    </select>
                  </div>

                  <div className="gui-row">
                    <NumberStepper 
                      numValue={objGuiStateState.numGap} 
                      onChange={numVal => handleGuiChange('numGap', numVal)} 
                      numMin={0} 
                      numMax={100} 
                      numStep={2} 
                      strLabel="Gap (px)"
                    />
                  </div>
                </>
              )}

              {/* Sizing & Borders */}
              <div className="gui-section-title">Spacing & Styling</div>
              <div className="gui-row">
                <NumberStepper 
                  numValue={objGuiStateState.numPadding} 
                  onChange={numVal => handleGuiChange('numPadding', numVal)} 
                  numMin={0} 
                  numMax={100} 
                  numStep={4} 
                  strLabel="Padding (px)"
                />
              </div>

              <div className="gui-row">
                <NumberStepper 
                  numValue={objGuiStateState.numBorderRadius} 
                  onChange={numVal => handleGuiChange('numBorderRadius', numVal)} 
                  numMin={0} 
                  numMax={100} 
                  numStep={2} 
                  strLabel="Radius (px)"
                />
              </div>

              <div className="gui-row">
                <ColorSelector 
                  strValue={objGuiStateState.strBackground} 
                  onChange={strVal => handleGuiChange('strBackground', strVal)} 
                  strLabel="Background Color"
                />
              </div>

              <div className="gui-row">
                <ColorSelector 
                  strValue={objGuiStateState.strColor} 
                  onChange={strVal => handleGuiChange('strColor', strVal)} 
                  strLabel="Text Color"
                />
              </div>


            </div>
        </div>
      </div>

      {/* Render Viewport Station (Live Render & Toggles) */}
      <div className="sandbox-render-station">
        <div className="sandbox-render-header">
          <span className="title-text">Live Render</span>
          <div className="viewport-toggles">
            <button 
              className={`viewport-btn ${strViewportState === 'desktop' ? 'active' : ''}`}
              onClick={() => setStrViewportState('desktop')}
            >
              PC (16:9)
            </button>
            <button 
              className={`viewport-btn ${strViewportState === 'mobile' ? 'active' : ''}`}
              onClick={() => setStrViewportState('mobile')}
            >
              Mobile
            </button>
          </div>
        </div>

        <div className="preview-container" ref={previewRef}>
          <div style={objIframeContainerStyle}>
            <iframe 
              srcDoc={strIframeSrc}
              title="Live Render Sandbox"
              sandbox="allow-scripts allow-same-origin"
              className="sandbox-iframe"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

