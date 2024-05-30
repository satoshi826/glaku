import {Core, Program, Renderer} from 'glaku'

export const shade = (core: Core, lightNum: number, preRenderer: Renderer) => new Program(core, {
  id            : 'shade',
  attributeTypes: {
    a_position    : 'vec3',
    a_textureCoord: 'vec2'
  },
  texture: {
    t_positionTexture: preRenderer.renderTexture[0],
    t_normalTexture  : preRenderer.renderTexture[1],
    t_colorTexture   : preRenderer.renderTexture[2]
  },
  uniformTypes: {
    u_lightPosition : `vec3[${lightNum}]`,
    u_cameraPosition: 'vec3'
  },
  vert: /* glsl */ `
        out vec2 v_uv;
        void main() {
          v_uv  = a_textureCoord;
          gl_Position = vec4(a_position, 1.0);
        }`,
  frag: /* glsl */`
        #define MAX_LIGHTS 100

        float rand(vec2 co){
          return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        in vec2 v_uv;
        out vec4 o_color;
        void main() {

          vec3 position = texture(t_positionTexture, v_uv).xyz;
          vec3 normal = texture(t_normalTexture, v_uv).xyz;
          vec3 color = texture(t_colorTexture, v_uv).rgb;

          vec4 w = texture(t_colorTexture, v_uv).xyzw;
          float tmp = step(0.5, fract(20.0 * w.x)) + step(0.5, fract(30.0 * w.y)) + step(0.5, fract(20.0 * w.z));
          float window1 = 1.0 - tmp;
          float window2 = 3.0 * tmp - 6.0;
          float isWindow = step(0.5, window1) + step(0.5, window2);

          int id = int(w.w);

          int tmpx = int(20.0 * w.x);
          int tmpy = int(10.0 * w.y);
          int tmpz = int(20.0 * w.z);
          float isLighted = isWindow * step(0.8, rand(vec2(tmpx + tmpy + tmpz, tmpy + tmpx + tmpz)));

          float window = 0.2 * isWindow + 0.001;

          if (position == vec3(0.0)) {
            discard;
          }

          vec3 viewVec = normalize(u_cameraPosition - position);

          vec3 lightVec;
          float lightDis;
          float lightDecay;
          vec3 reflectVec;

          float diffuse = 0.0;
          float specular = 0.0;

          for(int i = 0; i < ${lightNum}; i++){
            lightVec = normalize(u_lightPosition[i] - position);
            lightDis = distance(u_lightPosition[i], position);
            lightDecay = pow(lightDis, -1.4);

            reflectVec = reflect(-lightVec, normal);
            diffuse += 500.0 * lightDecay * max(0.0, dot(lightVec, normal));
            specular += 400.0 * lightDecay * pow(max(0.0, dot(viewVec, reflectVec)), isWindow * 20.0);
          }
          float ambient = 0.05;
          float result = (ambient + diffuse + 5.0 * isWindow * specular) * 0.25;
          o_color = vec4(result) + isLighted * vec4(0.4, 0.1, 0.0, 1.0);

        }`
})
