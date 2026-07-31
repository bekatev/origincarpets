export type MediaOrientation = 'portrait' | 'landscape';

export type AboutMediaItem =
  | {
      id: string;
      kind: 'facebook';
      href: string;
      orientation: MediaOrientation;
    }
  | {
      id: string;
      kind: 'ajaratv';
      href: string;
      orientation: 'landscape';
      poster: string;
      titleEn: string;
      titleKa: string;
    };

/**
 * Press / TV appearances.
 * Orientation follows the source video aspect (FB metadata reports these reels as 16:9).
 */
export const aboutMediaItems: AboutMediaItem[] = [
  {
    id: 'fb-902013140345923',
    kind: 'facebook',
    href: 'https://www.facebook.com/reel/902013140345923',
    orientation: 'landscape'
  },
  {
    id: 'fb-1197005265506733',
    kind: 'facebook',
    href: 'https://www.facebook.com/reel/1197005265506733',
    orientation: 'landscape'
  },
  {
    id: 'ajaratv-startaperebi-31000',
    kind: 'ajaratv',
    orientation: 'landscape',
    href: 'https://ajaratv.ge/show/133-startaperebi/31000',
    poster: '/stock/video/ajaratv-startaperebi-manana.jpg',
    titleEn: 'AdjaraTV — Startaperebi',
    titleKa: 'აჭარა TV — სტარტაპერები'
  },
  {
    id: 'fb-1224067171665274',
    kind: 'facebook',
    href: 'https://www.facebook.com/reel/1224067171665274',
    orientation: 'landscape'
  },
  {
    id: 'fb-1474832170938227',
    kind: 'facebook',
    href: 'https://www.facebook.com/reel/1474832170938227',
    orientation: 'landscape'
  },
  {
    id: 'fb-831077022858028',
    kind: 'facebook',
    href: 'https://www.facebook.com/reel/831077022858028',
    orientation: 'landscape'
  },
  {
    id: 'fb-2004527460351651',
    kind: 'facebook',
    href: 'https://www.facebook.com/reel/2004527460351651',
    orientation: 'landscape'
  },
  {
    id: 'fb-536046951370128',
    kind: 'facebook',
    href: 'https://www.facebook.com/reel/536046951370128',
    orientation: 'landscape'
  }
];

export function facebookEmbedSrc(
  href: string,
  size: { width: number; height: number } = { width: 640, height: 360 }
): string {
  const params = new URLSearchParams({
    href,
    show_text: 'false',
    width: String(size.width),
    height: String(size.height),
    t: '0'
  });
  return `https://www.facebook.com/plugins/video.php?${params.toString()}`;
}
