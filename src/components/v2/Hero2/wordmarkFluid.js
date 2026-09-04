/* Liquid displacement over the wordmark — negative-films' `pixelated-text`
   technique, rebuilt.

   Theirs rasterises live DOM text with html2canvas (~150kb, slow, and soft
   because it re-renders the DOM by hand). Ours is already vector outlines,
   so we serialise the SVG straight to an image and get a pin-sharp texture
   with no extra dependency.

   The effect: a 25x25 RGBA float grid holds a velocity field. Pointer
   movement pushes energy into cells near the cursor; every frame the field
   relaxes back toward zero. The fragment shader reads that field as a UV
   offset, so the letterforms ripple like liquid where you moved. */

const GRID = 32;
const MOUSE_RADIUS = 0.28; // fraction of the grid the cursor influences
const STRENGTH = 0.1;
const RELAXATION = 0.94; // per-frame decay of the velocity field
const DISPLACE = 0.013; // UV displacement at full strength

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uTexture;
  uniform sampler2D uDataTexture;
  uniform float uAspectFix;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec4 offset = texture2D(uDataTexture, vUv);

    // aspect correction: the wordmark is far wider than it is tall, so an
    // equal UV offset on both axes would smear horizontally. Scaling x by
    // height/width keeps the ripple isotropic in actual pixels.
    vec2 disp = ${DISPLACE} * offset.rg * vec2(uAspectFix, 1.0);

    // a whisper of idle motion so the mark reads as alive before you touch it
    disp.y += 0.0016 * sin(vUv.x * 7.0 + uTime * 0.6);

    gl_FragColor = texture2D(uTexture, vUv - disp);
  }
`;

/* Serialise the live SVG to a sharp bitmap. currentColor cannot resolve in a
   detached document, so the resolved colour is baked onto every path first. */
function svgToImage(svg, width, height, dpr) {
  const clone = svg.cloneNode(true);
  const fill = getComputedStyle(svg).color || "#ffffff";

  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(Math.round(width * dpr)));
  clone.setAttribute("height", String(Math.round(height * dpr)));
  clone.querySelectorAll("path").forEach((p) => p.setAttribute("fill", fill));
  // GSAP may have left inline transforms on the letter groups
  clone.querySelectorAll("[style]").forEach((el) => el.removeAttribute("style"));

  const markup = new XMLSerializer().serializeToString(clone);
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * @returns {Promise<() => void>} cleanup
 */
export async function mountWordmarkFluid({ container, svg, pointerTarget }) {
  const noop = () => {};
  if (!container || !svg) return noop;

  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.innerWidth < 1000 ||
    !hasWebGL()
  ) {
    return noop;
  }

  const THREE = await import("three");

  let width = svg.clientWidth;
  let height = svg.clientHeight;
  if (!width || !height) return noop;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const makeTexture = async () => {
    const img = await svgToImage(svg, width, height, dpr);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  };

  let texture;
  try {
    texture = await makeTexture();
  } catch {
    return noop; // texture failed — the plain SVG stays visible
  }

  // velocity field
  const makeGrid = () => {
    const data = new Float32Array(GRID * GRID * 4);
    for (let i = 3; i < data.length; i += 4) data[i] = 1;
    const t = new THREE.DataTexture(
      data,
      GRID,
      GRID,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    /* Linear, NOT nearest. Nearest is what makes the source effect read as
       glitchy datamosh — each grid cell displaces as a hard block. Linear
       interpolates between cells so the mark deforms as one liquid sheet,
       which is the right register for a studio called morpheus. */
    t.magFilter = t.minFilter = THREE.LinearFilter;
    t.needsUpdate = true;
    return t;
  };
  let dataTexture = makeGrid();

  const uniforms = {
    uTexture: { value: texture },
    uDataTexture: { value: dataTexture },
    uAspectFix: { value: height / width },
    uTime: { value: 0 },
  };

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(mesh);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(dpr);
  renderer.setSize(width, height, false);

  const canvas = renderer.domElement;
  canvas.className = "h2-wordmark-canvas";
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  container.appendChild(canvas);
  container.classList.add("is-fluid");

  // pointer state, normalised to the wordmark's own box
  const mouse = { x: 0.5, y: 0.5, prevX: 0.5, prevY: 0.5, vX: 0, vY: 0 };

  const onMove = (e) => {
    const rect = svg.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    mouse.vX = nx - mouse.prevX;
    mouse.vY = ny - mouse.prevY;
    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
    mouse.x = nx;
    mouse.y = ny;
  };

  const target = pointerTarget || container;
  target.addEventListener("mousemove", onMove);

  const updateField = () => {
    const data = dataTexture.image.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] *= RELAXATION;
      data[i + 1] *= RELAXATION;
    }

    if (Math.abs(mouse.vX) > 0.0001 || Math.abs(mouse.vY) > 0.0001) {
      const gx = GRID * mouse.x;
      const gy = GRID * (1 - mouse.y);
      const maxDist = GRID * MOUSE_RADIUS;
      const maxDistSq = maxDist * maxDist;
      const aspect = height / width;
      const factor = STRENGTH * 100;

      for (let i = 0; i < GRID; i++) {
        for (let j = 0; j < GRID; j++) {
          const dist = (gx - i) ** 2 / aspect + (gy - j) ** 2;
          if (dist < maxDistSq) {
            const idx = 4 * (i + GRID * j);
            const power = Math.min(10, maxDist / Math.sqrt(dist));
            data[idx] += factor * mouse.vX * power;
            data[idx + 1] -= factor * mouse.vY * power;
          }
        }
      }
    }

    mouse.vX *= 0.9;
    mouse.vY *= 0.9;
    dataTexture.needsUpdate = true;
  };

  let raf;
  let running = true;
  const clock = new THREE.Clock();
  const render = () => {
    if (!running) return;
    uniforms.uTime.value = clock.getElapsedTime();
    updateField();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(render);
  };
  render();

  // pause offscreen — no point burning frames on a hero nobody is looking at
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        render();
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    },
    { threshold: 0 }
  );
  io.observe(container);

  let resizeTimer;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(async () => {
      width = svg.clientWidth;
      height = svg.clientHeight;
      if (!width || !height) return;

      renderer.setSize(width, height, false);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      uniforms.uAspectFix.value = height / width;

      dataTexture.dispose();
      dataTexture = makeGrid();
      uniforms.uDataTexture.value = dataTexture;

      try {
        const next = await makeTexture();
        uniforms.uTexture.value.dispose();
        uniforms.uTexture.value = next;
      } catch {
        /* keep the old texture */
      }
    }, 150);
  };
  window.addEventListener("resize", onResize);

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    clearTimeout(resizeTimer);
    io.disconnect();
    target.removeEventListener("mousemove", onMove);
    window.removeEventListener("resize", onResize);
    container.classList.remove("is-fluid");
    canvas.remove();
    uniforms.uTexture.value?.dispose();
    dataTexture.dispose();
    material.dispose();
    mesh.geometry.dispose();
    renderer.dispose();
  };
}
