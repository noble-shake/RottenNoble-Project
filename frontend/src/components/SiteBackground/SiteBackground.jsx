import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// 다크 톤 + 청록빛 은근한 광원, fBm(value noise) 기반 절차적 배경.
// 외부 텍스처/에셋 없이 GLSL만으로 그린다.
const VERTEX_SRC = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAGMENT_SRC = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_glow;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.55;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += amp * noise(p);
    p = rot * p * 2.02;
    amp *= 0.55;
  }
  return v;
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0) * 3.0;
  vec2 q = vec2(fbm(p + u_time * 0.03), fbm(p + vec2(5.2, 1.3) - u_time * 0.025));
  float n = fbm(p + 2.4 * q + u_time * 0.015);

  vec3 deep = vec3(0.02, 0.035, 0.045);
  vec3 teal = vec3(0.09, 0.32, 0.34);
  vec3 tealBright = vec3(0.20, 0.62, 0.60);
  vec3 col = mix(deep, teal, smoothstep(0.25, 0.65, n));
  col = mix(col, tealBright, smoothstep(0.6, 0.95, n) * u_glow);

  float vig = smoothstep(1.1, 0.2, length(uv - 0.5) * 1.4);
  col *= mix(0.55, 1.0, vig);

  gl_FragColor = vec4(col, 1.0);
}
`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('SiteBackground shader compile error:', gl.getShaderInfoLog(shader));
  }
  return shader;
}

// 캔버스/WebGL 컨텍스트는 라우트 이동과 무관하게 앱 생애주기 동안 한 번만 만든다 —
// glowRef로 홈/그 외 페이지의 밝기만 갈아끼운다 (재생성 시 깜빡임 방지).
function useShaderCanvas(canvasRef, glowRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return undefined;

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uGlow = gl.getUniformLocation(program, 'u_glow');

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener('resize', resize);
    resize();

    let raf;
    const start = performance.now();
    const loop = (t) => {
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, (t - start) * 0.001);
      gl.uniform1f(uGlow, glowRef.current);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function SiteBackground() {
  const canvasRef = useRef(null);
  const glowRef = useRef(0.6);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    glowRef.current = isHome ? 0.6 : 0.42;
  }, [isHome]);

  useShaderCanvas(canvasRef, glowRef);

  return (
    <>
      <canvas ref={canvasRef} id="bg-canvas" aria-hidden="true" />
      {!isHome && <div className="bg-blur-overlay" aria-hidden="true" />}
    </>
  );
}

export default SiteBackground;
