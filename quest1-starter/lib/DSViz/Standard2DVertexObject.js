/*!
 * Copyright (c) 2025 SingChun LEE @ Bucknell University. CC BY-NC 4.0.
 * 
 * This code is provided mainly for educational purposes at Bucknell University.
 *
 * This code is licensed under the Creative Commons Attribution-NonCommerical 4.0
 * International License. To view a copy of the license, visit 
 *   https://creativecommons.org/licenses/by-nc/4.0/
 * or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
 *
 * You are free to:
 *  - Share: copy and redistribute the material in any medium or format.
 *  - Adapt: remix, transform, and build upon the material.
 *
 * Under the following terms:
 *  - Attribution: You must give appropriate credit, provide a link to the license,
 *                 and indicate if changes where made.
 *  - NonCommerical: You may not use the material for commerical purposes.
 *  - No additional restrictions: You may not apply legal terms or technological 
 *                                measures that legally restrict others from doing
 *                                anything the license permits.
 */

import SceneObject from "/lib/DSViz/SceneObject.js"

export default class Standard2DVertexObject extends SceneObject {
  constructor(device, canvasFormat, vertices, vertexShader, fragmentShader) {
    super(device, canvasFormat);
    // This assume each vertex has (x, y)
    this._vertices = vertices;
    this._selectedVertexShader = vertexShader;
    this._selectedFragmentShader = fragmentShader;
  }

  
  async createGeometry() {
    // Create vertex buffer to store the vertices in GPU
    this._vertexBuffer = this._device.createBuffer({
      label: "Vertices " + this.getName(),
      size: this._vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    // Copy from CPU to GPU
    this._device.queue.writeBuffer(this._vertexBuffer, 0, this._vertices);
    // Defne vertex buffer layout - how the GPU should read the buffer
    this._vertexBufferLayout = {
      arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
      attributes: [{ 
        // position 0 has two floats
        shaderLocation: 0,   // position in the vertex shader
        format: "float32x2", // two coordiantes
        offset: 0,           // no offset in the vertex buffer
      }],
    };
  }

  async createShaders() {
    this._shaderModules = {}; // Object to store multiple shaders
  
    // Define a mapping of shader names 
    const shaderDefinitions = {
      'vertexMain': `
        @vertex
        fn vertexMain(@location(0) pos: vec2f) -> @builtin(position) vec4f {
          return vec4f(pos, 0, 1); // (pos, Z, W) = (X, Y, Z, W)
        }
      `,
      'fragShaderOrange': `
        @fragment
        fn fragShaderOrange() -> @location(0) vec4f {
          return vec4f(255.0 / 255.0, 135.0 / 255.0, 0.0 / 255.0, 1.0); // (R, G, B, A)
        }
      `,
      'fragShaderRed': `
        @fragment
        fn fragShaderRed() -> @location(0) vec4f {
          return vec4f(1.0, 0.0, 0.0, 1.0); // Red color
        }
      `,
      'fragShaderBlue': `
        @fragment
        fn fragShaderBlue() -> @location(0) vec4f {
          return vec4f(0.0, 0.0, 1.0, 1.0); // Blue color
        }
      `,

      'fragShaderWhite': `
        @fragment
        fn fragShaderWhite() -> @location(0) vec4f {
          return vec4f(255.0, 255.0, 255.0, 1.0); // White color
        }
      `,

      'fragShaderBlack': `
        @fragment
        fn fragShaderBlack() -> @location(0) vec4f {
          return vec4f(0.0, 0.0, 0.0, 1.0); // Black color
        }
      `,

      'fragShaderBrown': `
      @fragment
      fn fragShaderBrown() -> @location(0) vec4f {
        return vec4f(101.0/255.0, 67.0/255.0, 33.0/255.0, 1.0); // Black color
      }
    `,

     'fragShaderYellow': `
      @fragment
      fn fragShaderYellow() -> @location(0) vec4f {
        return vec4f(255.0/255.0, 255.0/255.0, 0.0/255.0, 1.0); // Black color
      }
    `,
  
    };
  
    // Iterate over shaderDefinitions and create each shader
    for (const [shaderName, shaderCode] of Object.entries(shaderDefinitions)) {
      this._shaderModules[shaderName] = this._device.createShaderModule({
        label: `Shader: ${shaderName}`,
        code: shaderCode,
      });
    }
    console.log(this._shaderModules);
    console.log(this._selectedVertexShader);
    console.log(this._shaderModules[this._selectedVertexShader]);
  }
  
  async createRenderPipeline() {
    this._renderPipeline = this._device.createRenderPipeline({
      label: "Render Pipeline " + this.getName(),
      layout: "auto",
      vertex: {
        module: this._shaderModules[this._selectedVertexShader],         // the shader code
        entryPoint: this._selectedVertexShader,           // the shader function
        buffers: [this._vertexBufferLayout] // the binded buffer layout
      },
      fragment: {
        module: this._shaderModules[this._selectedFragmentShader],    // the shader code
        entryPoint: this._selectedFragmentShader,    // the shader function
        targets: [{
          format: this._canvasFormat   // the target canvas format
        }]
      },
    }); 
  }
  
  render(pass) {
    // add to render pass to draw the object
    pass.setPipeline(this._renderPipeline);      // which render pipeline to use
    pass.setVertexBuffer(0, this._vertexBuffer); // how the buffer are binded
    pass.draw(this._vertices.length / 2);        // number of vertices to draw
  }
  
  async createComputePipeline() {}
  
  compute(pass) {}
}