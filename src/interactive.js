export function interactiveScriptGen({ size = 300, reflect = true, follow = true, finals = [0.5, 0.5], averages = [0.5, 0.5], breathVert = 0.03 } = {}) {
  return `
    <script type="text/javascript"><![CDATA[
      // Compact state & precomputed constants
      const s = {
        e: [], // elements
        p: { x: null, y: null, tx: null, ty: null, a: false, lt: 0, lit: 0 }, // pointer state
        r: null, // rect
        a: false, // pulse active
        pt: 0, // pulse time
        pv: 0, // pulse value
        t: 0 // time
      },
      c = {
        sz: ${size},
        cx: ${size / 2},
        cy: ${size / 2},
        pz: ${size} * 1.2,
        bz: ${size} * 0.4 * ${finals[1]},
        pr: ${size} * (0.5 + ${finals[0]}/4),
        mv: (0.1 + 0.05*${averages[0]}) * Math.max(0.8, Math.min(4.4, 200/${size})),
        bs: 0.1 * Math.max(0.8, Math.min(1.4, 200/${size})),
        bv: ${breathVert} * Math.max(0.8, Math.min(1.4, 200/${size})),
        bd: 4500 + ${averages[1]}*1000,
        pa: 0.6 * Math.max(0.8, Math.min(1.4, 200/${size})),
        pr: 200,
        pf: 700,
        rf: ${follow},
        d: 900,
        td: 1000,
        pp: 0.12
      };

      // Init using IIFE
      (() => {
        const svg = document.currentScript?.closest('svg');
        if (!svg) return;
        
        // Update rect and get element collections
        const ur = () => s.r = svg.getBoundingClientRect();
        ur();
        
        // Cache elements for better performance
        s.e = [
          ...Array.from(svg.querySelectorAll('.interactive-circle')).map(el => {
            const x = +el.getAttribute('data-cx');
            const y = +el.getAttribute('data-cy');
            const r = +el.getAttribute('r');
            const o = +el.getAttribute('data-opacity');
            const m = Math.pow(r / (c.sz * 0.05), 0.7) * o;
            const mr = el.nextElementSibling && 
                      el.nextElementSibling.getAttribute('cx') === (c.sz - x).toString() ?
                      el.nextElementSibling : null;
            
            return {
              el, t: 'c',
              x, y, r,
              cx: x, cy: y,
              m, mr,
              o: Math.random() * Math.PI * 2
            };
          }),
          ...Array.from(svg.querySelectorAll('.interactive-square')).map(el => {
            const x = +el.getAttribute('data-cx');
            const y = +el.getAttribute('data-cy');
            const r = +el.getAttribute('data-r');
            const o = +el.getAttribute('data-opacity');
            const a = +el.getAttribute('data-angle') + (Math.random() * 20 - 10);
            
            return {
              el, t: 's',
              x, y, z: c.bz, r: a,
              cx: x, cy: y, cz: c.bz, cr: a, cs: 1,
              m: Math.pow((r / c.sz), 1.5) * o,
              o: Math.random() * Math.PI * 2
            };
          })
        ];
        
        // Initial transform for squares
        s.e.filter(el => el.t === 's').forEach(setTransform);
        
        // Helper functions for event handling
        const gc = e => ({ x: (e.touches?.[0] || e.changedTouches?.[0] || e).clientX, 
                           y: (e.touches?.[0] || e.changedTouches?.[0] || e).clientY });
        
        const inBounds = (x, y) => {
          const { left, top, width, height } = s.r || {};
          return x >= left && x <= left + width && y >= top && y <= top + height;
        };
        
        // Event handlers
        const up = e => {
          if (!s.r) ur();
          const { left, top, width, height } = s.r;
          const { x, y } = gc(e);
          
          if (!inBounds(x, y) && !e.type.startsWith('touch')) {
            if (s.p.a) pl(false);
            return;
          }
          
          // Calculate relative position
          const tx = ((x - left) / width) * c.sz;
          const ty = ((y - top) / height) * c.sz;
          
          // Init/update target position
          if (s.p.tx === null) {
            s.p.tx = tx;
            s.p.ty = ty;
          } else {
            s.p.tx = tx;
            s.p.ty = ty;
            
            // Handle reappearance after inactivity
            if (!s.p.a && performance.now() - s.p.lt > 100) {
              s.p.x = tx;
              s.p.y = ty;
            }
          }
          
          // Initialize actual position if first interaction
          if (s.p.x === null) {
            s.p.x = s.p.tx;
            s.p.y = s.p.ty;
          }
          
          s.p.a = true;
          s.p.lt = performance.now();
        };
        
        const pd = e => {
          up(e);
          s.a = true;
          s.pt = performance.now();
          if (e.type === 'touchstart') e.preventDefault();
        };
        
        const pu = e => {
          s.a = false;
          s.pt = performance.now();
          
          if (e.type === 'touchend' || e.type === 'touchcancel') {
            pl(true);
          }
        };
        
        const pl = (immediate = false) => {
          s.p.a = false;
          s.p.lit = performance.now();
          s.a = false;
          s.pt = s.p.lit;
          
          if (immediate) {
            s.p.tx = s.p.x = null;
            s.p.ty = s.p.y = null;
          }
        };
        
        // Event listeners
        window.addEventListener('resize', ur, { passive: true });
        svg.addEventListener('pointermove', up, { passive: true });
        svg.addEventListener('pointerenter', up, { passive: true });
        svg.addEventListener('pointerleave', pl, { passive: true });
        svg.addEventListener('pointerdown', pd, { passive: false });
        window.addEventListener('pointerup', pu, { passive: true });
        window.addEventListener('pointercancel', pu, { passive: true });
        
        // Start animation
        requestAnimationFrame(animate);
        
        // Setup auto-cleanup
        if (document.currentScript?.parentNode) {
          const cleanup = () => {
            window.removeEventListener('resize', ur);
            svg.removeEventListener('pointermove', up);
            svg.removeEventListener('pointerenter', up);
            svg.removeEventListener('pointerleave', pl);
            svg.removeEventListener('pointerdown', pd);
            window.removeEventListener('pointerup', pu);
            window.removeEventListener('pointercancel', pu);
            s.e = [];
          };
          
          new MutationObserver(mutations => {
            mutations.forEach(m => {
              if (m.removedNodes) {
                m.removedNodes.forEach(n => {
                  if (n === document.currentScript) {
                    cleanup();
                    observer.disconnect();
                  }
                });
              }
            });
          }).observe(document.currentScript.parentNode, { childList: true });
        }
      })();
      
      // Apply 3D transform to square elements
      function setTransform(el) {
        const ps = c.pz / (c.pz + el.cz);
        const px = c.cx + (el.cx - c.cx) * ps;
        const py = c.cy + (el.cy - c.cy) * ps;
        el.el.setAttribute('transform', 
          'translate('+ px+' '+ py+') rotate('+ el.cr+ ') scale(' + ps * el.cs + ')'
        );
      }
      
      // Calculate effects based on time and pulse
      function fx(el, t, pv) {
        const θ = (t % c.bd) / c.bd * Math.PI * 2 + el.o;
        const w = Math.sin(θ);
        const mf = 1 - Math.min(0.8, el.m);
        return {
          s: (1 + w * c.bs * mf) * (1 + pv * c.pa * Math.pow(mf, 2)),
          y: w * c.sz * c.bv * mf,
          p: pv * c.pa * Math.pow(mf, 2)
        };
      }
      
      // Animation loop
      function animate(time) {
        const dt = s.t ? time - s.t : 0;
        s.t = time;
        
        // Handle pointer inactivity
        if (!s.p.a && s.p.x !== null && time - s.p.lit > c.td) {
          s.p.x = s.p.y = s.p.tx = s.p.ty = null;
          s.e.forEach(el => { if (el.ractive) el.ractive = false; });
        }
        
        // Smooth pointer movement
        if (s.p.a && s.p.tx !== null && s.p.x !== null) {
          const dx = s.p.tx - s.p.x;
          const dy = s.p.ty - s.p.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const factor = dist > c.sz * 0.3 ? 0.2 : c.pp;
          
          s.p.x += dx * factor;
          s.p.y += dy * factor;
        }
        
        // Update pulse
        s.pv = s.a ? 
          s.pv + (1 - s.pv) * Math.min(1, (time - s.pt) / c.pr) : 
          s.pv * Math.max(0, 1 - (time - s.pt) / c.pf);
        
        if (s.pv < 0.001) s.pv = 0;
        
        // Process elements
        const ps = Math.max(0.6, Math.min(1, c.sz / 150));
        const active = s.p.x !== null;
        
        s.e.forEach(el => {
          const sm = Math.min(dt / c.d, 1) * (el.t === 's' ? 0.3 : 0.1);
          const effect = fx(el, time, s.pv);
          
          if (el.t === 'c') { // Circle
            let tx = el.x;
            let ty = el.y + effect.y;
            
            if (active) {
              const dx = s.p.x - el.x;
              const dy = s.p.y - el.y;
              const d = Math.sqrt(dx * dx + dy * dy);
              const mv = c.sz * c.mv * (1 - Math.min(0.8, el.m));
              const m = Math.min(d, mv) * ps;
              
              if (d > 0.1) {
                tx += m * (dx / d);
                ty += m * (dy / d);
              }
            }
            
            // Smooth interpolation
            const cx_diff = tx - el.cx;
            const cy_diff = ty - el.cy;
            const c_dist = Math.sqrt(cx_diff*cx_diff + cy_diff*cy_diff);
            const c_factor = c_dist > 20 ? 0.15 : 0.1;
            
            el.cx += cx_diff * c_factor;
            el.cy += cy_diff * c_factor;
            
            // Apply changes
            el.el.setAttribute('cx', el.cx);
            el.el.setAttribute('cy', el.cy);
            el.el.setAttribute('r', el.r * effect.s);
            
            // Handle reflection
            if (el.mr && ${reflect}) {
              // Initialize reflection properties if needed
              const reflectX = c.sz - el.x;
              if (!el.rcx) {
                el.rcx = reflectX;
                el.rcy = el.y;
                el.rtx = reflectX;
                el.rty = el.y;
                el.ractive = false;
                el.rest = { x: reflectX, y: el.y };
              }
              
              // Update reflection activity state
              if (active && !el.ractive && s.p.lt - s.p.lit > 100) {
                el.ractive = true;
              } else if (!active && el.ractive && s.p.lit - s.p.lt > 50) {
                el.ractive = false;
              }
              
              // Set target position based on active state and mode
              if (!active || !${follow}) {
                el.rtx = c.sz - el.cx;
                el.rty = el.cy;
              } else {
                const rdx = s.p.x - reflectX;
                const rdy = s.p.y - el.y;
                const rd = Math.sqrt(rdx * rdx + rdy * rdy);
                const rmv = c.sz * c.mv * (1 - Math.min(0.8, el.m));
                const rm = Math.min(rd, rmv) * ps;
                
                if (rd > 0.1) {
                  el.rtx = reflectX + rm * (rdx / rd);
                  el.rty = el.y + effect.y + rm * (rdy / rd);
                } else {
                  el.rtx = reflectX;
                  el.rty = el.y + effect.y;
                }
              }
              
              // Return to rest position when inactive
              if (!active && !s.p.x) {
                el.rtx = el.rest.x;
                el.rty = el.rest.y + effect.y;
              }
              
              // Smooth interpolation for reflection
              const rcx_diff = el.rtx - el.rcx;
              const rcy_diff = el.rty - el.rcy;
              const rc_dist = Math.sqrt(rcx_diff*rcx_diff + rcy_diff*rcy_diff);
              const rc_factor = rc_dist > 30 ? 0.05 : (rc_dist > 10 ? 0.07 : 0.09);
              
              el.rcx += rcx_diff * rc_factor;
              el.rcy += rcy_diff * rc_factor;
              
              // Apply reflection position
              el.mr.setAttribute('cx', el.rcx);
              el.mr.setAttribute('cy', el.rcy);
              el.mr.setAttribute('r', el.r * effect.s);
            }
          } else if (el.t === 's') { // Square
            let tx = el.x, ty = el.y + effect.y, tz = c.bz, tr = el.r, ts = 1;
            
            if (active) {
              const dx = s.p.x - el.x;
              const dy = s.p.y - el.y;
              const d = Math.sqrt(dx * dx + dy * dy);
              const mf = 1 - Math.min(0.8, el.m);
              const mv = c.sz * 0.1 * mf;
              const m = Math.min(d, mv) * ps;
              
              if (d > 0.1) {
                tx += m * (dx / d);
                ty += m * (dy / d);
              }
              
              // Apply depth & scale changes
              const n = Math.min(d / c.pr, 1);
              const zf = 1 - n * n;
              tz -= c.bz * zf * mf;
              ts += zf * 0.3 * mf;
              tr += Math.sin(d / 100) * 5 * mf;
            } else {
              // Idle rotation
              tr += Math.sin(time / 1500 + el.o) * 3 * (1 - Math.min(0.8, el.m));
            }
            
            // Apply pulse to Z depth
            tz -= effect.p * c.bz * 0.7 * (1 - Math.min(0.8, el.m));
            ts *= effect.s;
            
            // Smoothing based on distance
            const sx_diff = tx - el.cx;
            const sy_diff = ty - el.cy;
            const s_dist = Math.sqrt(sx_diff*sx_diff + sy_diff*sy_diff);
            const s_factor = Math.min(1, s_dist > 20 ? sm * 1.5 : sm);
            
            // Apply interpolation
            el.cx += sx_diff * s_factor;
            el.cy += sy_diff * s_factor;
            el.cz += (tz - el.cz) * sm;
            el.cr += (tr - el.cr) * sm;
            el.cs += (ts - el.cs) * sm;
            
            setTransform(el);
          }
        });
        
        requestAnimationFrame(animate);
      }
    ]]></script>
  `;
}