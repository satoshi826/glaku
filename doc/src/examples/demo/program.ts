import {Core, Program, GPGPU} from 'glaku'

export const getProgram = (core: Core, gpgpu: GPGPU) => new Program(core, {
  id            : 'renderer',
  primitive     : 'POINTS',
  attributeTypes: gpgpu.attributeTypes,
  vert          : /* glsl */`
  out float mass;
  out float vel;
  void main() {
    mass = a_mass;
    vel = length(a_vel);
    gl_Position = vec4(a_pos, 1.0);
    gl_PointSize = max(2.*smoothstep(-2., 2., a_pos.z),1.);
  }`,
  frag: /* glsl */`
  vec3 hsl2rgb( in vec3 c ){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
  }
  out vec4 fragColor;
  in float mass;
  in float vel;
  void main() {
    float h = 1.-mass/50000.;
    float s = 1.;
    float l = 1.-smoothstep(0.2, 1., 40.*vel+.5);
    vec3 rainbow = hsl2rgb(vec3(h,s,l));
    fragColor = vec4(rainbow,1.);
  }`
})