class Renderer{constructor(canvas){this._canvas=canvas;this._objects=[];this._clearColor={r:0,g:56/255,b:101/255,a:1};}
async init(){if(!navigator.gpu){throw Error("WebGPU is not supported in this browser.");}
const adapter=await navigator.gpu.requestAdapter();if(!adapter){throw Error("Couldn't request WebGPU adapter.");}
this._device=await adapter.requestDevice();this._context=this._canvas.getContext("webgpu");this._canvasFormat=navigator.gpu.getPreferredCanvasFormat();this._context.configure({device:this._device,format:this._canvasFormat,});this.resizeCanvas();window.addEventListener('resize',this.resizeCanvas.bind(this));}
resizeCanvas(){const devicePixelRatio=window.devicePixelRatio||1;const width=window.innerWidth*devicePixelRatio;const height=window.innerHeight*devicePixelRatio;this._canvas.width=width;this._canvas.height=height;this._canvas.style.width=`${window.innerWidth}px`;this._canvas.style.height=`${window.innerHeight}px`;this._canvas.style.transformOrigin="center";this.render();}
async appendSceneObject(obj){await obj.init();this._objects.push(obj);}
renderToSelectedView(outputView){for(const obj of this._objects){obj?.updateGeometry();}
let encoder=this._device.createCommandEncoder();const pass=encoder.beginRenderPass({colorAttachments:[{view:outputView,clearValue:this._clearColor,loadOp:"clear",storeOp:"store",}]});for(const obj of this._objects){obj?.render(pass);}
pass.end();const computePass=encoder.beginComputePass();for(const obj of this._objects){obj?.compute(computePass);}
computePass.end();const commandBuffer=encoder.finish();this._device.queue.submit([commandBuffer]);}
render(){this.renderToSelectedView(this._context.getCurrentTexture().createView());}}
class SceneObject{static _objectCnt=0;constructor(device,canvasFormat){if(this.constructor==SceneObject){throw new Error("Abstract classes can't be instantiated.");}
this._device=device;this._canvasFormat=canvasFormat;SceneObject._objectCnt+=1;}
getName(){return this.constructor.name+" "+SceneObject._objectCnt.toString();}
async init(){await this.createGeometry();await this.createShaders();await this.createRenderPipeline();await this.createComputePipeline();}
async createGeometry(){throw new Error("Method 'createGeometry()' must be implemented.");}
updateGeometry(){}
loadShader(filename){console.log(filename);return new Promise((resolve,reject)=>{const xhttp=new XMLHttpRequest();xhttp.open("GET",filename);xhttp.setRequestHeader("Cache-Control","no-cache, no-store, max-age=0");xhttp.onload=function(){if(xhttp.readyState===XMLHttpRequest.DONE&&xhttp.status===200){console.log(xhttp.responseText);resolve(xhttp.responseText);}
else{reject({status:xhttp.status,statusText:xhttp.statusText});}};xhttp.onerror=function(){reject({status:xhttp.status,statusText:xhttp.statusText});};xhttp.send();});}
async createShaders(){throw new Error("Method 'createShaders()' must be implemented.");}
async createRenderPipeline(){throw new Error("Method 'createRenderPipeline()' must be implemented.");}
render(pass){throw new Error("Method 'render(pass)' must be implemented.");}
async createComputePipeline(){throw new Error("Method 'createComputePipeline()' must be implemented.");}
compute(pass){throw new Error("Method 'compute(pass)' must be implemented.");}}
class Standard2DVertexObject extends SceneObject{constructor(device,canvasFormat,vertices,vertexShader,fragmentShader){super(device,canvasFormat);this._vertices=vertices;this._selectedVertexShader=vertexShader;this._selectedFragmentShader=fragmentShader;}
async createGeometry(){this._vertexBuffer=this._device.createBuffer({label:"Vertices "+this.getName(),size:this._vertices.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST,});this._device.queue.writeBuffer(this._vertexBuffer,0,this._vertices);this._vertexBufferLayout={arrayStride:2*Float32Array.BYTES_PER_ELEMENT,attributes:[{shaderLocation:0,format:"float32x2",offset:0,}],};}
async createShaders(){this._shaderModules={};const shaderDefinitions={'vertexMain':`
        @vertex
        fn vertexMain(@location(0) pos: vec2f) -> @builtin(position) vec4f {
          return vec4f(pos, 0, 1); // (pos, Z, W) = (X, Y, Z, W)
        }
      `,'fragShaderOrange':`
        @fragment
        fn fragShaderOrange() -> @location(0) vec4f {
          return vec4f(255.0 / 255.0, 135.0 / 255.0, 0.0 / 255.0, 1.0); // (R, G, B, A)
        }
      `,'fragShaderRed':`
        @fragment
        fn fragShaderRed() -> @location(0) vec4f {
          return vec4f(1.0, 0.0, 0.0, 1.0); // Red color
        }
      `,'fragShaderBlue':`
        @fragment
        fn fragShaderBlue() -> @location(0) vec4f {
          return vec4f(0.0, 0.0, 1.0, 1.0); // Blue color
        }
      `,'fragShaderWhite':`
        @fragment
        fn fragShaderWhite() -> @location(0) vec4f {
          return vec4f(255.0, 255.0, 255.0, 1.0); // White color
        }
      `,'fragShaderBlack':`
        @fragment
        fn fragShaderBlack() -> @location(0) vec4f {
          return vec4f(0.0, 0.0, 0.0, 1.0); // Black color
        }
      `,'fragShaderBrown':`
      @fragment
      fn fragShaderBrown() -> @location(0) vec4f {
        return vec4f(101.0/255.0, 67.0/255.0, 33.0/255.0, 1.0); // Black color
      }
    `,'fragShaderYellow':`
      @fragment
      fn fragShaderYellow() -> @location(0) vec4f {
        return vec4f(255.0/255.0, 255.0/255.0, 0.0/255.0, 1.0); // Black color
      }
    `,};for(const[shaderName,shaderCode]of Object.entries(shaderDefinitions)){this._shaderModules[shaderName]=this._device.createShaderModule({label:`Shader: ${shaderName}`,code:shaderCode,});}
console.log(this._shaderModules);console.log(this._selectedVertexShader);console.log(this._shaderModules[this._selectedVertexShader]);}
async createRenderPipeline(){this._renderPipeline=this._device.createRenderPipeline({label:"Render Pipeline "+this.getName(),layout:"auto",vertex:{module:this._shaderModules[this._selectedVertexShader],entryPoint:this._selectedVertexShader,buffers:[this._vertexBufferLayout]},fragment:{module:this._shaderModules[this._selectedFragmentShader],entryPoint:this._selectedFragmentShader,targets:[{format:this._canvasFormat}]},});}
render(pass){pass.setPipeline(this._renderPipeline);pass.setVertexBuffer(0,this._vertexBuffer);pass.draw(this._vertices.length/2);}
async createComputePipeline(){}
compute(pass){}}
async function init(){const canvasTag=document.createElement('canvas');canvasTag.id="renderCanvas";document.body.appendChild(canvasTag);const renderer=new Renderer(canvasTag);await renderer.init();console.log("HERE 1");var verticesTail=new Float32Array([-0.5,0.1,-0.7,0.2,-0.7,0,]);await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device,renderer._canvasFormat,verticesTail,'vertexMain','fragShaderOrange'));var verticesBodyLower=new Float32Array([-0.5,0.1,0.0,-0.2,0.5,0.1,]);await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device,renderer._canvasFormat,verticesBodyLower,'vertexMain','fragShaderOrange'));var verticesBodyUpper=new Float32Array([-0.5,0.1,0.0,0.35,0.5,0.1,]);await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device,renderer._canvasFormat,verticesBodyUpper,'vertexMain','fragShaderOrange'));var verticesStripe1Shape1=new Float32Array([-0.25,0.23,-.05,0.33,0.0,0.0,]);await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device,renderer._canvasFormat,verticesStripe1Shape1,'vertexMain','fragShaderWhite'));var verticesStripe1Shape2=new Float32Array([-0.17,0.0,-0.16,0.15,0.0,0.0,]);await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device,renderer._canvasFormat,verticesStripe1Shape2,'vertexMain','fragShaderWhite'));var verticesStripe1Shape3=new Float32Array([-0.15,-0.112,-0.22,0.0,0.0,0.0,]);await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device,renderer._canvasFormat,verticesStripe1Shape3,'vertexMain','fragShaderWhite'));var verticesStripe1Shape4=new Float32Array([-.06,-0.163,0.0,0.0,-0.15,-0.112,]);await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device,renderer._canvasFormat,verticesStripe1Shape4,'vertexMain','fragShaderWhite'));var verticesStripe2Shape1=new Float32Array([0.25,0.23,.05,0.33,0.10,0.0,]);await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device,renderer._canvasFormat,verticesStripe2Shape1,'vertexMain','fragShaderWhite'));var verticesStripe2Shape2=new Float32Array([0.10,0.0,0.21,0.17,0.2,-.083,]);await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device,renderer._canvasFormat,verticesStripe2Shape2,'vertexMain','fragShaderWhite'));var verticesStripe2Shape3=new Float32Array([0.2,-.083,0.10,0.0,0.08,-.153,]);await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device,renderer._canvasFormat,verticesStripe2Shape3,'vertexMain','fragShaderWhite'));const eyeSegments=30;const eyeRadius=0.025;const eyeCenterX=0.3;const eyeCenterY=0.15;const verticesEye=[];for(let i=0;i<eyeSegments;i++){const angle1=(i/eyeSegments)*2*Math.PI;const angle2=((i+1)/eyeSegments)*2*Math.PI;verticesEye.push(eyeCenterX,eyeCenterY);verticesEye.push(eyeCenterX+eyeRadius*Math.cos(angle1),eyeCenterY+eyeRadius*Math.sin(angle1));verticesEye.push(eyeCenterX+eyeRadius*Math.cos(angle2),eyeCenterY+eyeRadius*Math.sin(angle2));}
await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device,renderer._canvasFormat,new Float32Array(verticesEye),'vertexMain','fragShaderBlack'));const verticesChest=new Float32Array([-0.5,-1,-0.5,-0.4,0.1,-1,0.1,-1,-0.5,-0.4,0.1,-0.4]);await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device,renderer._canvasFormat,verticesChest,'vertexMain','fragShaderBrown'));const verticesChestWrap=new Float32Array([-0.5,-0.65,-0.5,-0.55,0.1,-0.65,0.1,-0.55,-0.5,-0.65,0.1,-0.65]);await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device,renderer._canvasFormat,verticesChestWrap,'vertexMain','fragShaderYellow'));const keySegments=30;const keyRadius=0.025;const keyCenterX=-0.2;const keyCenterY=-.7;const verticesKey=[];for(let i=0;i<keySegments;i++){const angle1=(i/keySegments)*2*Math.PI;const angle2=((i+1)/keySegments)*2*Math.PI;verticesKey.push(keyCenterX,keyCenterY);verticesKey.push(keyCenterX+keyRadius*Math.cos(angle1),keyCenterY+keyRadius*Math.sin(angle1));verticesKey.push(keyCenterX+keyRadius*Math.cos(angle2),keyCenterY+keyRadius*Math.sin(angle2));}
await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device,renderer._canvasFormat,new Float32Array(verticesKey),'vertexMain','fragShaderBlack'));var verticesKeyTriangle=new Float32Array([-.2,-.7,-.23,-.82,-0.17,-.82,]);await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device,renderer._canvasFormat,verticesKeyTriangle,'vertexMain','fragShaderBlack'));var verticesStarShape1=new Float32Array([0.75,0.7,.65,0.55,0.85,0.55]);await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device,renderer._canvasFormat,verticesStarShape1,'vertexMain','fragShaderYellow'));var verticesStarShape2=new Float32Array([0.75,0.5,.65,0.65,0.85,0.65]);await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device,renderer._canvasFormat,verticesStarShape2,'vertexMain','fragShaderYellow'));var verticesStar2Shape1=new Float32Array([-0.75,0.7,-.65,0.55,-0.85,0.55]);await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device,renderer._canvasFormat,verticesStar2Shape1,'vertexMain','fragShaderYellow'));var verticesStar2Shape2=new Float32Array([-0.75,0.5,-.65,0.65,-0.85,0.65]);await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device,renderer._canvasFormat,verticesStar2Shape2,'vertexMain','fragShaderYellow'));renderer.render();return renderer;}
init().then(ret=>{console.log(ret);}).catch(error=>{const pTag=document.createElement('p');pTag.innerHTML=navigator.userAgent+"</br>"+error.message;document.body.appendChild(pTag);document.getElementById("renderCanvas").remove();});