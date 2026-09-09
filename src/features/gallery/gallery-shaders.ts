export const galleryVertexShader = /* glsl */ `
  uniform float uVelocity;
  uniform float uTime;
  uniform float uPhase;
  uniform float uRecession;
  uniform vec2 uPointerViewport;
  uniform vec2 uPointerVelocity;
  uniform float uPointerStrength;
  uniform float uViewportAspect;
  varying vec2 vUv;
  varying vec2 vScreenUv;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    float arch = sin(uv.x * 3.14159265);
    float side = sin(uv.y * 3.14159265);
    float diagonalWave = sin((uv.x * 6.4 + uv.y * 4.1) + uTime * 0.62 + uPhase) * 1.18;
    float edgeLag = sin(uv.x * 9.7 - uv.y * 3.2 - uTime * 0.39 + uPhase * 1.73)
      * mix(0.42, 1.0, abs(uv.x - 0.5) * 2.0);
    float twistWave = sin((uv.x - uv.y) * 5.3 + uTime * 0.31 + uPhase * 0.61) * 0.72;
    float ambientWave = (diagonalWave + edgeLag * 0.74 + twistWave * 0.58) * arch * 3.15;
    float delayedDragWave = sin(uv.x * 5.8 + uv.y * 2.7 + uPhase * 1.31) * uVelocity;
    transformed.y += ambientWave;
    transformed.z += ambientWave * 1.7;
    transformed.y += arch * uVelocity * 12.0 + delayedDragWave * side * 5.0;
    transformed.x += side * uVelocity * 5.0 + delayedDragWave * arch * 2.2;
    transformed.z += arch * abs(uVelocity) * 8.0 + delayedDragWave * 4.2;
    transformed.z += arch * uRecession * 34.0;
    transformed.y += arch * uRecession * 4.0;
    vec4 previewClip = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
    vec2 previewScreen = previewClip.xy / max(previewClip.w, 0.0001) * 0.5 + 0.5;
    vec2 pointerDelta = previewScreen - uPointerViewport;
    pointerDelta.x *= uViewportAspect;
    float pointerDistance = length(pointerDelta);
    float pointerCore = exp(-pointerDistance * 8.5);
    float pointerSpeed = length(uPointerVelocity);
    float pointerImpulse = pointerCore * uPointerStrength * min(1.0, pointerSpeed * 2.4);
    transformed.z += pointerImpulse * 22.0;
    transformed.y += uPointerVelocity.y * pointerImpulse * 12.0;
    transformed.x += uPointerVelocity.x * pointerImpulse * 14.0;
    vec4 clipPosition = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
    vScreenUv = clipPosition.xy / max(clipPosition.w, 0.0001) * 0.5 + 0.5;
    gl_Position = clipPosition;
  }
`;

export const galleryFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uVelocity;
  uniform float uTime;
  uniform float uPhase;
  uniform float uImageAspect;
  uniform float uPlaneAspect;
  uniform float uDistanceAlpha;
  uniform vec2 uPointerViewport;
  uniform vec2 uPointerVelocity;
  uniform float uPointerStrength;
  uniform float uViewportAspect;
  varying vec2 vUv;
  varying vec2 vScreenUv;

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
    vec2 pointerDelta = vScreenUv - uPointerViewport;
    pointerDelta.x *= uViewportAspect;
    float pointerDistance = length(pointerDelta);
    float pointerFalloff = exp(-pointerDistance * 8.5);
    float pointerSpeed = length(uPointerVelocity);
    float pointerImpulse = pointerFalloff * uPointerStrength * min(1.0, pointerSpeed * 2.4);
    vec2 pointerFlow = uPointerVelocity * pointerImpulse;
    uv -= pointerFlow * 0.014;
    float idleRefraction = (
      sin(uv.y * 18.0 + uTime * 0.58 + uPhase) +
      sin(uv.x * 13.0 - uTime * 0.42 + uPhase * 1.4)
    ) * 0.0022;
    uv = clamp(uv + vec2(idleRefraction, idleRefraction * 0.55), 0.001, 0.999);
    float pointerChromatic = pointerImpulse * 0.009;
    float shift = 0.0008 + min(abs(uVelocity), 1.0) * 0.005;
    float direction = uVelocity < 0.0 ? -1.0 : 1.0;
    vec2 pointerDirection = uPointerVelocity / max(pointerSpeed, 0.001);
    vec2 splitOffset = vec2(shift * direction, 0.0) + pointerDirection * pointerChromatic;
    float red = texture2D(uTexture, uv + splitOffset).r;
    float green = texture2D(uTexture, uv).g;
    float blue = texture2D(uTexture, uv - splitOffset).b;
    vec3 splitColor = vec3(red, green, blue);
    vec3 gradedColor = mix(splitColor, vec3(1.0), 0.12);
    float alpha = roundedBox(vUv, 0.018);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(gradedColor, alpha * uDistanceAlpha);
  }
`;
