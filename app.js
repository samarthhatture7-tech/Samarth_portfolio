window.tailwind = window.tailwind || {};
window.tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface-variant": "#333535",
        "tertiary-container": "#b4b2b2",
        "on-error-container": "#ffdad6",
        surface: "#121414",
        error: "#ffb4ab",
        "on-primary-container": "#554300",
        "inverse-on-surface": "#2f3131",
        primary: "#f2ca50",
        "on-secondary": "#313030",
        "surface-container-low": "#1a1c1c",
        "on-tertiary": "#313030",
        secondary: "#c9c6c5",
        "surface-dim": "#121414",
        "on-primary-fixed-variant": "#574500",
        "surface-bright": "#37393a",
        "surface-container-highest": "#333535",
        "primary-fixed-dim": "#e9c349",
        "inverse-primary": "#735c00",
        "on-secondary-fixed-variant": "#474646",
        "surface-container-lowest": "#0c0f0f",
        outline: "#99907c",
        "secondary-fixed-dim": "#c9c6c5",
        "outline-variant": "#4d4635",
        "on-surface": "#e2e2e2",
        "on-error": "#690005",
        "secondary-container": "#4a4949",
        "error-container": "#93000a",
        "surface-container": "#1e2020",
        "primary-fixed": "#ffe088",
        "on-background": "#e2e2e2",
        "on-secondary-container": "#bab8b7",
        "surface-tint": "#e9c349",
        "surface-container-high": "#282a2b",
        "primary-container": "#d4af37",
        "on-tertiary-fixed": "#1c1b1b",
        "on-primary-fixed": "#241a00",
        "on-secondary-fixed": "#1c1b1b",
        "on-surface-variant": "#d0c5af",
        "on-tertiary-fixed-variant": "#474746",
        "on-tertiary-container": "#454544",
        "inverse-surface": "#e2e2e2",
        "secondary-fixed": "#e5e2e1",
        "tertiary-fixed": "#e5e2e1",
        "tertiary-fixed-dim": "#c8c6c5",
        "on-primary": "#3c2f00",
        background: "#121414",
        tertiary: "#d0cdcd",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        md: "24px",
        xs: "4px",
        "container-max": "1280px",
        base: "8px",
        lg: "48px",
        xl: "80px",
        gutter: "24px",
        sm: "12px",
      },
      fontFamily: {
        "label-sm": ["Inter"],
        "label-md": ["Inter"],
        "headline-md": ["Montserrat"],
        "headline-xl-mobile": ["Montserrat"],
        "headline-lg": ["Montserrat"],
        "body-md": ["Inter"],
        "headline-xl": ["Montserrat"],
        "body-lg": ["Inter"],
      },
      fontSize: {
        "label-sm": ["12px", { lineHeight: "1.2", fontWeight: "500" }],
        "label-md": ["14px", { lineHeight: "1.2", letterSpacing: "0.05em", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "1.4", fontWeight: "600" }],
        "headline-xl-mobile": ["40px", { lineHeight: "1.2", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "1.3", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "headline-xl": ["64px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
      },
    },
  },
};

function initShaderCanvas() {
  const canvas = document.getElementById('shader-canvas-ANIMATION_3');
  if (!canvas) return;

  function syncSize() {
    const w = canvas.clientWidth || 1280;
    const h = canvas.clientHeight || 720;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(syncSize).observe(canvas);
  }
  syncSize();

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;

  const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

  const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = v_texCoord;
    float noise = sin(uv.x * 3.0 + u_time * 0.5) * cos(uv.y * 3.0 + u_time * 0.3);
    noise += sin(uv.x * 6.0 - u_time * 0.2) * 0.5;
    vec3 baseColor = vec3(0.04, 0.04, 0.04);
    vec3 goldColor = vec3(0.83, 0.69, 0.22);
    float intensity = smoothstep(-1.0, 1.0, noise);
    vec3 finalColor = mix(baseColor, baseColor * 1.5 + goldColor * 0.05, intensity);
    float vignette = 1.0 - length(uv - 0.5) * 0.8;
    gl_FragColor = vec4(finalColor * vignette, 1.0);
}`;

  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  const program = gl.createProgram();
  gl.attachShader(program, createShader(gl.VERTEX_SHADER, vs));
  gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(program);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(program, 'u_time');
  const uRes = gl.getUniformLocation(program, 'u_resolution');
  const uMouse = gl.getUniformLocation(program, 'u_mouse');

  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

  window.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = (event.clientX - rect.left) / rect.width;
    const ny = 1.0 - (event.clientY - rect.top) / rect.height;
    mouse.x = nx * canvas.width;
    mouse.y = ny * canvas.height;
  });

  function render(time) {
    if (typeof ResizeObserver === 'undefined') syncSize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (uTime) gl.uniform1f(uTime, time * 0.001);
    if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
    if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

function initScrollReveal() {
  const reveals = document.querySelectorAll('.scroll-reveal');
  const header = document.querySelector('header');

  const revealOnScroll = () => {
    reveals.forEach((element) => {
      const windowHeight = window.innerHeight;
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 100;
      if (elementTop < windowHeight - elementVisible) {
        element.classList.add('active');
      }
    });
  };

  const updateHeaderPadding = () => {
    if (!header) return;
    if (window.scrollY > 50) {
      header.classList.add('py-2');
      header.classList.remove('py-base');
    } else {
      header.classList.add('py-base');
      header.classList.remove('py-2');
    }
  };

  window.addEventListener('scroll', revealOnScroll);
  window.addEventListener('scroll', updateHeaderPadding);
  window.addEventListener('load', revealOnScroll);
  window.addEventListener('load', updateHeaderPadding);
}

window.addEventListener('DOMContentLoaded', () => {
  initShaderCanvas();
  initScrollReveal();
});
