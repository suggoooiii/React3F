uniform float brightness;
uniform float ray_brightness;
uniform float spot_brightness;
uniform float ray_density;
uniform float curvature;
uniform float angle;
uniform float freq;
uniform bool warp;

#define OCTAVES 6

vec2 hash(vec2 x) {
  const vec2 k = vec2(0.3183099, 0.3678794);
  x = x * k + k.yx;
  return -1.0 + 2.0 * fract(64.0 * k * fract(x.x * x.y * (x.x + x.y)));
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)), dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x), mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
}

mat2 rot2d(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

float fbm(vec2 p, float freq) {
  float z = 1.0;
  float rz = 0.0;
  p *= 0.25;
  mat2 mrot = rot2d(angle);
  for (int i = 1; i < OCTAVES; i++) {
    rz += (sin(noise(p) * freq) * 0.5 + 0.5) / (z + time * 0.001);
    z *= 1.75;
    p *= 2.0;
    p *= mrot;
  }
  return rz;
}

void main() {
  float t = time * 0.025;
  vec2 uv = (2.0 * gl_FragCoord.xy - RENDERSIZE) / min(RENDERSIZE.x, RENDERSIZE.y);
  uv *= curvature * 5e-2;
  float r = sqrt(dot(uv, uv));
  float x = dot(normalize(uv), vec2(0.5, 0.0)) + t;
  float y = dot(normalize(uv), vec2(0.0, 0.5)) + t;
  if (warp) {
    float d = ray_density * 0.5;
    x = fbm(vec2(y * d, r + x * d), freq);
    y = fbm(vec2(r + y * d, x * d), freq);
  }
  float val = fbm(vec2(r + y * ray_density, r + x * ray_density - y), freq);
  val = smoothstep(0.0, ray_brightness, val);
  vec3 col = clamp(1.0 - vec3(val), 0.0, 1.0);
  col = mix(col, vec3(1.0), spot_brightness - 10.0 * r / curvature * 200.0 / brightness);
  gl_FragColor = sqrt(vec4(col, 1.0));
}