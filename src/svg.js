import { embedInImage } from "./embed";
import { chunkIt, parsePub } from "./main";

export function renderSVGAvatar({ pub, size = 200, dark = false, draw = "circles", reflect = true, round = true, embed = true, svg } = {}) {
    const { decoded, finals } = parsePub(pub)
    const bgColor = dark ? '#333' : '#eee';
  
    // Create gradient background
    const bgGradient = `
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="hsla(0,0%,${(dark ? 0 : 70) + finals[0] * 30}%)"/>
        <stop offset="100%" stop-color="hsla(0,0%,${(dark ? 0 : 70) + finals[1] * 30}%)"/>
      </linearGradient>
    `;

    // Create squares for both layers (non-interactive)
    const createSquares = (data, isSecond = false) => {
      return chunkIt(data, 14).map(chunk => {
        if (chunk.length !== 14) return '';
        const [x, y, rRaw, h1, s1, l1, a1, x1, h2, s2, l2, a2, x2, angle] = chunk;
        const r = size / 8 + rRaw * size * (7 / 8);
        const gradientId = `gradient-${x}-${y}-${isSecond ? '2' : '1'}`;
        const centerX = x * size;
        const centerY = y * size;
        
        const squareAttrs = svg === 'interactive'
          ? `class="interactive-square" data-cx="${centerX}" data-cy="${centerY}" data-r="${r}" data-angle="${angle * 180}" data-opacity="${(a1 + a2) / 2}"`
          : '';
        
        return `
          <defs>
            <linearGradient id="${gradientId}" x1="${x1}" y1="0" x2="${x2}" y2="1">
              <stop offset="0%" stop-color="hsla(${h1 * 360},${s1 * 100}%,${l1 * 100}%,${a1})"/>
              <stop offset="100%" stop-color="hsla(${h2 * 360},${s2 * 100}%,${l2 * 100}%,${a2})"/>
            </linearGradient>
          </defs>
          <g ${squareAttrs} transform="translate(${centerX} ${centerY}) rotate(${angle * 180})">
            <rect 
              x="${-r/2}" y="${-r/2}" 
              width="${r}" height="${r}"
              fill="url(#${gradientId})"
              style="${isSecond ? 'mix-blend-mode:color-burn;' : 'filter:blur(20px);'}"
            />
          </g>
        `;
      }).join('');
    };

    // Interactive mode script for mouse tracking
    const interactiveScript = svg === 'interactive' ? `
      <script type="text/javascript"><![CDATA[
        const state = {
          elements: [],
          mouse: { x: null, y: null, tx: 0, ty: 0 },
          rect: null,
          frame: null,
          lastTime: 0
        };

        const config = {
          duration: 900,
          perspectiveRange: ${size} * (0.5 + (${finals[0]} + ${finals[1]}) / 4),
          perspectiveZ: ${size} * 1.2,
          baseZ: ${size} * 0.4, // Initial z-offset for all squares
          center: { x: ${size}/2, y: ${size}/2 }
        };

        const init = () => {
          const svg = document.currentScript.closest('svg');
          if (!svg) return;
          
          const updateRect = () => state.rect = svg.getBoundingClientRect();
          window.addEventListener('resize', updateRect);
          updateRect();

          // Initialize elements with their properties
          state.elements = [
            ...Array.from(svg.querySelectorAll('.interactive-circle')).map(el => ({
              el,
              type: 'circle',
              pos: {
                x: parseFloat(el.getAttribute('data-cx')),
                y: parseFloat(el.getAttribute('data-cy')),
                curr: { 
                  x: parseFloat(el.getAttribute('data-cx')), 
                  y: parseFloat(el.getAttribute('data-cy')) 
                }
              },
              mass: (parseFloat(el.getAttribute('r')) * parseFloat(el.getAttribute('data-opacity'))) / ${size}
            })),
            ...Array.from(svg.querySelectorAll('.interactive-square')).map(el => {
              const x = parseFloat(el.getAttribute('data-cx'));
              const y = parseFloat(el.getAttribute('data-cy'));
              const r = parseFloat(el.getAttribute('data-r'));
              const opacity = parseFloat(el.getAttribute('data-opacity'));
              const baseAngle = parseFloat(el.getAttribute('data-angle'));
              const randAngle = baseAngle + (Math.random() * 20 - 10);
              
              return {
                el,
                type: 'square',
                pos: {
                  x,
                  y,
                  z: config.baseZ,
                  rot: randAngle,
                  curr: {
                    x,
                    y,
                    z: config.baseZ,
                    rot: randAngle,
                    scale: 1
                  }
                },
                mass: Math.pow((r / ${size}), 2) * opacity
              };
            })
          ];

          // Initial transform for squares
          state.elements.forEach(el => {
            if (el.type === 'square') {
              const perspectiveScale = config.perspectiveZ / (config.perspectiveZ + el.pos.z);
              const px = config.center.x + (el.pos.x - config.center.x) * perspectiveScale;
              const py = config.center.y + (el.pos.y - config.center.y) * perspectiveScale;
              el.el.setAttribute('transform',
                'translate(' + px + ' ' + py + ') ' +
                'rotate(' + el.pos.rot + ') ' +
                'scale(' + perspectiveScale + ')'
              );
            }
          });

          svg.addEventListener('mousemove', handleMouse);
          svg.addEventListener('mouseleave', () => state.mouse.x = null);
          svg.addEventListener('mouseenter', handleMouse);
          
          animate();
        };

        const handleMouse = e => {
          const { left, top, width, height } = state.rect;
          state.mouse.tx = ((e.clientX - left) / width) * ${size};
          state.mouse.ty = ((e.clientY - top) / height) * ${size};
          if (state.mouse.x === null) {
            state.mouse.x = state.mouse.tx;
            state.mouse.y = state.mouse.ty;
          }
        };

        const updateElement = (el, dt) => {
          const smooth = Math.min(dt / config.duration, 1) * (el.type === 'square' ? 0.3 : 0.1);
          
          if (el.type === 'circle' && state.mouse.x !== null) {
            const dx = state.mouse.x - el.pos.x;
            const dy = state.mouse.y - el.pos.y;
            const dist = Math.hypot(dx, dy);
            const move = Math.min(dist, 30 * (1 - el.mass));
            const angle = Math.atan2(dy, dx);
            
            el.pos.curr.x += (el.pos.x + move * Math.cos(angle) - el.pos.curr.x) * 0.1;
            el.pos.curr.y += (el.pos.y + move * Math.sin(angle) - el.pos.curr.y) * 0.1;

            el.el.setAttribute('cx', el.pos.curr.x);
            el.el.setAttribute('cy', el.pos.curr.y);
            if (${reflect}) {
              const mirror = el.el.nextElementSibling;
              if (mirror) {
                mirror.setAttribute('cx', ${size} - el.pos.curr.x);
                mirror.setAttribute('cy', el.pos.curr.y);
              }
            }
            return;
          }

          if (el.type === 'square') {
            if (state.mouse.x === null) {
              // Return to base position with z-offset
              ['x', 'y', 'z', 'rot', 'scale'].forEach(prop => {
                const target = prop === 'scale' ? 1 : (prop === 'z' ? config.baseZ : el.pos[prop]);
                el.pos.curr[prop] += (target - el.pos.curr[prop]) * smooth;
              });
            } else {
              const dx = state.mouse.x - el.pos.x;
              const dy = state.mouse.y - el.pos.y;
              const dist = Math.hypot(dx, dy);
              const norm = Math.min(dist / config.perspectiveRange, 1);
              const angle = Math.atan2(dy, dx);
              const move = Math.min(dist, 40 * (1 - el.mass));
              
              // Target positions including gentle rotation and z-movement
              const zoomFactor = 1 - Math.pow(norm, 2); // Quadratic falloff for smoother effect
              const target = {
                x: el.pos.x + move * Math.cos(angle),
                y: el.pos.y + move * Math.sin(angle),
                z: config.baseZ - (config.baseZ * zoomFactor * (1 - el.mass)), // Move towards viewer from base position
                rot: el.pos.rot + Math.sin(dist / 100) * 5 * (1 - el.mass),
                scale: 1 + (zoomFactor * 0.3 * (1 - el.mass)) // Additional scale factor for emphasis
              };

              // Smooth interpolation
              Object.entries(target).forEach(([prop, val]) => {
                el.pos.curr[prop] += (val - el.pos.curr[prop]) * smooth;
              });
            }

            // Apply perspective transform
            const { x, y, z, rot, scale } = el.pos.curr;
            const perspectiveScale = config.perspectiveZ / (config.perspectiveZ + z);
            const px = config.center.x + (x - config.center.x) * perspectiveScale;
            const py = config.center.y + (y - config.center.y) * perspectiveScale;
            
            el.el.setAttribute('transform',
              'translate(' + px + ' ' + py + ') ' +
              'rotate(' + rot + ') ' +
              'scale(' + (perspectiveScale * scale) + ')'
            );
          }
        };

        const animate = time => {
          const dt = state.lastTime ? time - state.lastTime : 0;
          state.lastTime = time;

          if (state.mouse.x !== null) {
            state.mouse.x += (state.mouse.tx - state.mouse.x) * 0.1;
            state.mouse.y += (state.mouse.ty - state.mouse.y) * 0.1;
          }

          state.elements.forEach(el => updateElement(el, dt));
          state.frame = requestAnimationFrame(animate);
        };

        // Cleanup
        const cleanup = () => {
          cancelAnimationFrame(state.frame);
          const svg = document.currentScript.closest('svg');
          if (svg) {
            svg.removeEventListener('mousemove', handleMouse);
            svg.removeEventListener('mouseleave', () => state.mouse.x = null);
            svg.removeEventListener('mouseenter', handleMouse);
          }
        };

        init();
        document.currentScript.addEventListener('remove', cleanup);
      ]]></script>
    ` : '';

    // Generate circles for both layers with interactive attributes
    const createCircles = (data, radius, isSecond = false) => {
      return chunkIt(data, 7).map(chunk => {
        if (chunk.length !== 7) return '';
        const [x, y, r, h, s, l, a] = chunk;
        const cx = size / 2 + (x * size) / 2;
        const cy = y * size;
        const rad = r * radius;
        
        const circleAttrs = svg === 'interactive' 
          ? `class="interactive-circle" data-cx="${cx}" data-cy="${cy}" data-opacity="${a}"` 
          : '';

        return `
          <circle 
            ${circleAttrs}
            cx="${cx}" cy="${cy}" r="${rad}"
            fill="hsla(${h * 360},${s * 100}%,${l * 100}%,${a})"
            style="${isSecond ? 'mix-blend-mode:multiply;' : ''}"
          />
          ${reflect ? `
          <circle 
            cx="${size - cx}" cy="${cy}" r="${rad}"
            fill="hsla(${h * 360},${s * 100}%,${l * 100}%,${a})"
            style="${isSecond ? 'mix-blend-mode:multiply;' : ''}"
          />` : ''}
        `;
      }).join('');
    };

    // Create circular mask if needed
    const clipPath = round ? `
      <defs>
        <clipPath id="circle-mask">
          <circle cx="${size/2}" cy="${size/2}" r="${size/2}" />
        </clipPath>
      </defs>
    ` : '';

    let svg_content = `
      <svg 
        width="${size}" height="${size}" 
        viewBox="0 0 ${size} ${size}" 
        xmlns="http://www.w3.org/2000/svg"
        style="overflow: visible;"
      >
        <defs>${bgGradient}</defs>
        ${clipPath}
        <g ${round ? 'clip-path="url(#circle-mask)"' : ''}>
          <rect x="${-size}" width="${3*size}" y="${-size}" height="${3*size}" fill="url(#bg)"/>
          ${draw === "squares" ? 
            `${createSquares(decoded[0], false)}
             ${createSquares(decoded[1], true)}` : 
            `${createCircles(decoded[0], 0.42 * size)}
             ${createCircles(decoded[1], 0.125 * size, true)}`
          }
        </g>
        ${interactiveScript}
      </svg>
    `;

    if (svg === 'interactive') {
      // For interactive mode, return encoded SVG without base64
      return `data:image/svg+xml,${encodeURIComponent(svg_content.trim())}`;
    }

    if (embed) {
      const embedData = { pub }
      if (embed && embed === true) { embedData.content = embed }
      svg_content = embedInImage(svg_content, embedData, 'svg')
    }
  
    // Convert SVG to base64 for better CSS compatibility
    const svgBase64 = typeof btoa === 'function' 
      ? btoa(svg_content) 
      : Buffer.from(svg_content).toString('base64');
    return `data:image/svg+xml;base64,${svgBase64}`;
}