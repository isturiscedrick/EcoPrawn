import { useEffect, useRef } from "react";

/**
 * Decorative, non-interactive water-particle layer for the public landing hero.
 * Three.js is loaded only after mount so server rendering never touches WebGL.
 */
export function HeroAquaticScene() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactViewport = window.matchMedia("(max-width: 767px)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    if (reducedMotion.matches || compactViewport.matches || coarsePointer.matches) return;

    let disposed = false;
    let frame = 0;
    let renderer: any;
    let geometry: any;
    let material: any;
    let points: any;
    let camera: any;
    let scene: any;
    let resizeObserver: ResizeObserver | undefined;
    let resizeFallback: (() => void) | undefined;
    let intersectionObserver: IntersectionObserver | undefined;
    let inViewport = true;
    let pageVisible = document.visibilityState === "visible";

    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const onPointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.targetX = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 0.5;
      pointer.targetY = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * -0.28;
    };
    const onPointerLeave = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
    };

    const onVisibilityChange = () => {
      pageVisible = document.visibilityState === "visible";
      if (pageVisible && inViewport && !disposed && !frame) frame = requestAnimationFrame(tick);
      if (!pageVisible && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const cleanup = () => {
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      if (resizeFallback) window.removeEventListener("resize", resizeFallback);
      intersectionObserver?.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      if (points) scene?.remove(points);
      geometry?.dispose();
      material?.dispose();
      renderer?.dispose();
      renderer?.forceContextLoss?.();
      renderer?.domElement?.remove();
    };

    const start = async () => {
      try {
        // @ts-ignore Three.js is a browser-only optional visual layer; keep its import out of SSR.
        const THREE = await import("three");
        if (disposed || !host.isConnected) return;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(48, 1, 0.1, 60);
        camera.position.set(0, 0, 10);

        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          powerPreference: "low-power",
          depth: false,
          stencil: false,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setClearColor(0x000000, 0);
        renderer.domElement.setAttribute("aria-hidden", "true");
        renderer.domElement.setAttribute("tabindex", "-1");
        renderer.domElement.className = "ep-aquatic-scene-canvas";
        host.appendChild(renderer.domElement);

        const count = 190;
        const positions = new Float32Array(count * 3);
        const basePositions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const phases = new Float32Array(count);
        const speeds = new Float32Array(count);
        for (let i = 0; i < count; i += 1) {
          const i3 = i * 3;
          const seed = (i * 127.1 + 311.7) % 997;
          positions[i3] = ((seed * 0.017) % 1 - 0.5) * 17;
          positions[i3 + 1] = (((seed * 0.031) % 1) - 0.5) * 8;
          positions[i3 + 2] = -((i * 37) % 90) / 15;
          basePositions.set(positions.subarray(i3, i3 + 3), i3);
          const cool = (i % 4) / 3;
          colors[i3] = 0.28 + cool * 0.12;
          colors[i3 + 1] = 0.58 + cool * 0.22;
          colors[i3 + 2] = 0.95 + cool * 0.05;
          phases[i] = seed * 0.01;
          speeds[i] = 0.18 + ((i * 13) % 9) * 0.018;
        }

        geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        material = new THREE.PointsMaterial({
          size: 0.045,
          vertexColors: true,
          transparent: true,
          opacity: 0.56,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          sizeAttenuation: true,
        });
        points = new THREE.Points(geometry, material);
        scene.add(points);

        const resize = () => {
          const width = Math.max(host.clientWidth, 1);
          const height = Math.max(host.clientHeight, 1);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
        };
        resize();
        if ("ResizeObserver" in window) {
          resizeObserver = new ResizeObserver(resize);
          resizeObserver.observe(host);
        } else {
          resizeFallback = resize;
          window.addEventListener("resize", resizeFallback);
        }

        host.addEventListener("pointermove", onPointerMove, { passive: true });
        host.addEventListener("pointerleave", onPointerLeave, { passive: true });
        document.addEventListener("visibilitychange", onVisibilityChange);
        if ("IntersectionObserver" in window) {
          intersectionObserver = new IntersectionObserver(([entry]) => {
            inViewport = Boolean(entry?.isIntersecting);
            if (inViewport && pageVisible && !disposed && !frame) frame = requestAnimationFrame(tick);
            if (!inViewport && frame) {
              cancelAnimationFrame(frame);
              frame = 0;
            }
          }, { threshold: 0.01 });
          intersectionObserver.observe(host);
        }

        const clock = new THREE.Clock();
        const tick = () => {
          frame = 0;
          if (disposed || !pageVisible || !inViewport) return;
          const elapsed = clock.getElapsedTime();
          const positionAttribute = geometry.attributes.position;
          const array = positionAttribute.array as Float32Array;
          for (let i = 0; i < count; i += 1) {
            const i3 = i * 3;
            array[i3 + 1] = basePositions[i3 + 1] + Math.sin(elapsed * speeds[i] + phases[i]) * 0.055;
            array[i3] = basePositions[i3] + Math.cos(elapsed * speeds[i] * 0.7 + phases[i]) * 0.028;
          }
          positionAttribute.needsUpdate = true;
          pointer.x += (pointer.targetX - pointer.x) * 0.025;
          pointer.y += (pointer.targetY - pointer.y) * 0.025;
          camera.position.x = pointer.x;
          camera.position.y = pointer.y;
          camera.lookAt(0, 0, 0);
          points.rotation.y = Math.sin(elapsed * 0.08) * 0.025;
          points.rotation.x = Math.cos(elapsed * 0.06) * 0.012;
          renderer.render(scene, camera);
          frame = requestAnimationFrame(tick);
        };
        if (pageVisible && inViewport) frame = requestAnimationFrame(tick);
      } catch {
        // The CSS atmosphere remains visible if WebGL is unavailable.
        cleanup();
      }
    };

    void start();
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div ref={hostRef} className="ep-aquatic-scene" aria-hidden="true" />;
}
