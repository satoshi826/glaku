import {Core, Program, TextureWithInfo, normalize, scale} from 'glaku'
import {BlurPass} from './blur'
import {random, range} from 'jittoku'
import {arrayToTexture, lerp} from '../../../../src/extension'

export const postEffect = (
  core: Core,
  rawTexture: TextureWithInfo,
  blurPass: BlurPass,
  depthTexture: TextureWithInfo,
  normalTexture: TextureWithInfo
) => {

  const noiseSize = 4
  const noise = new Float32Array(noiseSize * noiseSize * 4)
  for (let i = 0; i < noiseSize * noiseSize; i++) {
    noise[i * 4 + 0] = Math.random() * 2.0 - 1.0
    noise[i * 4 + 1] = Math.random() * 2.0 - 1.0
    noise[i * 4 + 2] = 0.0
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
      u_near   : 'float',
      u_far    : 'float',
      u_pMatrix: 'mat4',
      u_kernel : `vec3[${kernelSize}]`
    },
    texture: {
      t_rawTexture   : rawTexture,
      t_blurTexture0 : blurPass.result0,
      t_blurTexture1 : blurPass.result1,
      t_blurTexture2 : blurPass.result2,
      t_depthTexture : depthTexture,
      t_normalTexture: normalTexture,
      t_noiseTexture : noiseTextureData
    },
    vert: /* glsl */ `
        out vec2 v_uv;
        void main() {
          v_uv  = a_textureCoord;
          gl_Position = vec4(a_position, 1.0);
        }`,
    frag: /* glsl */`
        in vec2 v_uv;
        out vec4 o_color;

        float convertToLinearDepth(float d, float near, float far){
          return (2.0 * near) / (far + near - d * (far - near));
        }

        float viewZToOrthographicDepth(float viewZ) {
          return (viewZ + u_near) / (u_near - u_far);
        }

        float getLinearDepth(vec2 screenPosition) {
          float fragCoordZ = texture(t_depthTexture, screenPosition).x;
          float nz = u_near * fragCoordZ;
          return -nz / (u_far * (fragCoordZ-1.0) - nz);
        }

        float getViewZ(float d) {
          return (u_near*u_far) / ((u_far-u_near)*d-u_far);
        }

        vec3 getViewPosition(vec2 screenPosition, float depth, float viewZ) {
          float clipW = u_pMatrix[2][3] * viewZ + u_pMatrix[3][3];
          vec4 clipPosition = vec4((vec3(screenPosition, depth) - 0.5)*2.0, 1.0);
          clipPosition *= clipW;
          return (u_pMatrix * clipPosition).xyz;
        }

        float computeOcclusion(vec3 viewPosition, vec3 normal) {

          // vec2 noiseScale = vec2(100.0, 100.0);
          // vec3 randomVec = texture(t_noiseTexture, v_uv * noiseScale).xyz;
          // vec3 tangent = normalize(randomVec - normal * dot(randomVec, normal));
          // vec3 biTangent = cross(normal, tangent);
          // mat3 TBN = mat3(tangent, biTangent, normal);

          // float occlusion = 0.0;
          // for (int i = 0; i < ${kernelSize}; ++i) {
          //   vec3 sampleVec = TBN * u_kernel[i];
          //   vec3 samplePoint = viewPosition + (sampleVec * 4.0);
          //   vec4 samplePointNDC = u_pMatrix * vec4(samplePoint, 1.0);
          //   samplePointNDC /= samplePointNDC.w;

          //   vec2 samplePointUv = samplePointNDC.xy * 0.5 + 0.5;
          //   float realDepth = getLinearDepth(samplePointUv);
          //   float sampleDepth = viewZToOrthographicDepth(samplePoint.z)/40.0;
          //   float delta = sampleDepth - realDepth;
          //   if (delta > 0.5) {
          //       occlusion += 1.0;
          //   }
          // }
          // occlusion = clamp(occlusion / float(${kernelSize}), 0.0, 1.0);

          // // return occlusion;

          float realDepth = getLinearDepth(v_uv);
          vec3 samplePoint = viewPosition;
          vec4 samplePointNDC = u_pMatrix * vec4(samplePoint, 1.0);
          float sampleDepth = viewZToOrthographicDepth(samplePoint.z);

          // return realDepth;
          return sampleDepth/60.0;
        }

        void main() {

          vec3 raw = texture(t_rawTexture, v_uv).rgb;
          vec3 blur0 = texture(t_blurTexture0, v_uv).rgb;
          vec3 blur1 = texture(t_blurTexture1, v_uv).rgb;
          vec3 blur2 = texture(t_blurTexture2, v_uv).rgb;
          float depth = texture(t_depthTexture, v_uv).x;
          vec3 normal = texture(t_normalTexture, v_uv).rgb;

          vec3 toneMapRaw = raw / (1.0 + raw);
          float depthLinear = convertToLinearDepth(depth, u_near, u_far);
          vec3 blur = 1.0 * blur0 + 0.5 * blur1 +  0.5 * blur2;

          float viewZ = getViewZ(depth);
          vec3 viewPosition = getViewPosition(v_uv, depth, viewZ);
          float ssao = computeOcclusion(viewPosition, normal);

          vec3 bloom = 0.03 * (blur);
          vec3 toneMapBloom = 5.0 * bloom / (1.0 + bloom);
          vec3 result = 1.0 * (toneMapRaw + toneMapBloom);
          vec3 resultFog = (1.4 - depthLinear) * result +  (3.0 * depthLinear) * toneMapBloom;

          // o_color = vec4(resultFog, 1.0);
          vec2 noiseScale = vec2(1000.0, 1000.0);
          vec3 noiseTexture =  texture(t_noiseTexture, v_uv).xyz;

          o_color = vec4(ssao);
          // o_color = vec4(noiseTexture*10.0,1.0);

        }`
  })

  program.setUniform({u_kernel: kernel})

  return program
}