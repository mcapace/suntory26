/* A New Suntory Time — WebGL ambient hero backdrop
   A full-screen fragment shader: slow drifting warm light (amber / rose over the
   blush base), a soft diagonal light sweep, film grain, and gentle pointer drift.
   Falls back to the CSS background when WebGL is unavailable or motion is reduced. */

(function () {
  'use strict';

  var canvas = document.querySelector('.hero__gl');
  if (!canvas) { return; }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { canvas.remove(); return; }

  var gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'low-power' })
        || canvas.getContext('experimental-webgl');
  if (!gl) { canvas.remove(); return; }

  var VERT = [
    'attribute vec2 p;',
    'void main(){ gl_Position = vec4(p, 0.0, 1.0); }'
  ].join('\n');

  var FRAG = [
    'precision mediump float;',
    'uniform vec2 u_res;',
    'uniform float u_time;',
    'uniform vec2 u_mouse;',
    '',
    // Simplex 2D noise (Ashima Arts / Stefan Gustavson, MIT)
    'vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }',
    'vec2 mod289(vec2 x){ return x - floor(x * (1.0/289.0)) * 289.0; }',
    'vec3 permute(vec3 x){ return mod289(((x*34.0)+1.0)*x); }',
    'float snoise(vec2 v){',
    '  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);',
    '  vec2 i = floor(v + dot(v, C.yy));',
    '  vec2 x0 = v - i + dot(i, C.xx);',
    '  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);',
    '  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;',
    '  i = mod289(i);',
    '  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));',
    '  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);',
    '  m = m*m; m = m*m;',
    '  vec3 x = 2.0 * fract(p * C.www) - 1.0;',
    '  vec3 h = abs(x) - 0.5;',
    '  vec3 ox = floor(x + 0.5);',
    '  vec3 a0 = x - ox;',
    '  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);',
    '  vec3 g; g.x = a0.x * x0.x + h.x * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;',
    '  return 130.0 * dot(m, g);',
    '}',
    'float fbm(vec2 p){',
    '  float v = 0.0; float a = 0.5;',
    '  for (int i = 0; i < 4; i++) { v += a * snoise(p); p = p * 2.03 + 17.1; a *= 0.5; }',
    '  return v * 0.5 + 0.5;',
    '}',
    '',
    'void main(){',
    '  vec2 uv = gl_FragCoord.xy / u_res;',
    '  float aspect = u_res.x / u_res.y;',
    '  vec2 p = vec2(uv.x * aspect, uv.y);',
    '  float t = u_time * 0.045;',
    '  vec2 m = (u_mouse - 0.5) * 0.35;',
    '',
    '  float n1 = fbm(p * 1.15 + vec2(t * 0.8, -t * 0.5) + m);',
    '  float n2 = fbm(p * 1.9  - vec2(t * 0.6,  t * 0.35) - m * 0.6 + n1 * 0.55);',
    '  float n3 = fbm(p * 0.7  + vec2(-t * 0.3, t * 0.2) + n2 * 0.3);',
    '',
    '  vec3 base  = vec3(0.980, 0.929, 0.898);',   // blush #faede5
    '  vec3 cream = vec3(0.992, 0.968, 0.945);',   // lighter lift
    '  vec3 amber = vec3(0.965, 0.835, 0.660);',   // warm whisky light
    '  vec3 rose  = vec3(0.950, 0.820, 0.800);',   // pale rose
    '  vec3 burg  = vec3(0.780, 0.560, 0.540);',   // very soft burgundy haze
    '',
    '  vec3 col = mix(base, cream, smoothstep(0.30, 0.75, n3) * 0.30);',
    '  col = mix(col, amber, smoothstep(0.42, 0.88, n1) * 0.20);',
    '  col = mix(col, rose,  smoothstep(0.45, 0.90, n2) * 0.16);',
    '  col = mix(col, burg,  smoothstep(0.70, 0.98, n1 * n2 * 1.6) * 0.05);',
    '',
    // slow diagonal light sweep
    '  float sweepPos = 0.55 + sin(u_time * 0.12) * 0.35;',
    '  float sweep = 1.0 - abs((uv.x + uv.y * 0.35) - sweepPos) * 2.6;',
    '  col += smoothstep(0.0, 1.0, sweep) * 0.022;',
    '',
    // vignette: slightly deeper toward the bottom edge, lifts the bottles
    '  col *= 1.0 - smoothstep(0.35, 0.0, uv.y) * 0.015;',
    '',
    // film grain
    '  float g = fract(sin(dot(gl_FragCoord.xy + vec2(u_time * 37.0), vec2(12.9898, 78.233))) * 43758.5453);',
    '  col += (g - 0.5) * 0.012;',
    '',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { return null; }
    return s;
  }

  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { canvas.remove(); return; }
  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(prog, 'u_res');
  var uTime = gl.getUniformLocation(prog, 'u_time');
  var uMouse = gl.getUniformLocation(prog, 'u_mouse');

  var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  function resize() {
    var r = canvas.getBoundingClientRect();
    var w = Math.max(1, Math.floor(r.width * dpr));
    var h = Math.max(1, Math.floor(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, canvas.width, canvas.height);
  }

  var mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  var hero = canvas.parentElement;
  hero.addEventListener('pointermove', function (e) {
    var r = hero.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left) / r.width;
    mouse.ty = 1 - (e.clientY - r.top) / r.height;
  }, { passive: true });
  hero.addEventListener('pointerleave', function () { mouse.tx = 0.5; mouse.ty = 0.5; });

  var visible = true, raf = 0, start = performance.now();
  function frame(now) {
    raf = 0;
    if (!visible || document.hidden) { return; }
    resize();
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;
    gl.uniform1f(uTime, (now - start) / 1000);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && visible && !document.hidden) { raf = requestAnimationFrame(frame); } }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting; kick();
    }, { threshold: 0 }).observe(hero);
  }
  document.addEventListener('visibilitychange', kick);
  window.addEventListener('resize', resize, { passive: true });

  canvas.classList.add('is-live');
  resize();
  kick();
})();
