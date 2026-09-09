export const galleryVertexShader = /* glsl */ `
  uniform float uVelocity;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    float arch = sin(uv.x * 3.14159265);
    float side = sin(uv.y * 3.14159265);
    transformed.y += arch * uVelocity * 18.0;
    transformed.x += side * uVelocity * 5.0;
    transformed.z += arch * abs(uVelocity) * 8.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

export const galleryFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uVelocity;
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
    float shift = min(abs(uVelocity), 1.0) * 0.0045;
    float direction = sign(uVelocity);
    float red = texture2D(uTexture, uv + vec2(shift * direction, 0.0)).r;
    float green = texture2D(uTexture, uv).g;
    float blue = texture2D(uTexture, uv - vec2(shift * direction, 0.0)).b;
    float alpha = roundedBox(vUv, 0.018);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(red, green, blue, alpha);
  }
`;
