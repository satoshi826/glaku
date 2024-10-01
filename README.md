# Glaku
Glaku aims to unlock the power of pure WebGL with simple code.

- Simple API: By eliminating the complexity of the WebGL API, you can harness the power of shader coding with minimal code. With only four main classes, the learning curve is low, allowing you to focus on implementing your application.
- WebGL2 Powered: Built on WebGL2, Glaku offers powerful features like GLSL ES 3.0, instancing, Floating Point Textures, and MRT (Multiple Render Targets) as standard.
- Zero Dependencies: The build size is only about 10KB after gzip, with no external dependencies, keeping your application compact.
- Fully Typed: Glaku is developed entirely in TypeScript, providing strong typing support.

## Document and Examples
[here](https://glaku.vercel.app)

## Install

```
npm i glaku
```

## Usage

```ts
import { Core, Vao, Program, Renderer, Loop } from "glaku";

export const main = (canvas: HTMLCanvasElement) => {
  const core = new Core({ canvas });

  const vao = new Vao(core, {
    attributes: { a_position: [0, 1, 1, -1, -1, -1] },
  });

  const program = new Program(core, {
    attributeTypes: { a_position: "vec2" },
    uniformTypes: { u_time: "float" },
    vert: /* glsl */ `
          void main() {
            gl_Position = vec4(a_position, 1.0, 1.0);
          }`,
    frag: /* glsl */ `
          out vec4 o_color;
          void main() {
            o_color = vec4(0.0, 0.0, 0.5 * (1.0 + sin(u_time * 0.005)), 1.0);
          }`,
  });

  const renderer = new Renderer(core);

  const loop = new Loop({
    callback: ({ elapsed }) => {
      program.setUniform({ u_time: elapsed });
      renderer.render(vao, program);
    },
  });
  loop.start();
};

```