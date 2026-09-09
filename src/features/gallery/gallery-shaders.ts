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
    float pointerCore = exp(-pointerDistance * 10.5);
    float pointerRing = sin(pointerDistance * 58.0 - uTime * 8.4)
      * exp(-pointerDistance * 11.5);
    float pointerMembrane = (pointerCore * 0.72 + pointerRing * 0.42) * uPointerStrength;
    transformed.z += pointerMembrane * 18.0;
    transformed.y += pointerMembrane * 3.2 + uPointerVelocity.y * pointerCore * uPointerStrength * 4.5;
    transformed.x += uPointerVelocity.x * pointerCore * uPointerStrength * 5.5;
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
    vec2 pointerDirection = pointerDelta / max(pointerDistance, 0.001);
    float pointerFalloff = exp(-pointerDistance * 10.5);
    float ringA = sin(pointerDistance * 66.0 - uTime * 9.0);
    float ringB = sin(pointerDistance * 42.0 - uTime * 6.2);
    float liquidRipple = (ringA * 0.68 + ringB * 0.32) * pointerFalloff * uPointerStrength;
    uv += pointerDirection * liquidRipple * 0.012;
    uv += uPointerVelocity * pointerFalloff * uPointerStrength * 0.0022;
    float idleRefraction = (
      sin(uv.y * 18.0 + uTime * 0.58 + uPhase) +
      sin(uv.x * 13.0 - uTime * 0.42 + uPhase * 1.4)
    ) * 0.0022;
    uv = clamp(uv + vec2(idleRefraction, idleRefraction * 0.55), 0.001, 0.999);
    float pointerChromatic = pointerFalloff * uPointerStrength * 0.011;
    float shift = 0.0008 + min(abs(uVelocity), 1.0) * 0.005 + pointerChromatic;
    float direction = uVelocity < 0.0 ? -1.0 : 1.0;
    float red = texture2D(uTexture, uv + vec2(shift * direction, 0.0)).r;
    float green = texture2D(uTexture, uv).g;
    float blue = texture2D(uTexture, uv - vec2(shift * direction, 0.0)).b;
    vec3 splitColor = vec3(red, green, blue);
    vec3 gradedColor = mix(splitColor, vec3(1.0), 0.12);
    float pointerGlint = exp(-pointerDistance * pointerDistance * 2200.0) * uPointerStrength;
    float ringHighlight = pow(max(ringA, 0.0), 6.0) * pointerFalloff * uPointerStrength;
    float pointerLight = pointerFalloff * 0.045 * uPointerStrength
      + abs(liquidRipple) * 0.1
      + ringHighlight * 0.52
      + pointerGlint * 0.34;
    gradedColor = mix(gradedColor, vec3(0.97, 1.0, 1.0), clamp(pointerLight, 0.0, 0.48));
    gradedColor += vec3(0.025, 0.075, 0.095) * abs(liquidRipple);
    float alpha = roundedBox(vUv, 0.018);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(gradedColor, alpha * uDistanceAlpha);
  }
`;
