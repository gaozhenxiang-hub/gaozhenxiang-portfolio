export const galleryVertexShader = /* glsl */ `
  uniform float uVelocity;
  uniform float uTime;
  uniform float uPhase;
  uniform float uCurl;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    float arch = sin(uv.x * 3.14159265);
    float side = sin(uv.y * 3.14159265);
    float ambientWave = (
      sin(uv.x * 7.0 + uTime * 0.65 + uPhase) * 1.25 +
      sin(uv.y * 5.0 - uTime * 0.42 + uPhase * 1.7) * 0.65
    ) * arch;
    transformed.y += ambientWave;
    transformed.z += ambientWave * 1.7;
    transformed.y += arch * uVelocity * 28.0;
    transformed.x += side * uVelocity * 7.0;
    transformed.z += arch * abs(uVelocity) * 10.0;
    float curlScale = mix(1.0, 0.14, uCurl);
    transformed.y *= curlScale;
    transformed.y -= uCurl * 32.0;
    transformed.y += arch * uCurl * 10.0;
    transformed.z += arch * uCurl * 44.0;
    transformed.x += side * uCurl * 3.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

export const galleryFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uVelocity;
  uniform float uTime;
  uniform float uPhase;
  uniform float uImageAspect;
  uniform float uPlaneAspect;
  varying vec2 vUv;

  vec2 coverUv(vec2 uv) {
    vec2 ratio = vec2(
      min(uPlaneAspect / uImageAspect, 1.0),
      min(uImageAspect / uPlaneAspect, 1.0)
    );
    return uv * ratio + (1.0 - ratio) * 0.5;
  }

  float roundedBox(vec2 uv, float radius) {
    vec2 p = abs(uv - 0.5) - vec2(0.5 - radius);
    float distanceToEdge = length(max(p, 0.0)) + min(max(p.x, p.y), 0.0) - radius;
    return 1.0 - smoothstep(-0.002, 0.002, distanceToEdge);
  }

  void main() {
    vec2 uv = coverUv(vUv);
    float idleRefraction = (
      sin(uv.y * 18.0 + uTime * 0.58 + uPhase) +
      sin(uv.x * 13.0 - uTime * 0.42 + uPhase * 1.4)
    ) * 0.00115;
    uv = clamp(uv + vec2(idleRefraction, idleRefraction * 0.55), 0.001, 0.999);
    float shift = min(abs(uVelocity), 1.0) * 0.005;
    float direction = sign(uVelocity);
    float red = texture2D(uTexture, uv + vec2(shift * direction, 0.0)).r;
    float green = texture2D(uTexture, uv).g;
    float blue = texture2D(uTexture, uv - vec2(shift * direction, 0.0)).b;
    vec3 splitColor = vec3(red, green, blue);
    vec3 gradedColor = mix(splitColor, vec3(1.0), 0.08);
    float alpha = roundedBox(vUv, 0.018);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(gradedColor, alpha);
  }
`;
