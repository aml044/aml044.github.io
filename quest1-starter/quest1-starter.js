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

// Check your browser supports: https://github.com/gpuweb/gpuweb/wiki/Implementation-Status#implementation-status
// Need to enable experimental flags chrome://flags/
// Chrome & Edge 113+ : Enable Vulkan, Default ANGLE Vulkan, Vulkan from ANGLE, Unsafe WebGPU Support, and WebGPU Developer Features (if exsits)
// Firefox Nightly: sudo snap install firefox --channel=latext/edge or download from https://www.mozilla.org/en-US/firefox/channel/desktop/

import Renderer from '/quest1-starter/lib/Viz/2DRenderer.js'
import Standard2DVertexObject from '/quest1-starter/lib/DSViz/Standard2DVertexObject.js'

async function init() {
  // Create a canvas tag
  const canvasTag = document.createElement('canvas');
  canvasTag.id = "renderCanvas";
  document.body.appendChild(canvasTag);
  // Create a 2d renderer
  const renderer = new Renderer(canvasTag);
  await renderer.init();
  console.log("HERE 1");

  //Fish tail
  var verticesTail = new Float32Array([
     // x, y
     -0.5, 0.1,
     -0.7, 0.2,
     -0.7, 0,
  ]);
  await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device, renderer._canvasFormat, verticesTail, 'vertexMain', 'fragShaderOrange'));

  //Fish BOdy
  var verticesBodyLower = new Float32Array([
    //x,y
    -0.5, 0.1, // left
    0.0, -0.2,  // center
    0.5, 0.1,  // right
  ]);
  await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device, renderer._canvasFormat, verticesBodyLower, 'vertexMain', 'fragShaderOrange'));

   //Fish BOdy
   var verticesBodyUpper = new Float32Array([
    //x,y
    -0.5, 0.1, // left
    0.0, 0.35,  // center
    0.5, 0.1,  // right
  ]);
  await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device, renderer._canvasFormat, verticesBodyUpper, 'vertexMain', 'fragShaderOrange'));
   
  //Stripe1
  var verticesStripe1Shape1 = new Float32Array([
    //x,y
    -0.25, 0.23,
    -.05, 0.33,
    0.0, 0.0,
  ]);
  await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device, renderer._canvasFormat, verticesStripe1Shape1, 'vertexMain', 'fragShaderWhite'));

  var verticesStripe1Shape2 = new Float32Array([
    // Triangle 2
    -0.17, 0.0,
    -0.16, 0.15,
    0.0, 0.0,
 ]);

  await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device, renderer._canvasFormat, verticesStripe1Shape2, 'vertexMain', 'fragShaderWhite'));


  var verticesStripe1Shape3 = new Float32Array([
    // Triangle 2
    -0.15, -0.112,
    -0.22, 0.0,
    0.0, 0.0,
 ]);

await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device, renderer._canvasFormat, verticesStripe1Shape3, 'vertexMain', 'fragShaderWhite'));


var verticesStripe1Shape4 = new Float32Array([
  // Triangle 2
  -.06, -0.163,  // center
  0.0, 0.0,
  -0.15, -0.112,
]);

await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device, renderer._canvasFormat, verticesStripe1Shape4, 'vertexMain', 'fragShaderWhite'));
 
//Stripe2
var verticesStripe2Shape1 = new Float32Array([
  //x,y
  0.25, 0.23,
  .05, 0.33,
  0.10, 0.0,
]);

await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device, renderer._canvasFormat, verticesStripe2Shape1, 'vertexMain', 'fragShaderWhite'));

var verticesStripe2Shape2 = new Float32Array([
  //x,y
  0.10, 0.0,
  0.21, 0.17,
  0.2, -.083,
]);

await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device, renderer._canvasFormat, verticesStripe2Shape2, 'vertexMain', 'fragShaderWhite'));

var verticesStripe2Shape3 = new Float32Array([
  //x,y
  0.2, -.083,
  0.10, 0.0,
  0.08, -.153,

]);

await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device, renderer._canvasFormat, verticesStripe2Shape3, 'vertexMain', 'fragShaderWhite'));

//Fish eye, I had to use google for this

const eyeSegments = 30; // Number of segments for the circle
const eyeRadius = 0.025; // Radius of the circle
const eyeCenterX = 0.3; // X position of the eye
const eyeCenterY = 0.15; // Y position of the eye

const verticesEye = [];

// Generate triangles for the circle
for (let i = 0; i < eyeSegments; i++) {
  const angle1 = (i / eyeSegments) * 2 * Math.PI;       
  const angle2 = ((i + 1) / eyeSegments) * 2 * Math.PI; 

  // Center of the circle
  verticesEye.push(eyeCenterX, eyeCenterY);

  verticesEye.push(
    eyeCenterX + eyeRadius * Math.cos(angle1),
    eyeCenterY + eyeRadius * Math.sin(angle1)
  );

  verticesEye.push(
    eyeCenterX + eyeRadius * Math.cos(angle2),
    eyeCenterY + eyeRadius * Math.sin(angle2)
  );
}

// Append the eye as a filled circle
await renderer.appendSceneObject(new Standard2DVertexObject(
  renderer._device,
  renderer._canvasFormat,
  new Float32Array(verticesEye),
  'vertexMain',
  'fragShaderBlack'
));

//Chest
const verticesChest = new Float32Array([
  // x, y
  -0.5, -1, // Bottom-left
  -0.5,  -0.4, // Top-left
   0.1, -1, // Bottom-right
   0.1, -1, // Bottom-right
  -0.5,  -0.4, // Top-left
   0.1,  -0.4  // Top-right
]);

// Append the rectangle to the scene
await renderer.appendSceneObject(new Standard2DVertexObject(
  renderer._device,
  renderer._canvasFormat,
  verticesChest,
  'vertexMain',
  'fragShaderBrown' 
));

const verticesChestWrap = new Float32Array([
  // x, y
  -0.5, -0.65, // Bottom-left
  -0.5,  -0.55, // Top-left
   0.1, -0.65, // Bottom-right
   0.1, -0.55, // Bottom-right
  -0.5,  -0.65, // Top-left
   0.1,  -0.65  // Top-right
]);

await renderer.appendSceneObject(new Standard2DVertexObject(
  renderer._device,
  renderer._canvasFormat,
  verticesChestWrap,
  'vertexMain',
  'fragShaderYellow' 
));

//chestKeyCircle

const keySegments = 30; // Number of segments for the circle
const keyRadius = 0.025; // Radius of the circle
const keyCenterX = -0.2; // X position of the eye
const keyCenterY = -.7; // Y position of the eye

const verticesKey = [];

// Generate triangles for the circle
for (let i = 0; i < keySegments; i++) {
  const angle1 = (i / keySegments) * 2 * Math.PI;       
  const angle2 = ((i + 1) / keySegments) * 2 * Math.PI; 

  // Center of the circle
  verticesKey.push(keyCenterX, keyCenterY);

  verticesKey.push(
    keyCenterX + keyRadius * Math.cos(angle1),
    keyCenterY + keyRadius * Math.sin(angle1)
  );

  verticesKey.push(
    keyCenterX + keyRadius * Math.cos(angle2),
    keyCenterY + keyRadius * Math.sin(angle2)
  );
}

// Append the eye as a filled circle
await renderer.appendSceneObject(new Standard2DVertexObject(
  renderer._device,
  renderer._canvasFormat,
  new Float32Array(verticesKey),
  'vertexMain',
  'fragShaderBlack'
));

//Key triangle
var verticesKeyTriangle = new Float32Array([
  // x, y
  -.2, -.7,
  -.23, -.82,
  -0.17, -.82,
]);
await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device, renderer._canvasFormat, verticesKeyTriangle, 'vertexMain', 'fragShaderBlack'));


//Star 
var verticesStarShape1 = new Float32Array([
  //x,y
  0.75, 0.7,  // Top vertex
  .65, 0.55, // Bottom-left vertex
  0.85, 0.55   // Bottom-right vertex
]);
await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device, renderer._canvasFormat, verticesStarShape1, 'vertexMain', 'fragShaderYellow'));

//Star 
var verticesStarShape2 = new Float32Array([
  //x,y
  0.75, 0.5,  // Top vertex
  .65, 0.65, // Bottom-left vertex
  0.85, 0.65   // Bottom-right vertex
]);
await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device, renderer._canvasFormat, verticesStarShape2, 'vertexMain', 'fragShaderYellow'));


//Star 2
var verticesStar2Shape1 = new Float32Array([
  //x,y
  -0.75, 0.7,  // Top vertex
  -.65, 0.55, // Bottom-left vertex
  -0.85, 0.55   // Bottom-right vertex
]);
await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device, renderer._canvasFormat, verticesStar2Shape1, 'vertexMain', 'fragShaderYellow'));

//Star 2
var verticesStar2Shape2 = new Float32Array([
  //x,y
  -0.75, 0.5,  // Top vertex
  -.65, 0.65, // Bottom-left vertex
  -0.85, 0.65   // Bottom-right vertex
]);
await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device, renderer._canvasFormat, verticesStar2Shape2, 'vertexMain', 'fragShaderYellow'));

renderer.render();
  return renderer;
}

init().then( ret => {
  console.log(ret);
}).catch( error => {
  const pTag = document.createElement('p');
  pTag.innerHTML = navigator.userAgent + "</br>" + error.message;
  document.body.appendChild(pTag);
  document.getElementById("renderCanvas").remove();
});