"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import "./Work2.css";

/* real morpheus work, pulled from their live site earlier */
const PROJECTS = [
  { title: "Brand Identity", meta: "branding · art direction", src: "/work/work-4.jpg" },
  { title: "Spatial & Interior", meta: "design · visualisation", src: "/work/work-1.jpg" },
  { title: "Film & Photography", meta: "media production", src: "/work/work-8.jpg" },
  { title: "Workspace Identity", meta: "spatial · art direction", src: "/work/work-2.jpg" },
];

/* negative-films' lens-bubble transition, rebuilt: an expanding sphere
   magnifies the incoming image and refracts the outgoing one at its rim */
const FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex1;
  uniform sampler2D uTex2;
  uniform vec2 uRes;
  uniform vec2 uTex1Res;
  uniform vec2 uTex2Res;
  uniform float uProgress;
  uniform float uTime;
  varying vec2 vUv;

  vec2 coverUV(vec2 uv, vec2 planeRes, vec2 texRes) {
    float planeA = planeRes.x / planeRes.y;
    float texA = texRes.x / texRes.y;
    vec2 s = (planeA > texA)
      ? vec2(1.0, texA / planeA)
      : vec2(planeA / texA, 1.0);
    return (uv - 0.5) * s + 0.5;
  }

  void main() {
    vec2 uv = vUv;
    vec2 center = vec2(0.5);
    float aspect = uRes.x / uRes.y;
    vec2 p = (uv - center) * vec2(aspect, 1.0);
    float d = length(p);

    float maxR = length(vec2(aspect, 1.0)) * 0.5 + 0.3;
    float r = uProgress * maxR;
    float edgeW = 0.16;

    float inside = smoothstep(r, r - edgeW, d);
    float rim = smoothstep(r + edgeW, r, d) * smoothstep(r - edgeW * 2.0, r, d);
    vec2 dir = d > 0.0001 ? normalize(p) / vec2(aspect, 1.0) : vec2(0.0);

    // idle breathe on the resting image
    float breathe = 1.0 + 0.025 * sin(uTime * 0.25);
    vec2 uv1 = (uv - center) / breathe + center + dir * rim * 0.1;

    // incoming image settles from a zoom as the bubble grows
    float zoom = mix(1.55, 1.0, smoothstep(0.0, 1.0, uProgress));
    vec2 uv2 = (uv - center) / zoom + center - dir * rim * 0.07;

    vec4 c1 = texture2D(uTex1, coverUV(uv1, uRes, uTex1Res));
    vec4 c2 = texture2D(uTex2, coverUV(uv2, uRes, uTex2Res));

    // rim catches a touch of light, like glass
    vec4 color = mix(c1, c2, inside);
    color.rgb += rim * 0.08;
    gl_FragColor = color;
  }
`;

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export default function Work2() {
  const sectionRef = useRef(null);
  const mediaRef = useRef(null);
  const canvasRef = useRef(null);
  const stateRef = useRef({ index: 0, animating: false, advance: null });
  const [index, setIndex] = useState(0);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced || window.innerWidth < 1000) {
      // decide after paint — SSR markup must match the first client render
      const raf = requestAnimationFrame(() => setFallback(true));
      // simple fallback: click swaps images with a fade
      stateRef.current.advance = () => {
        setIndex((i) => (i + 1) % PROJECTS.length);
      };
      return () => cancelAnimationFrame(raf);
    }

    let cleanup = () => {};
    let cancelled = false;

    const init = async () => {
      // three.js loads only when this section approaches — never on v1
      const THREE = await import("three");
      if (cancelled || !canvasRef.current) return;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      const loader = new THREE.TextureLoader();
      const textures = await Promise.all(
        PROJECTS.map(
          (p) =>
            new Promise((resolve) => {
              loader.load(p.src, (t) => {
                t.colorSpace = THREE.SRGBColorSpace;
                t.minFilter = THREE.LinearFilter;
                resolve(t);
              });
            })
        )
      );
      if (cancelled) {
        textures.forEach((t) => t.dispose());
        renderer.dispose();
        return;
      }

      const texRes = (t) =>
        new THREE.Vector2(t.image.naturalWidth, t.image.naturalHeight);

      const uniforms = {
        uTex1: { value: textures[0] },
        uTex2: { value: textures[1] },
        uTex1Res: { value: texRes(textures[0]) },
        uTex2Res: { value: texRes(textures[1]) },
        uRes: { value: new THREE.Vector2(1, 1) },
        uProgress: { value: 0 },
        uTime: { value: 0 },
      };

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
      });
      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

      // the canvas now fills the framed media panel, not the whole section
      const resize = () => {
        const box = mediaRef.current || section;
        const w = box.clientWidth;
        const h = box.clientHeight;
        renderer.setSize(w, h, false);
        uniforms.uRes.value.set(w, h);
      };
      resize();
      window.addEventListener("resize", resize);

      let rafId;
      const clock = new THREE.Clock();
      const render = () => {
        uniforms.uTime.value = clock.getElapsedTime();
        renderer.render(scene, camera);
        rafId = requestAnimationFrame(render);
      };
      render();

      stateRef.current.advance = () => {
        const s = stateRef.current;
        if (s.animating) return;
        s.animating = true;

        const next = (s.index + 1) % PROJECTS.length;
        uniforms.uTex2.value = textures[next];
        uniforms.uTex2Res.value = texRes(textures[next]);

        gsap.fromTo(
          uniforms.uProgress,
          { value: 0 },
          {
            value: 1,
            duration: 2.2,
            ease: "power2.inOut",
            onComplete: () => {
              uniforms.uTex1.value = textures[next];
              uniforms.uTex1Res.value = texRes(textures[next]);
              uniforms.uProgress.value = 0;
              s.index = next;
              s.animating = false;
            },
          }
        );

        // content swaps mid-bubble, while the lens covers the switch
        gsap.delayedCall(0.7, () => setIndex(next));
      };

      cleanup = () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener("resize", resize);
        textures.forEach((t) => t.dispose());
        material.dispose();
        renderer.dispose();
      };
    };

    // lazy: only boot WebGL when the section is near the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          init();
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    observer.observe(section);

    return () => {
      cancelled = true;
      observer.disconnect();
      cleanup();
    };
  }, []);

  const project = PROJECTS[index];

  return (
    <section
      className="w2"
      ref={sectionRef}
      onClick={() => stateRef.current.advance?.()}
    >
      {fallback ? (
        <div className="w2-fallback">
          {PROJECTS.map((p, i) => (
            <img
              key={p.src}
              src={p.src}
              alt=""
              className={i === index ? "is-active" : ""}
              loading="lazy"
            />
          ))}
        </div>
      ) : (
        <canvas className="w2-canvas" ref={canvasRef} />
      )}

      <div className="w2-scrim" aria-hidden="true" />

      <div className="w2-head">
        <p>[ 03 — selected work ]</p>
        <p>morpheus. archive</p>
      </div>

      <div className="w2-content" key={index}>
        <p className="w2-counter">
          {String(index + 1).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")}
        </p>
        {/* the mask lets the title rise into view on every slide change */}
        <div className="w2-title-mask">
          <h2 className="w2-title">{project.title}</h2>
        </div>
        <p className="w2-meta">{project.meta}</p>
      </div>

      <div className="w2-foot">
        <p>[ click anywhere to advance ]</p>
        <div className="w2-progress" aria-hidden="true">
          {PROJECTS.map((p, i) => (
            <span key={p.src} className={i === index ? "is-on" : ""} />
          ))}
        </div>
      </div>
    </section>
  );
}
