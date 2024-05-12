// GrayScott.glsl

precision mediump float;

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uTexture;

const float D_a = 1.0;
const float D_b = 0.5;
const float feed = 0.055;
const float kill = 0.062;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec4 data = texture2D(uTexture, uv);
  float a = data.r;
  float b = data.g;

  vec2 duv = vec2(D_a / uResolution.x, 0.0);
  vec2 dauv = vec2(0.0, D_a / uResolution.y);
  vec2 dbuv = vec2(D_b / uResolution.x, 0.0);
  vec2 dbauv = vec2(0.0, D_b / uResolution.y);

  float laplaceA = texture2D(uTexture, uv + duv).r + texture2D(uTexture, uv - duv).r + texture2D(uTexture, uv + dauv).r + texture2D(uTexture, uv - dauv).r - 4.0 * a;
  float laplaceB = texture2D(uTexture, uv + dbuv).g + texture2D(uTexture, uv - dbuv).g + texture2D(uTexture, uv + dbauv).g + texture2D(uTexture, uv - dbauv).g - 4.0 * b;

  float da_dt = laplaceA - a * b * b + feed * (1.0 - a);
  float db_dt = laplaceB + a * b * b - (kill + feed) * b;

  gl_FragColor = vec4(da_dt, db_dt, 0.0, 1.0);
}