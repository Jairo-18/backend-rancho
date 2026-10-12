/**
 * Genera fotos de muestra (SVG → WebP con sharp) con la paleta del rancho,
 * para que el sitio se vea completo antes de tener las fotos reales.
 */
const SCENES = [
  { sky: '#E3D3B8', far: '#6B8E4E', near: '#2F4A2B', sun: '#B5653A' },
  { sky: '#F4EBDC', far: '#7A5230', near: '#2F4A2B', sun: '#B5653A' },
  { sky: '#E3D3B8', far: '#2F4A2B', near: '#7A5230', sun: '#F4EBDC' },
  { sky: '#F4EBDC', far: '#6B8E4E', near: '#7A5230', sun: '#B5653A' },
  { sky: '#E3D3B8', far: '#B5653A', near: '#2F4A2B', sun: '#F4EBDC' },
];

const escapeXml = (text: string): string =>
  text.replace(/[<>&"']/g, (char) => `&#${char.charCodeAt(0)};`);

export function placeholderSvg(title: string, variant: number): Buffer {
  const scene = SCENES[variant % SCENES.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1067" viewBox="0 0 1600 1067">
  <rect width="1600" height="1067" fill="${scene.sky}"/>
  <circle cx="${1150 - variant * 120}" cy="300" r="120" fill="${scene.sun}" opacity="0.85"/>
  <path d="M0 700 L260 430 L470 610 L720 360 L1010 640 L1250 450 L1600 690 L1600 1067 L0 1067 Z" fill="${scene.far}"/>
  <path d="M0 850 Q400 700 800 820 T1600 790 L1600 1067 L0 1067 Z" fill="${scene.near}"/>
  <rect x="0" y="930" width="1600" height="137" fill="#2B2118" opacity="0.55"/>
  <text x="80" y="1018" font-family="Georgia, serif" font-size="64" fill="#F4EBDC">${escapeXml(title)}</text>
  <text x="1520" y="1018" text-anchor="end" font-family="Georgia, serif" font-size="36" font-style="italic" fill="#E3D3B8">foto de muestra</text>
</svg>`;
  return Buffer.from(svg);
}
