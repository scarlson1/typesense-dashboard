/* Shared inline SVG icons used across the marketing site. */
import type { SVGProps } from 'react';

const stroke: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

// export const Logo = (props: SVGProps<SVGSVGElement>) => (
//   <svg viewBox="30 6 190 330" fill="currentColor" aria-hidden="true" {...props}>
//     <path d="M 180.3 28.1 L 180.8 28.9 Q 183.0 33.0 181.9 37.5 L 161.6 122.4 Q 160.0 129.0 159.6 135.8 L 159.3 139.7 Q 159.0 144.0 160.3 148.1 L 160.7 148.9 Q 162.0 153.0 164.7 156.3 L 166.9 159.1 Q 171.0 164.0 176.4 167.4 L 192.6 177.6 Q 198.0 181.0 198.9 187.3 L 199.1 188.7 Q 200.0 195.0 196.0 199.9 L 195.1 201.1 Q 191.0 206.0 186.4 210.4 L 96.2 296.2 Q 88.0 304.0 79.0 310.8 L 72.0 316.0 Q 68.0 319.0 67.1 314.1 L 66.9 312.9 Q 66.0 308.0 67.2 303.1 L 81.6 244.6 Q 85.0 231.0 87.2 217.2 L 89.2 204.2 Q 90.0 199.0 88.2 194.1 L 87.8 192.9 Q 86.0 188.0 82.5 184.1 L 81.0 182.5 Q 77.0 178.0 71.8 174.8 L 56.8 165.6 Q 51.0 162.0 50.1 155.3 L 49.9 153.8 Q 49.0 147.0 53.9 142.3 L 174.6 27.2 Q 178.0 24.0 180.3 28.1 Z" />
//   </svg>
// )

export const GithubIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox='0 0 24 24' fill='currentColor' {...props}>
    <path d='M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5A11.5 11.5 0 0 0 23.5 12C23.5 5.7 18.3.5 12 .5z' />
  </svg>
);

export const CheckIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...stroke} strokeWidth={2.4} {...props}>
    <polyline points='20 6 9 17 4 12' />
  </svg>
);

export const PlayIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...stroke} {...props}>
    <polygon points='6 4 20 12 6 20 6 4' fill='currentColor' stroke='none' />
  </svg>
);

export const SunIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg className='sun' {...stroke} {...props}>
    <circle cx='12' cy='12' r='4' />
    <path d='M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4' />
  </svg>
);

export const MoonIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg className='moon' {...stroke} {...props}>
    <path d='M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z' />
  </svg>
);

export const SearchIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...stroke} {...props}>
    <circle cx='11' cy='11' r='7' />
    <path d='m21 21-4.3-4.3' />
  </svg>
);

export const ExternalLinkIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...stroke} {...props}>
    <path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' />
    <polyline points='15 3 21 3 21 9' />
    <line x1='10' y1='14' x2='21' y2='3' />
  </svg>
);
