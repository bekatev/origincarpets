export type AboutMediaItem =
  | {
      id: string;
      kind: 'facebook';
      href: string;
    }
  | {
      id: string;
      kind: 'ajaratv';
      href: string;
      titleEn: string;
      titleKa: string;
    };

/** Press / TV appearances — order matches the About Us page. */
export const aboutMediaItems: AboutMediaItem[] = [
  {
    id: 'fb-902013140345923',
    kind: 'facebook',
    href: 'https://www.facebook.com/reel/902013140345923'
  },
  {
    id: 'fb-1197005265506733',
    kind: 'facebook',
    href: 'https://www.facebook.com/reel/1197005265506733'
  },
  {
    id: 'ajaratv-startaperebi-31000',
    kind: 'ajaratv',
    href: 'https://ajaratv.ge/show/133-startaperebi/31000',
    titleEn: 'AdjaraTV — Startaperebi · Manana Arkania',
    titleKa: 'აჭარა TV — სტარტაპერები · მანანა არქანია'
  },
  {
    id: 'fb-1224067171665274',
    kind: 'facebook',
    href: 'https://www.facebook.com/reel/1224067171665274'
  },
  {
    id: 'fb-1474832170938227',
    kind: 'facebook',
    href: 'https://www.facebook.com/reel/1474832170938227'
  },
  {
    id: 'fb-831077022858028',
    kind: 'facebook',
    href: 'https://www.facebook.com/reel/831077022858028'
  },
  {
    id: 'fb-2004527460351651',
    kind: 'facebook',
    href: 'https://www.facebook.com/reel/2004527460351651'
  },
  {
    id: 'fb-536046951370128',
    kind: 'facebook',
    href: 'https://www.facebook.com/reel/536046951370128'
  }
];

export function facebookEmbedSrc(href: string): string {
  const params = new URLSearchParams({
    href,
    show_text: 'false',
    width: '380',
    height: '680',
    t: '0'
  });
  return `https://www.facebook.com/plugins/video.php?${params.toString()}`;
}
