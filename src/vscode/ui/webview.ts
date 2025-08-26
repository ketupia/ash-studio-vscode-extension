import * as vscode from "vscode";
import { escapeHtml } from "../../utils/htmlUtils";

let ashStudioPanel: vscode.WebviewPanel | undefined;

/**
 * Get or create the singleton AshStudio webview panel.
 * If already open, reveals and returns it. Otherwise, creates a new one.
 * @param {string} title - The title for the webview panel.
 * @param {string} viewType - The viewType for the panel (default: 'ashStudio').
 * @returns {vscode.WebviewPanel}
 */
export function getOrCreateAshStudioWebview(
  title: string = "AshStudio Diagram",
  viewType: string = "ashStudio"
): vscode.WebviewPanel {
  if (ashStudioPanel) {
    // Update title in case caller provided a new title for the existing panel
    try {
      ashStudioPanel.title = title;
    } catch (err) {
      // Setting title should normally succeed; swallow any errors to avoid breaking callers
      console.debug("[AshStudio] Failed to set panel title:", err);
    }
    ashStudioPanel.reveal(vscode.ViewColumn.Active);
    return ashStudioPanel;
  }

  ashStudioPanel = vscode.window.createWebviewPanel(
    viewType,
    title,
    vscode.ViewColumn.Active,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  ashStudioPanel.onDidDispose(() => {
    ashStudioPanel = undefined;
  });

  return ashStudioPanel;
}

/**
 * Escape HTML special characters in a string to prevent XSS.
 * @param str The string to escape.
 * @returns The escaped string.
 */
export function renderGeneratingDiagram(diagramPath: string): string {
  const escaped = escapeHtml(String(diagramPath));

  return `<html><body><h2>Generating diagram...</h2><p style='color:#888;font-size:0.9em;'>${escaped}</p></body></html>`;
}

export function renderMermaidDiagram(
  mermaidCode: string,
  assets?: { mermaidSrc?: string; svgPanZoomSrc?: string; cspSource?: string }
): string {
  const mermaidSrc = assets?.mermaidSrc;
  const svgPanZoomSrc = assets?.svgPanZoomSrc;
  const cspSource = assets?.cspSource ?? "";
  const content = `<!DOCTYPE html><html><head>
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${cspSource} data:; style-src 'unsafe-inline' ${cspSource}; script-src 'unsafe-inline' ${cspSource};">
  <!-- Load locally bundled UMD builds only -->
  ${mermaidSrc ? `<script src="${mermaidSrc}" defer></script>` : ""}
  ${svgPanZoomSrc ? `<script src="${svgPanZoomSrc}" defer></script>` : ""}
      <style>
        html, body { height: 100%; margin: 0; }
        body { background:#222; color:#fff; }
        #host { position: fixed; inset: 0; padding: 12px; box-sizing: border-box; }
        /* The mermaid container acts as the viewport for the SVG */
        .mermaid { 
          background:#fff; color:#222; border-radius:8px; 
          width: 100%; height: 100%; display: block; overflow: hidden; position: relative;
          /* Remove default margins/padding to let SVG occupy full space */
          margin: 0; padding: 0;
        }
        /* Ensure the generated SVG fills the container */
        .mermaid > svg { width: 100%; height: 100%; display: block; }
        /* Make sure svg-pan-zoom control icons are visible and positioned */
        .svg-pan-zoom_controls { opacity: 1; position: absolute; top: 8px; right: 8px; z-index: 1000; }
        .svg-pan-zoom_control, .svg-pan-zoom_reset, .svg-pan-zoom_zoom-in, .svg-pan-zoom_zoom-out { fill: #333 !important; }
        .svg-pan-zoom_control:hover { fill: #000 !important; }
      </style>
    </head><body>
      <div id="host">
        <div id="mermaidDiv" class="mermaid">
          ${mermaidCode}
        </div>
      </div>

      <script>
        (function(){
          const selector = '.mermaid svg';
          const MAX_INIT_ATTEMPTS = 40;
          const RETRY_INTERVAL_MS = 150;
          const MIN_ZOOM_LEVEL = 0.1;
          const MAX_ZOOM_LEVEL = 10;
          let attempts = 0;

          function ensureViewBox(svg){
            if(!svg.getAttribute('viewBox')){
              try {
                const bbox = svg.getBBox ? svg.getBBox() : null;
                if(bbox){ svg.setAttribute('viewBox', [bbox.x,bbox.y,bbox.width,bbox.height].join(' ')); }
              } catch (err) { console.debug('[AshStudio] getBBox/viewBox fallback issue:', err); }
            }
          }

          function renderMermaid(){
            const el = document.getElementById('mermaidDiv');
            if(!el){ console.error('[AshStudio] Missing mermaid container'); return; }
            if(!window.mermaid){ console.error('[AshStudio] Mermaid library not available'); return; }
            try { window.mermaid.initialize({ startOnLoad: false }); } catch (err) { console.error('[AshStudio] mermaid.initialize error:', err); }
            try { window.mermaid.parse(el.textContent || ''); } catch (err) { console.warn('[AshStudio] mermaid.parse warning:', err); }
            try { window.mermaid.init(undefined, el); } catch (err) { console.error('[AshStudio] mermaid.init error:', err); }
          }

      function initPanZoom(){
            const svg = document.querySelector(selector);
            if(!svg || !window.svgPanZoom) return false;
            try {
              svg.removeAttribute('width'); svg.removeAttribute('height');
        svg.style.maxWidth='none'; svg.style.width='100%'; svg.style.height='100%';
        svg.setAttribute('preserveAspectRatio','xMidYMid meet'); ensureViewBox(svg);
        const pz = window.svgPanZoom(svg,{
                zoomEnabled: true,
                controlIconsEnabled: true,
                fit: true,
                center: true,
                minZoom: MIN_ZOOM_LEVEL,
                maxZoom: MAX_ZOOM_LEVEL
              });
              console.info('[AshStudio] svgPanZoom initialized with controls');
              setTimeout(()=>{ try{pz.resize(); pz.fit(); pz.center();}catch(err){ console.debug('[AshStudio] svgPanZoom post-init sizing issue:', err); } },0);
              window.addEventListener('resize', ()=>{ try{pz.resize(); pz.fit(); pz.center();}catch(err){ console.debug('[AshStudio] svgPanZoom resize handling issue:', err); } });
              return true;
            } catch (err) { console.error('[AshStudio] svgPanZoom init error:', err); return false; }
          }

          (function wait(){
            if(window.mermaid && window.svgPanZoom){
              renderMermaid();
              setTimeout(()=>{ if(!initPanZoom() && attempts++ < MAX_INIT_ATTEMPTS) setTimeout(wait, RETRY_INTERVAL_MS); }, 100);
            } else if (attempts++ < MAX_INIT_ATTEMPTS) {
              setTimeout(wait, RETRY_INTERVAL_MS);
            } else {
              console.error('[AshStudio] Timed out waiting for mermaid/svg-pan-zoom to load');
            }
          })();
        })();
      </script>
    </body></html>`;

  return content;
}
