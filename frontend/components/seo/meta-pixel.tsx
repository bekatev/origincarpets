/**
 * Server-rendered Meta Pixel base code in <head>.
 * Ads Manager / Events Manager look for this in the HTML source — client-only injection
 * often reports as "website not connected". SPA events still go through TrackingScripts.
 */
export function MetaPixel() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || '';
  if (!pixelId) return null;

  const safeId = JSON.stringify(pixelId);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('consent','grant');
try{var c=document.cookie.match(/(?:^|; )oc_cookie_consent=([^;]*)/);
var z=Intl.DateTimeFormat().resolvedOptions().timeZone||'';
var eea=/^Europe\\//.test(z)&&!/Moscow|Kirov|Volgograd|Samara|Ulyanovsk|Saratov|Astrakhan|Kaliningrad|Simferopol|Istanbul|Kiev|Kyiv|Minsk|Chisinau|Tbilisi/.test(z);
if(c&&c[1]==='rejected')fbq('consent','revoke');
else if((!c||!c[1])&&eea)fbq('consent','revoke');
}catch(e){}
fbq('init',${safeId});
fbq('track','PageView');
`.replace(/\n/g, '')
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${encodeURIComponent(pixelId)}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
