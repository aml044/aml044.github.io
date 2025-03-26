async function init() {
    // Create a canvas tag
    const canvasTag = document.createElement('canvas');
    canvasTag.id = "renderCanvas"; // Important! This tells which CSS style to use
    document.body.appendChild(canvasTag);

    // Modify the canvas size
    const devicePixelRatio = window.devicePixelRatio || 1;
    const width = window.innerWidth * devicePixelRatio;
    const height = window.innerHeight * devicePixelRatio;
    canvasTag.width = width;
    canvasTag.height = height; 
    // Modify the canvas using CSS
    canvasTag.style.width = `${window.innerWidth}px`;
    canvasTag.style.height = `${window.innerHeight}px`;

    // Check if the browser supports WebGPU
    if (!navigator.gpu) {
      throw Error("WebGPU is not supported in this browser.");
    }
    // Get an GPU adapter
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw Error("Couldn't request WebGPU adapter.");
    }
    // Get a GPU device
    const device = await adapter.requestDevice();
    // Get canvas context using webgpu
    const context = canvasTag.getContext("webgpu");
    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
      device: device,
      format: canvasFormat,
    });
    // Create a gpu command encoder
    const encoder = device.createCommandEncoder();
    // Use the encoder to begin render pass
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        clearValue: { r: 0, g: 56/255, b: 101/255, a: 1 }, // Bucknell Blue
        loadOp: "clear",
        storeOp: "store",
     }]
    });
    // Vertex shader code
    var vertCode = `
    @vertex // this compute the scene coordinate of each input vertex
    fn vertexMain(@location(0) pos: vec2f) -> @builtin(position) vec4f {
    return vec4f(pos, 0, 1); // (pos, Z, W) = (X, Y, Z, W)
    } 
    `;

    // Fragment shader code
    var fragCode = `
    @fragment // this compute the color of each pixel
    fn fragmentMain() -> @location(0) vec4f {
    return vec4f(238.f/255, 118.f/255, 35.f/255, 1); // (R, G, B, A)
    }
    `;

    var fragCodeRed = `
    @fragment
    fn fragmentMain() -> @location(0) vec4f {
        return vec4f(1.0, 0.0, 0.0, 1.0); // Red
    }
    `;

    var fragCodeBlue = `
    @fragment
    fn fragmentMain() -> @location(0) vec4f {
        return vec4f(0.0, 0.0, 1.0, 1.0); // Blue
    }
    `;

    // Create shader module
    var shaderModule = device.createShaderModule({
      label: "Shader",
      code: vertCode + '\n' + fragCode,
    });

    var shaderModuleRed = device.createShaderModule({
      label: "Red Shader",
      code: vertCode + '\n' + fragCodeRed,
    });
  
    var shaderModuleBlue = device.createShaderModule({
      label: "Blue Shader",
      code: vertCode + '\n' + fragCodeBlue,
    });

        // Add fish shape vertices
    var fishVertices = new Float32Array([
      // Body upper half (triangle)
      0, 0.5,
      -0.5, .1,
      0.5, 0.1,

      // Body lower half
      0, -0.25,
      -0.5, 0.1,
      0.5, 0.1,

      // Tail (triangle)
      -0.5, 0.1,
      -0.7, 0.2,
      -0.7, 0,

    ]);

    // Update the vertex buffer to include fishVertices
    var vertices = new Float32Array([
      // Original triangle
      //0, 0.5,
      //-0.5, 0,
      //0.5, 0,

      // Fish shape vertices
      ...fishVertices,
    ]);

    // Create vertex buffer to store the vertices in GPU
    var vertexBuffer = device.createBuffer({
      label: "Vertices",
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    // Copy from CPU to GPU
    device.queue.writeBuffer(vertexBuffer, 0, vertices);

    // Defne vertex buffer layout - how the shader should read the buffer
    var vertexBufferLayout = {
      arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
      attributes: [{
        format: "float32x2", // 32 bits, each has two coordiantes
        offset: 0,
        shaderLocation: 0, // position in the vertex shader
      }],
    };

    // Use the module to create a render pipeline
    var renderPipeline = device.createRenderPipeline({
      label: "Render Pipeline",
      layout: "auto", // we will talk about layout later
      vertex: {
        module: shaderModule,         // the shader module
        entryPoint: "vertexMain",     // where the vertex shader starts
        buffers: [vertexBufferLayout] // the buffer layout - more about it soon
      },
      fragment: {
        module: shaderModule,         // the shader module
        entryPoint: "fragmentMain",   // where the fragment shader starts
        targets: [{
          format: canvasFormat        // the target canvas format (the output)
        }]
      }
    });

    var renderPipelineRed = device.createRenderPipeline({
      vertex: {
          module: shaderModuleRed,
          entryPoint: "vertexMain",
          buffers: [vertexBufferLayout],
      },
      fragment: {
          module: shaderModuleRed,
          entryPoint: "fragmentMain",
          targets: [{ format: canvasFormat }],
      },
    });
  
  var renderPipelineBlue = device.createRenderPipeline({
      vertex: {
          module: shaderModuleBlue,
          entryPoint: "vertexMain",
          buffers: [vertexBufferLayout],
      },
      fragment: {
          module: shaderModuleBlue,
          entryPoint: "fragmentMain",
          targets: [{ format: canvasFormat }],
      },
    });

    

    // add more render pass to draw the plane
    pass.setPipeline(renderPipeline);      // which render pipeline to use
    pass.setVertexBuffer(0, vertexBuffer); // which vertex buffer is used at location 0
    pass.draw(vertices.length / 2);        // how many vertices to draw

        // Render red shape
    pass.setPipeline(renderPipelineRed);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.draw(verticesRed.length / 2);

    // Render blue shape
    pass.setPipeline(renderPipelineBlue);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.draw(verticesBlue.length / 2);
    
    pass.end(); // end the pass
    // Create the command buffer
    const commandBuffer = encoder.finish();
    // Submit to the device to render
    device.queue.submit([commandBuffer]);
   
    return context;

  }
   
  init().then( ret => {
    console.log(ret);
  }).catch( error => {
    // error handling - add a p tag to display the error message
    const pTag = document.createElement('p');
    pTag.innerHTML = navigator.userAgent + "</br>" + error.message;
    document.body.appendChild(pTag);
    // also remove the created canvas tag
    document.getElementById("renderCanvas").remove();
  });