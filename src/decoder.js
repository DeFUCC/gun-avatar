import { toB64, encodeUrlSafeBase64 } from "./utils";

/**
 * Extract public key from SVG avatar
 * @param {string} svgString - SVG content as string
 * @returns {string|null} - The extracted public key or null if extraction failed
 */
export function extractPubFromSVG(svgString) {
    // First check for embedded metadata
    const metadataMatch = svgString.match(/<metadata>\s*<gun-data>(.*?)<\/gun-data>\s*<\/metadata>/);
    if (metadataMatch && metadataMatch[1]) {
        try {
            const data = JSON.parse(metadataMatch[1]);
            if (data && data.pub && validatePub(data.pub)) {
                return data.pub;
            }
        } catch (e) {
            console.error('Failed to parse embedded metadata:', e);
        }
    }

    // If no valid metadata, extract from visual elements
    return extractPubFromCircles(svgString);
}

/**
 * Extract public key from SVG circles
 * @param {string} svgString - SVG content as string
 * @returns {string|null} - The extracted public key or null if extraction failed
 */
export function extractPubFromCircles(svgString) {
    // Extract all circle elements
    const circleMatches = Array.from(svgString.matchAll(/<circle[^>]*>/g));
    if (!circleMatches || circleMatches.length === 0) {
        return null;
    }

    // Get SVG size from viewBox
    const viewBoxMatch = svgString.match(/viewBox="0 0 (\d+) \d+"/);
    const size = viewBoxMatch ? parseInt(viewBoxMatch[1]) : 200;

    // Group circles by layer
    const firstLayerCircles = [];
    const secondLayerCircles = [];
    let isReflected = false;

    circleMatches.forEach(match => {
        const circle = match[0];

        // Check if it's reflected
        if (circle.includes(`cx="${size - size / 2}`)) {
            isReflected = true;
            return; // Skip reflected circles
        }

        // Extract attributes
        const cxMatch = circle.match(/cx="([^"]+)"/);
        const cyMatch = circle.match(/cy="([^"]+)"/);
        const rMatch = circle.match(/r="([^"]+)"/);
        const fillMatch = circle.match(/fill="hsla\(([^,]+),([^%]+)%,([^%]+)%,([^)]+)\)"/);

        if (!cxMatch || !cyMatch || !rMatch || !fillMatch) {
            return;
        }

        const cx = parseFloat(cxMatch[1]);
        const cy = parseFloat(cyMatch[1]);
        const r = parseFloat(rMatch[1]);
        const h = parseFloat(fillMatch[1]) / 360;
        const s = parseFloat(fillMatch[2]) / 100;
        const l = parseFloat(fillMatch[3]) / 100;
        const a = parseFloat(fillMatch[4]);

        // Normalize coordinates back to original values
        const x = (cx - size / 2) / (size / 2);
        const y = cy / size;

        // Differentiate between first and second layer based on radius and style
        const circleData = [x, y, r / (0.42 * size), h, s, l, a];

        if (circle.includes('mix-blend-mode:multiply')) {
            secondLayerCircles.push(circleData);
        } else {
            firstLayerCircles.push(circleData);
        }
    });

    // Reconstruct data chunks
    const firstLayerData = firstLayerCircles.flat();
    const secondLayerData = secondLayerCircles.flat();

    // Encode back to base64
    const part1 = encodeDataToBase64(firstLayerData);
    const part2 = encodeDataToBase64(secondLayerData);

    if (!part1 || !part2) {
        return null;
    }

    return `${part1}.${part2}`;
}

/**
 * Encode extracted data back to URL-safe base64
 * @param {Array} data - Extracted circle data
 * @returns {string} - URL-safe base64 string
 */
function encodeDataToBase64(data) {
    try {
        // Convert the floating point values to the byte array format expected by the encoder
        const byteArray = new Uint8Array(data.length);
        data.forEach((value, index) => {
            // Scale values back to 0-255 range
            byteArray[index] = Math.floor(value * 255);
        });

        // Encode to URL-safe base64
        return encodeUrlSafeBase64(byteArray);
    } catch (e) {
        console.error('Failed to encode data to base64:', e);
        return null;
    }
}

/**
 * Validate public key format (imported from main.js)
 * @param {string} pub - Public key to validate
 * @returns {boolean} - True if valid format
 */
function validatePub(pub) {
    return pub && typeof pub === 'string' && pub.length === 87 && pub.split('.').length === 2;
}

/**
 * Extract public key from an SVG avatar URL (data URI)
 * @param {string} dataUri - SVG data URI
 * @returns {string|null} - Extracted public key or null
 */
export function extractPubFromDataURI(dataUri) {
    if (!dataUri || !dataUri.startsWith('data:image/svg+xml')) {
        return null;
    }

    let svgString;

    // Handle base64 encoded SVG
    if (dataUri.includes('base64,')) {
        const base64 = dataUri.split('base64,')[1];
        svgString = typeof atob === 'function'
            ? atob(base64)
            : Buffer.from(base64, 'base64').toString();
    }
    // Handle URL encoded SVG
    else if (dataUri.includes(',')) {
        svgString = decodeURIComponent(dataUri.split(',')[1]);
    } else {
        return null;
    }

    return extractPubFromSVG(svgString);
}

/**
 * Complete function to extract public key from any avatar source
 * (SVG string, data URI, or DOM element with src/background)
 * @param {string|HTMLElement} source - Avatar source
 * @returns {string|null} - Extracted public key or null
 */
export function extractPublicKey(source) {
    // Handle different source types
    if (typeof source === 'string') {
        // If it's a data URI
        if (source.startsWith('data:image/svg+xml')) {
            return extractPubFromDataURI(source);
        }
        // If it's an SVG string
        if (source.includes('<svg')) {
            return extractPubFromSVG(source);
        }
    }
    // If it's a DOM element
    else if (typeof window !== 'undefined' && source instanceof HTMLElement) {
        // Get src from image
        if (source.tagName === 'IMG' && source.src) {
            return extractPubFromDataURI(source.src);
        }
        // Get background image from any element
        if (source.style && source.style.backgroundImage) {
            const bgImage = source.style.backgroundImage;
            const urlMatch = bgImage.match(/url\(['"]?(.*?)['"]?\)/);
            if (urlMatch) {
                return extractPubFromDataURI(urlMatch[1]);
            }
        }
        // Get data from object
        if (source.tagName === 'OBJECT' && source.data) {
            return extractPubFromDataURI(source.data);
        }
    }

    return null;
}