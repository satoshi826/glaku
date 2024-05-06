import {random, range} from 'jittoku'
import {GPGPU} from '../../../../src/extension/GPGPU'
import {Core} from '../../../../src'

const PARTICLE_NUM = 500000
const PARTICLE_RANGE = range(PARTICLE_NUM)

export const getGpgpu = (core: Core) => new GPGPU(core, {
  id            : 'particle',
  attributeTypes: {
    a_pos : 'vec3',
    a_vel : 'vec3',
    a_mass: 'float'
  },
  attributes: {
    a_pos : PARTICLE_RANGE.flatMap(() => [random(-.5, .5), random(-.5, .5), random(-.5, .5)]),
    a_vel : PARTICLE_RANGE.flatMap(() => [random(-.00001, .00001), random(-.00001, .00001), random(-.00001, .00001)]),
    a_mass: PARTICLE_RANGE.flatMap(() => random(5000, 50000))
  },
  uniformTypes: {
    u_origin     : 'vec2',
    u_aspectRatio: 'vec2',
    u_delta      : 'float',
    u_unix       : 'float'
  },
  vert: /* glsl */ `
    void main() {
    a_tf_pos = a_pos + (a_vel * u_delta);
    vec2 diff = (u_origin-a_pos.xy)*u_aspectRatio;
    float len = length(diff);
    vec3 acc  = (vec3(normalize(diff), 0.02*sin(u_unix/10.))) * (len > .2 ? 1. : 0.);
    a_tf_vel = (a_vel + (acc * u_delta * .1 / a_mass));
    a_tf_vel = a_tf_vel*.99;
    a_tf_mass = a_mass;
  }`
}
)