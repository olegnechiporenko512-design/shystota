import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { Boot } from "@/components/boot";
import appCss from "../styles.css?url";

const APP_NAME = "Таблетки для очищення пральних машин — 299 грн";

const TIKTOK_PIXEL_ID = "DAS6203C77U3N3HEQL7G";
const FB_PIXEL_ID = "3557729764386334";

const TIKTOK_PIXEL_SNIPPET = `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};ttq.load('${TIKTOK_PIXEL_ID}');ttq.page();ttq.track('ViewContent',{content_id:'akvakrystal-12',content_type:'product',content_name:'Аквакристал — таблетки для пральних машин',value:299,currency:'UAH'});}(window,document,'ttq');`;

const FB_PIXEL_SNIPPET = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('set','autoConfig',false,'${FB_PIXEL_ID}');fbq('set','autoConfig',false,'1749190629525376');fbq('init','${FB_PIXEL_ID}');fbq('init','1749190629525376');fbq('track','PageView');fbq('track','ViewContent',{content_name:'Аквакристал — таблетки для пральних машин',content_ids:['akvakrystal-12'],content_type:'product',value:299,currency:'UAH'});`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "Аквакристал — таблетки для очищення пральних машин, 12 шт. Прибирають накип, бруд і запах. 299 грн, оплата при отриманні.",
      },
      { name: "theme-color", content: "#041428" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Montserrat:wght@600;700;800;900&display=swap",
      },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="uk" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script defer src="/_vercel/insights/script.js" />
        <script dangerouslySetInnerHTML={{ __html: TIKTOK_PIXEL_SNIPPET }} />
        <script dangerouslySetInnerHTML={{ __html: FB_PIXEL_SNIPPET }} />
      </head>
      <body>
        <PreviewHostBridge />
        <Boot />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
