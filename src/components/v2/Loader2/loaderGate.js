/* The loader and the hero hand over in two beats:

     reveal  — the black starts to lift; the hero's entrance begins under it
     landed  — the loader's wordmark sits exactly on the hero's; the hero's own
               letters are switched on beneath it, so the loader can fade out
               with no visible swap

   `handoff` tells the hero whether the loader is delivering the wordmark. If
   the loader is skipped (reduced motion, or a client-side return to the page)
   the hero plays its own letter entrance as before.

   The timeout is a floor under the page, not a design value: if the loader
   ever fails to mount, the hero still arrives. */

let openReveal = () => {};
let openLanded = () => {};

const make = (assign) =>
  typeof window === "undefined"
    ? Promise.resolve({ handoff: false })
    : new Promise((resolve) => {
        assign(resolve);
        setTimeout(() => resolve({ handoff: false }), 9000);
      });

const reveal = make((r) => (openReveal = r));
const landed = make((r) => (openLanded = r));

export const openLoaderReveal = (handoff) => openReveal({ handoff });
export const openLoaderLanded = (handoff) => openLanded({ handoff });
export const loaderDone = () => reveal;
export const wordmarkLanded = () => landed;

/* Runs inline, before the loader is painted and before any other script.

   Reduced motion: the loader is hidden and nothing is locked.

   Otherwise the page is locked from the very first frame. Locking from React
   was too late — measured, the page could be scrolled 787px before the
   loader's effect ran, because Lenis scrolls programmatically and
   `overflow: hidden` does not stop that. So the input itself is swallowed:
   wheel, touch and the scroll keys, in the capture phase on window, before
   Lenis or anything else can see them. `window.__l2Unlock` releases it; a
   ten-second failsafe releases it even if the loader never runs.

   Plain <style> elements into <head>, never attributes on <html>: React owns
   <html>'s attributes and would flag the mismatch on hydration. */
export const BOOT_SCRIPT = `(function(){try{
var css=function(t){var s=document.createElement("style");s.textContent=t;document.head.appendChild(s);return s};
if(matchMedia("(prefers-reduced-motion: reduce)").matches){css(".l2{display:none!important}");window.__l2Unlock=function(){};return}
if("scrollRestoration" in history)history.scrollRestoration="manual";
window.scrollTo(0,0);
var lock=css("html,body{overflow:hidden!important;overscroll-behavior:none}");
var keys={" ":1,Spacebar:1,PageDown:1,PageUp:1,ArrowDown:1,ArrowUp:1,Home:1,End:1};
var stop=function(e){if(e.type==="keydown"&&!keys[e.key])return;e.preventDefault();e.stopImmediatePropagation()};
var o={capture:true,passive:false};
["wheel","touchmove","keydown"].forEach(function(t){window.addEventListener(t,stop,o)});
window.__l2Unlock=function(){["wheel","touchmove","keydown"].forEach(function(t){window.removeEventListener(t,stop,o)});lock.remove();window.__l2Unlock=function(){}};
setTimeout(function(){window.__l2Unlock()},10000);
}catch(e){}})();`;
