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
loadShader(filename){return new Promise((resolve,reject)=>{const xhttp=new XMLHttpRequest();xhttp.open("GET",filename);xhttp.setRequestHeader("Cache-Control","no-cache, no-store, max-age=0");xhttp.onload=function(){if(xhttp.readyState===XMLHttpRequest.DONE&&xhttp.status===200){resolve(xhttp.responseText);}
else{reject({status:xhttp.status,statusText:xhttp.statusText});}};xhttp.onerror=function(){reject({status:xhttp.status,statusText:xhttp.statusText});};xhttp.send();});}
async createShaders(){throw new Error("Method 'createShaders()' must be implemented.");}
async createRenderPipeline(){throw new Error("Method 'createRenderPipeline()' must be implemented.");}
render(pass){throw new Error("Method 'render(pass)' must be implemented.");}
async createComputePipeline(){throw new Error("Method 'createComputePipeline()' must be implemented.");}
compute(pass){throw new Error("Method 'compute(pass)' must be implemented.");}}
class PolygonIO{constructor(){}
static readBinary(filename){return new Promise((resolve,reject)=>{const xhttp=new XMLHttpRequest();xhttp.open("GET",filename);xhttp.setRequestHeader("Cache-Control","no-cache, no-store, max-age=0");xhttp.responseType='arraybuffer';xhttp.onload=function(){if(xhttp.readyState===XMLHttpRequest.DONE&&xhttp.status===200){resolve(xhttp.response);}
else{reject(new Error('Error loading Polygon file: '+xhttp.status));}}
xhttp.onerror=function(){reject(new Error('Network error loading Polygon file'));}
xhttp.send();});}
static async read(filename){let binarydata=await PolygonIO.readBinary(filename);let text=new TextDecoder().decode(binarydata);const polygon=[];const lines=text.split('\n');const headers=lines[0].trim().split(',');for(let i=1;i<lines.length;++i){const line=lines[i].trim();if(line!=='')polygon.push(line.split(',').map(parseFloat));}
return polygon;}
static async write(polygon,filename){var data='';if(polygon[0].length==2)data='# x, y\n';else data='# x, y, z\n';for(let i=0;i<polygon.length;++i){data+=polygon[i].join(",")+'\n';}
const blob=new Blob([data],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='download.polygon';a.click();URL.revokeObjectURL(a.href);}}
class PGA2D{static geometricProduct(a,b){return[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0],a[0]*b[2]+a[1]*b[3]+a[2]*b[0]-a[3]*b[1],a[0]*b[3]-a[1]*b[2]+a[2]*b[1]+a[3]*b[0]];}
static reverse(a){return[a[0],-a[1],-a[2],-a[3]];}
static applyMotor(p,m){return PGA2D.geometricProduct(m,PGA2D.geometricProduct(p,PGA2D.reverse(m)));}
static motorNorm(m){return Math.sqrt(m[0]*m[0]+m[1]*m[1]+m[2]*m[2]+m[3]*m[3]);}
static createTranslator(dx,dy){return[1,0,-dx/2,-dy/2]}
static createRotor(angle,cx=0,cy=0){let p=PGA2D.createPoint(cx,cy);return[Math.cos(angle/2),Math.sin(angle/2)*p[1],Math.sin(angle/2)*p[2],Math.sin(angle/2)*p[3]];}
static createPoint(x,y){return[0,1,y,-x];}
static extractPoint(p){return[-p[3]/p[1],p[2]/p[1]];}
static normaliozeMotor(m){let mnorm=PGA2D.motorNorm(m);if(mnorm==0.0){return[1,0,0,0];}
return[m[0]/mnorm,m[1]/mnorm,m[2]/mnorm,m[3]/mnorm];}
static applyMotorToPoint(p,m){let new_p=PGA2D.applyMotor(PGA2D.createPoint(p[0],p[1]),m);return PGA2D.extractPoint(new_p);};static isInside(v0,v1,p){const edge=PGA2D.createPoint(v1[0]-v0[0],v1[1]-v0[1]);const point=PGA2D.createPoint(p[0]-v0[0],p[1]-v0[1]);return(v1[0]-v0[0])*(p[1]-v0[1])-(v1[1]-v0[1])*(p[0]-v0[0])>0;}}
class Polygon{constructor(filename){this._filename=filename;}
centerOfMass(){let C=Array(this._dim).fill(0);for(let i=0;i<this._numV-1;++i){for(let j=0;j<this._dim;++j){C[j]+=this._polygon[i][j];}}
for(let i=0;i<this._dim;++i){C[i]/=this._numV;}
return C;}
surfaceArea(){const l=(a,b)=>Math.sqrt(Math.pow(b[0]-a[0],2)+Math.pow(b[1]-a[1],2)+Math.pow(b[2]-a[2],2));const area=(e0,e1,e2,s)=>Math.sqrt(s*(s-e0)*(s-e1)*(s-e2));let A=0;var v0=[...this.centerOfMass()];if(v0.length==2)v0.push(0);for(let i=0;i<this._polygon.length-1;++i){var v1=[...this._polygon[i]];if(v1.length==2)v1.push(0);var v2=[...this._polygon[i+1]];if(v2.length==2)v2.push(0);const e01=l(v0,v1);const e12=l(v1,v2);const e20=l(v2,v0);const s=(e01+e12+e20)/2;A+=area(e01,e12,e20,s);}
return A;}
normalizePolygon(){this._center=this.centerOfMass();for(let i=0;i<this._polygon.length;++i){for(let j=0;j<this._dim;++j){this._polygon[i][j]-=this._center[j];}}
this._area=this.surfaceArea();const targetArea=1;this._scaleFactor=Math.sqrt(1/this._area*targetArea);for(let i=0;i<this._polygon.length;++i){for(let j=0;j<this._dim;++j){this._polygon[i][j]*=this._scaleFactor;}}
if(Math.abs(this.surfaceArea()-targetArea)>0.0001){console.log("Something is wrong! The surface area is not as expected!");}}
refinePolygon(){var polygon=[];for(let i=0;i<this._polygon.length-1;++i){var v1=[...this._polygon[i]];var v2=[...this._polygon[i+1]];polygon.push(v1);let mid=Array(this._dim).fill(0);for(let j=0;j<this._dim;++j){mid[j]=(v1[j]+v2[j])/2;}
polygon.push(mid);}
polygon.push(this._polygon[0]);this._polygon=polygon;this._numV=this._polygon.length;this.normalizePolygon();}
reversePolygon(){var polygon=[];for(let i=this._polygon.length-1;i>=0;--i){polygon.push(this._polygon[i]);}
this._polygon=polygon;this._numV=this._polygon.length;this.normalizePolygon();}
isInside(v0,v1,p){if(this._polygon[0].length!=2)throw new Error("this formula works only for 2D Polygons.");return PGA2D.isInside(v0,v1,p);}
async init(){this._polygon=await PolygonIO.read(this._filename);this._numV=this._polygon.length;this._dim=this._polygon[0].length;this.normalizePolygon();}}
class PolygonObject extends SceneObject{constructor(device,canvasFormat,filename){super(device,canvasFormat);this._polygon=new Polygon(filename);this._device=device;this._canvasFormat=canvasFormat;this._currentState=0;this._stiffness=1.0;this._color=[0.0,1.0,0.0,1.0];}
set stiffness(value){this._stiffness=value;}
get stiffness(){return this._stiffness;}
setColor(rgbaArray){this._color=rgbaArray;}
getColor(){return this._color;}
async createGeometry(){await this._polygon.init();this._numV=this._polygon._numV;this._dim=this._polygon._dim;this._vertices=[];for(let[x,y]of this._polygon._polygon){this._vertices.push(x,y,0,0,0,0,0,1,1,1,1,0);}
this._vertexBuffer=this._device.createBuffer({label:"Vertices Normals and More "+this.getName(),size:this._vertices.length*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST,mappedAtCreation:true});this._colorBuffer=this._device.createBuffer({size:4*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,});this._stiffnessBuffer=this._device.createBuffer({size:4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,});new Float32Array(this._vertexBuffer.getMappedRange()).set(this._vertices);this._vertexBuffer.unmap();this._vertexBufferLayout={arrayStride:12*Float32Array.BYTES_PER_ELEMENT,attributes:[{format:"float32x2",offset:0,shaderLocation:0,},{format:"float32x2",offset:2*Float32Array.BYTES_PER_ELEMENT,shaderLocation:1,},{format:"float32x4",offset:4*Float32Array.BYTES_PER_ELEMENT,shaderLocation:2,},{format:"float32x2",offset:8*Float32Array.BYTES_PER_ELEMENT,shaderLocation:3,},{format:"float32x2",offset:10*Float32Array.BYTES_PER_ELEMENT,shaderLocation:4,}]};this._vertexCount=this._polygon._polygon.length;this._originalVertexBuffer=this._device.createBuffer({size:this._vertexCount*12*4,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST,mappedAtCreation:true});new Float32Array(this._originalVertexBuffer.getMappedRange()).set(this._vertices);this._originalVertexBuffer.unmap();const stride=48;this._stateBuffers=[0,1].map(()=>this._device.createBuffer({size:this._vertices.length*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}));for(let i=0;i<2;i++){this._device.queue.writeBuffer(this._stateBuffers[i],0,new Float32Array(this._vertices));}}
async createShaders(){const computeShaderCode=await this.loadShader("/shaders/arap.wsgl");this._arapShaderModule=this._device.createShaderModule({label:"ARAP Shader "+this.getName(),code:computeShaderCode,});const renderShaderCode=await this.loadShader("/shaders/optimized_standard2d.wgsl");this._renderShaderModule=this._device.createShaderModule({label:"Render Shader "+this.getName(),code:renderShaderCode,});this._pipelines={gravity:this._device.createComputePipeline({layout:'auto',compute:{module:this._arapShaderModule,entryPoint:'gravityUpdate'}}),};}
dispatchGravityUpdate(encoder){const floorY=-0.9;this._device.queue.writeBuffer(this._stiffnessBuffer,0,new Float32Array([this._stiffness]));const bindGroup=this._device.createBindGroup({layout:this._pipelines.gravity.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this._stateBuffers[this._currentState]}},{binding:1,resource:{buffer:this._stateBuffers[1-this._currentState]}},{binding:2,resource:{buffer:this._stiffnessBuffer}},]});const pass=encoder.beginComputePass();pass.setPipeline(this._pipelines.gravity);pass.setBindGroup(0,bindGroup);const workgroupSize=256;const numGroups=Math.ceil(this._vertexCount/workgroupSize);pass.dispatchWorkgroups(numGroups);pass.end();}
swapBuffers(){this._currentState=1-this._currentState;}
async createRenderPipeline(){this._renderPipeline=this._device.createRenderPipeline({label:"Render Pipeline "+this.getName(),layout:"auto",vertex:{module:this._renderShaderModule,entryPoint:"vertexMain",buffers:[this._vertexBufferLayout]},fragment:{module:this._renderShaderModule,entryPoint:"fragmentMain",targets:[{format:this._canvasFormat}]},primitive:{topology:'line-strip'}});}
render(pass){pass.setPipeline(this._renderPipeline);pass.setVertexBuffer(0,this._stateBuffers[this._currentState]);this._device.queue.writeBuffer(this._colorBuffer,0,new Float32Array(this._color));const bindGroup=this._device.createBindGroup({layout:this._renderPipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this._colorBuffer}},]});pass.setBindGroup(0,bindGroup);pass.draw(this._numV);}
async createComputePipeline(){}
compute(pass){}}
class StandardTextObject{constructor(inputText,spacing=5,textFont='18px Arial'){this._textFont=textFont;this._lineSpacing=spacing;this._textCanvas=document.createElement('canvas');this._textContext=this._textCanvas.getContext('2d');this.updateTextRegion(inputText);this.updateText(inputText);this._textCanvas.style.position='absolute';this._textCanvas.style.top='10px';this._textCanvas.style.left='10px';this._textCanvas.style.border='1px solid red';document.body.appendChild(this._textCanvas);}
toggleVisibility(){this._textCanvas.hidden=!this._textCanvas.hidden;}
updateTextRegion(newText){this._textContext.font=this._textFont;this._lines=newText.split('\n');this._width=Math.max(...this._lines.map(line=>this._textContext.measureText(line).width));const match=this._textFont.match(/(\d+)px/);if(match){this._fontSize=parseInt(match[1],10);}
else{this._fontSize=18;this._textFont="18px Arial";}
this._height=this._lines.length*(this._fontSize+this._lineSpacing);this._paddingx=5;this._paddingtop=3;this._canvasWidth=Math.ceil(this._width+this._paddingx*2);this._canvasHeight=Math.ceil(this._height+this._paddingtop);this._textCanvas.width=this._canvasWidth;this._textCanvas.height=this._canvasHeight;this._textContext.font=this._textFont;this._textContext.textBaseline='top';}
updateText(newText){this._lines=newText.split('\n');this._textContext.fillStyle='rgba(1, 1, 1, 0.5)';this._textContext.clearRect(0,0,this._canvasWidth,this._canvasHeight);this._textContext.fillRect(0,0,this._canvasWidth,this._canvasHeight);this._textContext.fillStyle='white';this._lines.forEach((line,idx)=>{const x=this._paddingx;const y=this._paddingtop+idx*(this._fontSize+this._lineSpacing);this._textContext.fillText(line,x,y);});}}
class Camera{constructor(){this._pose=new Float32Array([1,0,0,0,1,1]);}
resetPose(){this._pose[0]=1;this._pose[1]=0;this._pose[2]=0;this._pose[3]=0;this._pose[4]=1;this._pose[5]=1;}
updatePose(newpose){this._pose[0]=newpose[0];this._pose[1]=newpose[1];this._pose[2]=newpose[2];this._pose[3]=newpose[3];}
moveLeft(d){let dt=PGA2D.createTranslator(-d,0);let newpose=PGA2D.normaliozeMotor(PGA2D.geometricProduct(dt,[this._pose[0],this._pose[1],this._pose[2],this._pose[3]]));this.updatePose(newpose);}
moveRight(d){let dt=PGA2D.createTranslator(d,0);let newpose=PGA2D.normaliozeMotor(PGA2D.geometricProduct(dt,[this._pose[0],this._pose[1],this._pose[2],this._pose[3]]));this.updatePose(newpose);}
moveUp(d){let dt=PGA2D.createTranslator(0,d);let newpose=PGA2D.normaliozeMotor(PGA2D.geometricProduct(dt,[this._pose[0],this._pose[1],this._pose[2],this._pose[3]]));this.updatePose(newpose);}
moveDown(d){let dt=PGA2D.createTranslator(0,-d);let newpose=PGA2D.normaliozeMotor(PGA2D.geometricProduct(dt,[this._pose[0],this._pose[1],this._pose[2],this._pose[3]]));this.updatePose(newpose);}
zoomIn(){this._pose[4]*=1.1;this._pose[5]*=1.1;}
zoomOut(){this._pose[4]/=1.1;this._pose[5]/=1.1;}}
let polygon;let camera;async function init(){const canvasTag=document.createElement('canvas');camera=new Camera();canvasTag.id="renderCanvas";document.body.appendChild(canvasTag);const renderer=new Renderer(canvasTag);await renderer.init();polygon=new PolygonObject(renderer._device,renderer._canvasFormat,'/assets/dense.polygon');await renderer.appendSceneObject(polygon);let fps='??';var fpsText=new StandardTextObject('fps: '+fps);var frameCnt=0;var tgtFPS=60;var secPerFrame=1./tgtFPS;var frameInterval=secPerFrame*1000;var lastCalled;let renderFrame=()=>{let elapsed=Date.now()-lastCalled;if(elapsed>frameInterval){++frameCnt;lastCalled=Date.now()-(elapsed%frameInterval);const encoder=renderer._device.createCommandEncoder();polygon.dispatchGravityUpdate(encoder);polygon.swapBuffers();renderer._device.queue.submit([encoder.finish()]);renderer.render();}
requestAnimationFrame(renderFrame);};lastCalled=Date.now();renderFrame();setInterval(()=>{fpsText.updateText('fps: '+frameCnt);frameCnt=0;},1000);return renderer;}
function windingNumber(p,vertices){let winding=0;const numVertices=vertices.length;for(let i=0;i<numVertices-1;i++){const v0=vertices[i];const v1=vertices[i+1];if((v0[1]<=p[1]&&v1[1]>p[1])||(v1[1]<=p[1]&&v0[1]>p[1])){const intersectX=v0[0]+(p[1]-v0[1])*(v1[0]-v0[0])/(v1[1]-v0[1]);if(p[0]<intersectX){winding+=(v1[1]>v0[1])?1:-1;}}}
return winding!==0;}
window.addEventListener('keydown',(e)=>{if(e.key==='ArrowUp'){console.log("UP")
polygon._stiffness=Math.min(polygon._stiffness+0.1,5.0);console.log('Stiffness increased:',polygon._stiffness);}else if(e.key==='ArrowDown'){console.log("DOWN")
polygon._stiffness=Math.max(polygon._stiffness-0.1,0.1);console.log('Stiffness decreased:',polygon._stiffness);}else if(e.key==='r'||e.key==='R'){location.reload();};let lastCollidingEdge=null;window.addEventListener('mousemove',(e)=>{var mouseX=(e.clientX/window.innerWidth)*2-1;var mouseY=(-e.clientY/window.innerHeight)*2+1;const p=PGA2D.applyMotorToPoint([mouseX,mouseY],[camera._pose[0],camera._pose[1],camera._pose[2],camera._pose[3],]);if(windingNumber(p,polygon._polygon._polygon)){polygon.setColor([1.0,0.0,0.0,1.0]);}else{polygon.setColor([0.0,1.0,0.0,1.0]);}});function closestEdge(p,vertices){let minDist=Infinity;let closest=null;for(let i=0;i<vertices.length-1;i++){const v0=vertices[i];const v1=vertices[i+1];const edgeVec=[v1[0]-v0[0],v1[1]-v0[1]];const ptVec=[p[0]-v0[0],p[1]-v0[1]];const t=Math.max(0,Math.min(1,((ptVec[0]*edgeVec[0]+ptVec[1]*edgeVec[1])/(edgeVec[0]**2+edgeVec[1]**2))));const proj=[v0[0]+t*edgeVec[0],v0[1]+t*edgeVec[1]];const distSq=(proj[0]-p[0])**2+(proj[1]-p[1])**2;if(distSq<minDist){minDist=distSq;closest={index:i,point:proj};}}
return closest;}
init().then(ret=>{console.log(ret);}).catch(error=>{const pTag=document.createElement('p');pTag.innerHTML=navigator.userAgent+"</br>"+error.message;document.body.appendChild(pTag);document.getElementById("renderCanvas").remove();});