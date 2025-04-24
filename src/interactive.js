export function interactiveScriptGen({ size, reflect, finals } = {}) {
  return `
    <script type="text/javascript"><![CDATA[
      // Compact state using shorter variable names
      const s = {
        e: [], // elements
        m: { x: null, y: null, tx: 0, ty: 0 }, // mouse
        r: null, // rect
        f: null, // frame
        t: 0 // lastTime
      };

      // Precompute constants to save calculations
      const c = {
        d: 900, // duration
        pr: ${size} * (0.5 + (${finals[0]} + ${finals[1]}) / 4), // perspectiveRange
        pz: ${size} * 1.2, // perspectiveZ
        bz: ${size} * 0.4, // baseZ
        cx: ${size}/2, // centerX
        cy: ${size}/2, // centerY
        sz: ${size} // size
      };

      // Init function using IIFE for immediate execution
      (() => {
        const svg = document.currentScript.closest('svg');
        if (!svg) return;
        
        // DRY: Single function to update rect
        const ur = () => s.r = svg.getBoundingClientRect();
        window.addEventListener('resize', ur);
        ur();

        // Process both circles and squares in a single map-reduce pattern
        s.e = [
          ...Array.from(svg.querySelectorAll('.interactive-circle')).map(el => {
            const x = +el.getAttribute('data-cx'),
                  y = +el.getAttribute('data-cy'),
                  mass = (+el.getAttribute('r') * +el.getAttribute('data-opacity')) / c.sz;
            return { el, t: 'c', x, y, cx: x, cy: y, m: mass };
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
              m: Math.pow((r / c.sz), 2) * o
            };
          })
        ];

        // Initial transform for squares
        s.e.filter(el => el.t === 's').forEach(setTransform);

        // Event listeners with bound handler
        const hm = e => {
          const { left, top, width, height } = s.r;
          s.m.tx = ((e.clientX - left) / width) * c.sz;
          s.m.ty = ((e.clientY - top) / height) * c.sz;
          if (s.m.x === null) {
            s.m.x = s.m.tx;
            s.m.y = s.m.ty;
          }
        };

        svg.addEventListener('mousemove', hm);
        svg.addEventListener('mouseleave', () => s.m.x = null);
        svg.addEventListener('mouseenter', hm);
        
        // Start animation
        animate();
      })();

      // Optimize transform application with a dedicated function
      function setTransform(el) {
        const ps = c.pz / (c.pz + el.cz);
        const px = c.cx + (el.cx - c.cx) * ps;
        const py = c.cy + (el.cy - c.cy) * ps;
        el.el.setAttribute('transform',
          'translate('+ px+' '+ py+') rotate('+ el.cr+ ') scale(' +  ps * el.cs+')'
        );
      }

      // Update element position and appearance
      function updateElement(el, dt) {
        const sm = Math.min(dt / c.d, 1) * (el.t === 's' ? 0.3 : 0.1);
        
        if (el.t === 'c' && s.m.x !== null) {
          const dx = s.m.x - el.x;
          const dy = s.m.y - el.y;
          const d = Math.hypot(dx, dy);
          const move = Math.min(d, 30 * (1 - el.m));
          const a = Math.atan2(dy, dx);
          
          el.cx += (el.x + move * Math.cos(a) - el.cx) * 0.1;
          el.cy += (el.y + move * Math.sin(a) - el.cy) * 0.1;

          el.el.setAttribute('cx', el.cx);
          el.el.setAttribute('cy', el.cy);
          
          // Handle reflection if enabled
          if (${reflect}) {
            const mirror = el.el.nextElementSibling;
            if (mirror) {
              mirror.setAttribute('cx', c.sz - el.cx);
              mirror.setAttribute('cy', el.cy);
            }
          }
          return;
        }

        if (el.t === 's') {
          if (s.m.x === null) {
            // Return to base with optimized property updates
            el.cx += (el.x - el.cx) * sm;
            el.cy += (el.y - el.cy) * sm;
            el.cz += (c.bz - el.cz) * sm;
            el.cr += (el.r - el.cr) * sm;
            el.cs += (1 - el.cs) * sm;
          } else {
            const dx = s.m.x - el.x;
            const dy = s.m.y - el.y;
            const d = Math.hypot(dx, dy);
            const n = Math.min(d / c.pr, 1);
            const a = Math.atan2(dy, dx);
            const move = Math.min(d, 40 * (1 - el.m));
            
            // Fast power for smoother effect
            const zf = 1 - n * n;
            
            // Update current positions with optimized targets
            el.cx += (el.x + move * Math.cos(a) - el.cx) * sm;
            el.cy += (el.y + move * Math.sin(a) - el.cy) * sm;
            el.cz += (c.bz - (c.bz * zf * (1 - el.m)) - el.cz) * sm;
            el.cr += (el.r + Math.sin(d / 100) * 5 * (1 - el.m) - el.cr) * sm;
            el.cs += (1 + (zf * 0.3 * (1 - el.m)) - el.cs) * sm;
          }

          setTransform(el);
        }
      }

      // Main animation loop with RAF
      function animate(time) {
        const dt = s.t ? time - s.t : 0;
        s.t = time;

        if (s.m.x !== null) {
          s.m.x += (s.m.tx - s.m.x) * 0.1;
          s.m.y += (s.m.ty - s.m.y) * 0.1;
        }

        s.e.forEach(el => updateElement(el, dt));
        s.f = requestAnimationFrame(animate);
      }

      // Cleanup function for event listener removal
      document.currentScript.addEventListener('remove', () => {
        cancelAnimationFrame(s.f);
        const svg = document.currentScript.closest('svg');
        if (svg) {
          svg.removeEventListener('mousemove', hm);
          svg.removeEventListener('mouseleave', () => s.m.x = null);
          svg.removeEventListener('mouseenter', hm);
        }
      });
    ]]></script>
  `;
}