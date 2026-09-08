import * as THREE from 'three';

/**
 * Custom Studio Ghibli Anime Cel-Shading (Toon) Material Shader
 * Supports dynamic light/dark mode tinting, rim lighting, soft toon gradient ramps,
 * and magical ambient sparkle highlights.
 */
export const GhibliToonShader = {
  uniforms: {
    uBaseColor: { value: new THREE.Color('#78E08F') },
    uShadowColor: { value: new THREE.Color('#38ADA9') },
    uLightDirection: { value: new THREE.Vector3(1, 2, 1).normalize() },
    uLightColor: { value: new THREE.Color('#FFF5E1') },
    uRimColor: { value: new THREE.Color('#ECCC68') },
    uIsDarkTheme: { value: 0.0 }, // 0.0 = Light, 1.0 = Dark
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

      // Diffuse NdotL
      float NdotL = max(0.0, dot(normal, lightDir));

      // Studio Ghibli Multi-band Toon Quantization
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

      // Base to Shadow Interpolation
      vec3 diffuse = mix(uShadowColor, uBaseColor, toonIntensity);

      // Ghibli Soft Rim Lighting
      float rimNdotV = 1.0 - max(0.0, dot(viewDir, normal));
      float rimThreshold = mix(0.65, 0.50, uIsDarkTheme);
      float rimIntensity = smoothstep(rimThreshold, 1.0, rimNdotV);
      vec3 rim = uRimColor * rimIntensity * 0.6;

      // Nighttime Luminescent Shimmer / Daytime Gentle Warmth
      vec3 finalColor = diffuse * uLightColor + rim;

      if (uIsDarkTheme > 0.5) {
        // Dark Mode bioluminescent tinting
        float pulse = sin(uTime * 2.0 + vWorldPosition.y) * 0.05 + 0.95;
        finalColor = finalColor * vec3(0.7, 0.8, 1.1) * pulse;
      }

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
};

/**
 * Helper to create material instance
 */
export const createGhibliMaterial = (baseHex, shadowHex, rimHex) => {
  const mat = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(GhibliToonShader.uniforms),
    vertexShader: GhibliToonShader.vertexShader,
    fragmentShader: GhibliToonShader.fragmentShader,
  });
  if (baseHex) mat.uniforms.uBaseColor.value.set(baseHex);
  if (shadowHex) mat.uniforms.uShadowColor.value.set(shadowHex);
  if (rimHex) mat.uniforms.uRimColor.value.set(rimHex);
  return mat;
};
