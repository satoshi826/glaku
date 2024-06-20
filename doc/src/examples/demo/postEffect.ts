import {Core, Program, TextureWithInfo, arrayToTexture, lerp, normalize, scale} from 'glaku'
import {BlurPass} from './blur'
import {random, range} from 'jittoku'

export const postEffect = (
  core: Core,
  rawTexture: TextureWithInfo,
  blurPass: BlurPass,
  depthTexture: TextureWithInfo,
  normalTexture: TextureWithInfo,
  viewPositionTexture: TextureWithInfo
) => {

  const noiseSize = 512
  const noise = new Float32Array(noiseSize * noiseSize * 4)
  for (let i = 0; i < noiseSize * noiseSize; i++) {
    noise[i * 4 + 0] = Math.random() * 2.0 - 1.0
    noise[i * 4 + 1] = Math.random() * 2.0 - 1.0
  }
  const noiseTextureData = arrayToTexture(core, noiseSize, noiseSize, noise)
  console.log(noise)

  const kernelSize = 32
  const kernel = range(kernelSize).flatMap(i => {
    const sample = [random(-1, 1), random(-1, 1), random(0, 1)]
    const normalizedSample = normalize(sample)
    let scale = i / kernelSize
    scale = lerp(0.1, 1, scale * scale)
    normalizedSample[0] *= scale
    normalizedSample[1] *= scale
    normalizedSample[2] *= scale
    return normalizedSample
  })

  const program = new Program(core, {
    id            : 'postEffect',
    attributeTypes: {
      a_position    : 'vec3',
      a_textureCoord: 'vec2'
    },
    uniformTypes: {
      u_near       : 'float',
      u_far        : 'float',
      u_inv_pMatrix: 'mat4',
      u_kernel     : `vec3[${kernelSize}]`
    },
    texture: {
      t_rawTexture         : rawTexture,
      t_blurTexture0       : blurPass.result0,
      t_blurTexture1       : blurPass.result1,
      t_blurTexture2       : blurPass.result2,
      t_depthTexture       : depthTexture,
      t_normalTexture      : normalTexture,
      t_viewPositionTexture: viewPositionTexture,
      t_noiseTexture       : noiseTextureData
    },
    vert: /* glsl */ `
        out vec2 v_uv;
        void main() {
          v_uv  = a_textureCoord;
          gl_Position = vec4(a_position, 1.0);
        }`,
    frag: /* glsl */`
        #define SIN45 0.707107

        in vec2 v_uv;
        out vec4 o_color;

        float convertToLinearDepth(float d, float near, float far){
          return (2.0 * near) / (far + near - d * (far - near));
        }

        vec3 getViewPosition(vec2 uv) {
          return texture(t_viewPositionTexture, uv).xyz;
        }

        vec3 reconstructPosition(vec2 uv, float depth) {
          float x = uv.x * 2. - 1.;   // = x / w
          float y = uv.y * 2. - 1.;   // = y / w
          float z = depth * 2. - 1.;
          vec4 projectedPosition = vec4(x, y, z, 1.);
          vec4 pos = u_inv_pMatrix * projectedPosition;
          return pos.xyz / pos.w;
        }

        float getOcclusion(vec3 origin, vec3 normal, vec2 position, float radius) {
          float attentuationScale = 500.0;
          float bias = 0.0001;
          vec3 occluderPosition = getViewPosition(position);
          vec3 dir = occluderPosition - origin;
          float inRange = smoothstep(0., 1., (radius * attentuationScale) / length(dir));
          float intensity = max(dot(normal, normalize(dir)) - bias, 0.);
          float attenuation = ((radius * attentuationScale) / length(dir)) * inRange;
          return intensity * attenuation;
        }

        void main() {

          vec3 raw = texture(t_rawTexture, v_uv).rgb;
          vec3 blur0 = texture(t_blurTexture0, v_uv).rgb;
          vec3 blur1 = texture(t_blurTexture1, v_uv).rgb;
          vec3 blur2 = texture(t_blurTexture2, v_uv).rgb;
          float depth = texture(t_depthTexture, v_uv).x;
          vec3 normal = texture(t_normalTexture, v_uv).rgb;
          vec3 viewPosition = getViewPosition(v_uv).rgb;

          vec3 toneMapRaw = raw / (1.0 + raw);
          float depthLinear = convertToLinearDepth(depth, u_near, u_far);
          vec3 blur = 1.0 * blur0 + 0.5 * blur1 +  0.5 * blur2;


          float maxKernelRadius = 0.1;
          float outOcclusion = 0.0;

          vec3 position = getViewPosition(v_uv);
          vec2 n1 = normalize(texture(t_noiseTexture, v_uv * 10.0).xy);
          vec2 n2 = abs(normalize(texture(t_noiseTexture, v_uv * 20.).xy)) * 0.7 + 0.3;
          vec2 n3 = abs(normalize(texture(t_noiseTexture, v_uv * 30.).xy)) * 0.7 + 0.3;

          float liu_nearDepth = (-position.z - u_near) / (u_far - u_near);
          float kernelRadius = maxKernelRadius * (1.0 - liu_nearDepth);

          const int KERNEL_SIZE = 4;
          vec2 kernel[KERNEL_SIZE];
          kernel[0] = vec2(1., 0.);
          kernel[1] = vec2(.0, 1.);
          kernel[2] = vec2(-1., 0.);
          kernel[3] = vec2(.0, -1.);

          for(int i=0; i<KERNEL_SIZE; ++i) {
              vec2 p1 = reflect(kernel[i], n1);
              vec2 p2 = vec2(p1.x * SIN45 - p1.y * SIN45, p1.x * SIN45 + p1.y * SIN45);
              p1 *=  0.04;
              p2 *=  0.04;
              outOcclusion += getOcclusion(position, normal, v_uv + p1 * n3.y, kernelRadius);
              outOcclusion += getOcclusion(position, normal, v_uv + p2 * n2.x, kernelRadius);
              outOcclusion += getOcclusion(position, normal, v_uv + p1 * n2.y, kernelRadius);
              outOcclusion += getOcclusion(position, normal, v_uv + p2 * n3.x, kernelRadius);
          }

          vec3 occlusionLight = (outOcclusion/400.0) * vec3(5.0, 1.0, 1.0);

          vec3 bloom = 0.03 * (blur);
          vec3 toneMapBloom = 5.0 * bloom / (1.0 + bloom);
          vec3 result = 0.8 * (toneMapRaw + toneMapBloom) + occlusionLight;
          vec3 resultFog = (1.5 - depthLinear) * result +  (2.0 * depthLinear) * toneMapBloom;
          o_color = vec4(resultFog, 1.0);
          // o_color = vec4(occlusionLight,1.0);

          // o_color = vec4(outOcclusion/100.0);
          // o_color = vec4(getViewPosition(v_uv + reflect(kernel[0], n1) * 0.01 * n2.y), 1.0);
        }`
  })

  program.setUniform({u_kernel: kernel})

  return program
}