import { extractPubFromSVG } from "./decoder";
import { embedInImage } from "./embed";
import { interactiveScriptGen } from "./interactive";
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
              x="${-r / 2}" y="${-r / 2}" 
              width="${r}" height="${r}"
              fill="url(#${gradientId})"
              style="${isSecond ? 'mix-blend-mode:color-burn;' : 'filter:blur(20px);'}"
            />
          </g>
        `;
    }).join('');
  };


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

  const clipPath = round ? `
      <defs>
        <clipPath id="circle-mask">
          <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" />
        </clipPath>
      </defs>
    ` : '';

  // Interactive mode script for mouse tracking
  const interactiveScript = svg === 'interactive' ? interactiveScriptGen({ size, reflect, finals }) : '';

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
          <rect x="${-size}" width="${3 * size}" y="${-size}" height="${3 * size}" fill="url(#bg)"/>
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
    svg_content = embedInSvg(svg_content, pub)
  }

  function embedInSvg(svgString, data) {
    try {
      const metadata = `<metadata>
        <gun-data>${JSON.stringify(data)}</gun-data>
      </metadata>`
      return svgString.replace('</svg>', `${metadata}</svg>`)
    } catch (e) {
      error.value = 'Failed to embed data in SVG: ' + e.message
      return null
    }
  }
  // console.log(extractPubFromSVG(svg_content))
  const svgBase64 = typeof btoa === 'function'
    ? btoa(svg_content)
    : Buffer.from(svg_content).toString('base64');
  let finalData = `data:image/svg+xml;base64,${svgBase64}`;

  return finalData
}