export function interactiveScriptGen({ size, reflect, finals, averages, breathVert = 0.03 } = {}) {
  return `
    <script type="text/javascript"><![CDATA[
      // Compact state using shorter variable names
      const s = {
        e: [], // elements
        m: { x: null, y: null, tx: 0, ty: 0 }, // mouse
        r: null, // rect
        f: null, // frame
        t: 0, // lastTime
        p: false, // pulse active
        pt: 0, // pulse start time
        pv: 0  // pulse current value (0-1)
      };

      // Optimize by precomputing constants
      const c = {
        d: 900, // duration
        pr: ${size} * (0.5 + (${finals[0]}) / 4), // perspectiveRange
        pz: ${size} * 1.2, // perspectiveZ
        bz: ${size} * 0.4* ${finals[1]}, // baseZ
        cx: ${size}/2, // centerX
        cy: ${size}/2, // centerY
        sz: ${size}, // size
        mv: (0.1 + 0.05*${averages[0]})* Math.max(0.8, Math.min(4.4, 200/${size})), // movement range for the mouse following
        // Small sizes get slightly stronger animations to be noticeable
        bs: 0.1 * Math.max(0.8, Math.min(1.4, 200/${size})), // breathing scale - stronger for small sizes
        bd: 4500 + ${averages[1]}*1000, // breathing duration in ms
        pa: 0.6 * Math.max(0.8, Math.min(1.4, 200/${size})), // pulse amplitude - stronger for small sizes
        pr: 200, // pulse rise time in ms
        pf: 700, // pulse fall time in ms
        bv: ${breathVert} * Math.max(0.8, Math.min(1.4, 200/${size})) // breathing vertical amplitude
      };

      // Init function using IIFE
      (() => {
        const svg = document.currentScript.closest('svg');
        if (!svg) return;
        
        const ur = () => s.r = svg.getBoundingClientRect();
        ur(); // Initial calculation
        
        // Create handler functions once to avoid repeated function creation
        const resizeHandler = ur;
        const mouseHandler = e => {
          const { left, top, width, height } = s.r;
          s.m.tx = ((e.clientX - left) / width) * c.sz;
          s.m.ty = ((e.clientY - top) / height) * c.sz;
          if (s.m.x === null) {
            s.m.x = s.m.tx;
            s.m.y = s.m.ty;
          }
        };
        
        // Pulse start handler for mousedown/touchstart
        const pulseStart = e => {
          s.p = true;
          s.pt = performance.now();
          // Don't prevent default on mousedown to maintain normal behavior
          if (e.type === 'touchstart') e.preventDefault();
        };
        
        // Pulse end handler for mouseup/touchend
        const pulseEnd = () => {
          s.p = false;
          s.pt = performance.now(); // Reset pulse time to track decay
        };
        
        // Pointer leave handler
        const pointerLeave = () => {
          s.m.x = null;
          s.p = false; // Also end pulse if pointer leaves
        };

        // Cache element arrays to avoid repopulation
        s.e = [
          ...Array.from(svg.querySelectorAll('.interactive-circle')).map(el => {
            const x = +el.getAttribute('data-cx'),
                  y = +el.getAttribute('data-cy'),
                  r = +el.getAttribute('r'),
                  o = +el.getAttribute('data-opacity');
            return { 
              el, t: 'c', 
              x, y, r,
              cx: x, cy: y, 
              m: Math.pow(r / (c.sz * 0.05), 0.7) * o, // Mass proportional to radius cubed for realistic feel
              o: Math.random() * Math.PI * 2 // Phase offset
            };
          }),
          ...Array.from(svg.querySelectorAll('.interactive-square')).map(el => {
            const x = +el.getAttribute('data-cx'),
                  y = +el.getAttribute('data-cy'),
                  r = +el.getAttribute('data-r'),
                  o = +el.getAttribute('data-opacity'),
                  a = +el.getAttribute('data-angle') + (Math.random() * 20 - 10);
            return { 
              el, t: 's', 
              x, y, z: c.bz, r: a, 
              cx: x, cy: y, cz: c.bz, cr: a, cs: 1,
              m: Math.pow((r / c.sz), 1.5) * o, // Mass proportional to size for realistic feel
              o: Math.random() * Math.PI * 2 // Phase offset
            };
          })
        ];

        // Initial transform for squares
        s.e.filter(el => el.t === 's').forEach(setTransform);

        // Event listeners - reuse handler functions
        window.addEventListener('resize', resizeHandler, { passive: true });
        svg.addEventListener('mousemove', mouseHandler, { passive: true });
        svg.addEventListener('mouseenter', mouseHandler, { passive: true });
        svg.addEventListener('mouseleave', pointerLeave, { passive: true });
        
        // Pulse events
        svg.addEventListener('mousedown', pulseStart, { passive: true });
        svg.addEventListener('touchstart', pulseStart, { passive: false });
        window.addEventListener('mouseup', pulseEnd, { passive: true });
        window.addEventListener('touchend', pulseEnd, { passive: true });
        window.addEventListener('touchcancel', pulseEnd, { passive: true });
        
        // Start animation
        animate(performance.now());
        
        // Cleanup function for event listener removal
        document.currentScript.addEventListener('remove', () => {
          cancelAnimationFrame(s.f);
          window.removeEventListener('resize', resizeHandler);
          svg.removeEventListener('mousemove', mouseHandler);
          svg.removeEventListener('mouseenter', mouseHandler);
          svg.removeEventListener('mouseleave', pointerLeave);
          svg.removeEventListener('mousedown', pulseStart);
          svg.removeEventListener('touchstart', pulseStart);
          window.removeEventListener('mouseup', pulseEnd);
          window.removeEventListener('touchend', pulseEnd);
          window.removeEventListener('touchcancel', pulseEnd);
        });
      })();

      // Transform function - kept out of loop for clarity
      function setTransform(el) {
        const ps = c.pz / (c.pz + el.cz);
        const px = c.cx + (el.cx - c.cx) * ps;
        const py = c.cy + (el.cy - c.cy) * ps;
        el.el.setAttribute('transform',
          'translate('+ px+' '+ py+') rotate('+ el.cr+ ') scale(' +  ps * el.cs+')'
        );
      }
      
      // Update pulse value with smooth interpolation
      function updatePulseValue(time) {
        if (s.p) {
          // Smooth rise when pressed
          const elapsed = time - s.pt;
          s.pv += (1 - s.pv) * Math.min(1, elapsed / c.pr);
        } else {
          // Smooth fall when released
          const elapsed = time - s.pt;
          s.pv *= Math.max(0, 1 - elapsed / c.pf);
        }
        return s.pv;
      }
      
      // Calculate breathing and pulse together
      function getEffects(el, time, pulseValue) {
        // Calculate breathing cycle (0-2π)
        const angle = (time % c.bd) / c.bd * Math.PI * 2 + el.o;
        
        // Calculate sin wave (-1 to 1)
        const wave = Math.sin(angle);
        
        // Scale and offset
        const breathScale = 1 + wave * c.bs * (1 - Math.min(0.8, el.m));
        const yOffset = wave * c.sz * c.bv * (1 - Math.min(0.8, el.m));
        
        // Apply mass-proportional pulse (smaller objects pulse more)
        // Use inverse square law: smaller objects get more effect
        // Stronger effect for very small objects
        const massEffect = Math.pow(1 - Math.min(0.8, el.m), 2);
        const pulse = pulseValue * c.pa * massEffect;
        
        return { 
          scale: breathScale * (1 + pulse),
          yOffset,
          pulse
        };
      }

      // Update elements efficiently
      function updateElement(el, dt, time, pulseValue) {
        const sm = Math.min(dt / c.d, 1) * (el.t === 's' ? 0.3 : 0.1);
        const fx = getEffects(el, time, pulseValue);
        const mouseStrength = Math.max(0.6, Math.min(1, c.sz / 150));
        
        if (el.t === 'c') { // Circle update
          if (s.m.x !== null) {
            const dx = s.m.x - el.x;
            const dy = s.m.y - el.y;
            const d = Math.sqrt(dx * dx + dy * dy); // Faster than hypot for 2D
            
            // Size-relative movement radius
            const moveMax = c.sz * c.mv * (1 - Math.min(0.8, el.m));
            const move = Math.min(d, moveMax) * mouseStrength;
            
            // Only calculate angle if needed
            const a = d > 0.1 ? Math.atan2(dy, dx) : 0;
            
            // Target with breathing + mouse
            const tx = el.x + move * (dx / d);
            const ty = el.y + move * (dy / d) + fx.yOffset;
            
            el.cx += (tx - el.cx) * 0.1;
            el.cy += (ty - el.cy) * 0.1;
          } else {
            // Only breathing when no mouse
            el.cx += (el.x - el.cx) * 0.1;
            el.cy += (el.y + fx.yOffset - el.cy) * 0.1;
          }
          
          // Apply attributes
          el.el.setAttribute('cx', el.cx);
          el.el.setAttribute('cy', el.cy);
          el.el.setAttribute('r', el.r * fx.scale);
          
          // Handle reflection if enabled (minimized property lookups)
          if (${reflect}) {
            const mirror = el.el.nextElementSibling;
            if (mirror) {
              mirror.setAttribute('cx', c.sz - el.cx);
              mirror.setAttribute('cy', el.cy);
              mirror.setAttribute('r', el.r * fx.scale);
            }
          }
          return;
        }

        if (el.t === 's') { // Square update
          if (s.m.x !== null) {
            const dx = s.m.x - el.x;
            const dy = s.m.y - el.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            const n = Math.min(d / c.pr, 1);
            
            // Size-relative movement radius
            const moveMax = c.sz * 0.1 * (1 - Math.min(0.8, el.m));
            const move = Math.min(d, moveMax) * mouseStrength;
            
            // Only calculate angle if needed
            const a = d > 0.1 ? Math.atan2(dy, dx) : 0;
            
            // Fast power for smoother effect
            const zf = 1 - n * n;
            
            // Update with mouse + breathing
            el.cx += (el.x + move * (dx / d) - el.cx) * sm;
            el.cy += (el.y + move * (dy / d) + fx.yOffset - el.cy) * sm;
            
            // Z-depth with pulse
            const depth = c.bz - (c.bz * zf * (1 - Math.min(0.8, el.m)) * fx.scale);
            // Pulse brings forward (squares float forward on click)
            const pulseZ = depth - fx.pulse * c.bz * 0.7;
            el.cz += (pulseZ - el.cz) * sm;
            
            el.cr += (el.r + Math.sin(d / 100) * 5 * (1 - Math.min(0.8, el.m)) - el.cr) * sm;
            el.cs += ((1 + (zf * 0.3 * (1 - Math.min(0.8, el.m)))) * fx.scale - el.cs) * sm;
          } else {
            // Only breathing when no mouse
            el.cx += (el.x - el.cx) * sm;
            el.cy += (el.y + fx.yOffset - el.cy) * sm;
            
            // Z pulse pushes element forward
            const pulseZ = c.bz * (1 - fx.pulse * 0.7);
            el.cz += (pulseZ - el.cz) * sm;
            
            el.cr += (el.r + Math.sin(time / 1500) * 3 * (1 - Math.min(0.8, el.m)) - el.cr) * sm;
            el.cs += (fx.scale - el.cs) * sm;
          }

          setTransform(el);
        }
      }

      // Main animation loop
      function animate(time) {
        const dt = s.t ? time - s.t : 0;
        s.t = time;

        // Mouse smoothing
        if (s.m.x !== null) {
          s.m.x += (s.m.tx - s.m.x) * 0.1;
          s.m.y += (s.m.ty - s.m.y) * 0.1;
        }
        
        // Update pulse value with smooth transitions
        const pulseValue = updatePulseValue(time);

        // Update all elements once
        s.e.forEach(el => updateElement(el, dt, time, pulseValue));
        
        // Continue animation
        s.f = requestAnimationFrame(animate);
      }
    ]]></script>
  `;
}