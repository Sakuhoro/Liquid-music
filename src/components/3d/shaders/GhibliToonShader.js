import * as THREE from 'three';

/**
 * Creates a 5-step Ghibli Toon Gradient Map Texture for Three.js MeshToonMaterial
 */
export function createGhibliGradientMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');

  // Ghibli 5-tone stepped shading gradient
  const gradient = ctx.createLinearGradient(0, 0, 128, 0);
  gradient.addColorStop(0.0, '#3A405A');  // Dark shadow
  gradient.addColorStop(0.25, '#596886'); // Soft shadow
  gradient.addColorStop(0.5, '#788EA8');  // Midtone
  gradient.addColorStop(0.75, '#A4B8C4'); // Bright light
  gradient.addColorStop(1.0, '#FFF3E0');  // Highlight

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 1);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

/**
 * Custom Studio Ghibli Anime Cel-Shading Material Shader
 */
export const GhibliToonShader = {
  uniforms: {
    uBaseColor: { value: new THREE.Color('#78E08F') },
    uShadowColor: { value: new THREE.Color('#38ADA9') },
    uLightDirection: { value: new THREE.Vector3(1, 2, 1).normalize() },
    uLightColor: { value: new THREE.Color('#FFF5E1') },
    uRimColor: { value: new THREE.Color('#ECCC68') },
    uIsDarkTheme: { value: 0.0 },
    uTime: { value: 0.0 },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uBaseColor;
    uniform vec3 uShadowColor;
    uniform vec3 uLightDirection;
    uniform vec3 uLightColor;
    uniform vec3 uRimColor;
    uniform float uIsDarkTheme;
    uniform float uTime;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      vec3 lightDir = normalize(uLightDirection);

      float NdotL = max(0.0, dot(normal, lightDir));

      float toonIntensity;
      if (NdotL > 0.85) {
        toonIntensity = 1.0;
      } else if (NdotL > 0.45) {
        toonIntensity = 0.7;
      } else if (NdotL > 0.15) {
        toonIntensity = 0.4;
      } else {
        toonIntensity = 0.15;
      }

      vec3 diffuse = mix(uShadowColor, uBaseColor, toonIntensity);

      float rimNdotV = 1.0 - max(0.0, dot(viewDir, normal));
      float rimThreshold = mix(0.65, 0.50, uIsDarkTheme);
      float rimIntensity = smoothstep(rimThreshold, 1.0, rimNdotV);
      vec3 rim = uRimColor * rimIntensity * 0.6;

      vec3 finalColor = diffuse * uLightColor + rim;

      if (uIsDarkTheme > 0.5) {
        float pulse = sin(uTime * 2.0 + vWorldPosition.y) * 0.05 + 0.95;
        finalColor = finalColor * vec3(0.7, 0.8, 1.1) * pulse;
      }

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
};
