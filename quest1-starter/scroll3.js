import FilteredRenderer from '/lib/Viz/filteredRenderer.js'
import Standard2DVertexColorObject from '/lib/DSViz/Standard2DColoredObject.js'

async function init() {
  // Create a canvas tag
  const canvasTag = document.createElement('canvas');
  canvasTag.id = "renderCanvas";
  console.log("HERE1");
  document.body.appendChild(canvasTag);
  // Create a 2d renderer
  const renderer = new FilteredRenderer(canvasTag);
  await renderer.init();
  console.log("HERE2");
  // Create a triangle geometry
  var vertices = new Float32Array([
    // x, y, r, g, b, a - added four values for rgba color
    0, 0.5, 1, 0, 0, 1,
    -0.5, 0, 0, 1, 0, 1,
    0.5,  0, 0, 0, 1, 1,
  ]);
  console.log("HERE3");
  await renderer.appendSceneObject(new Standard2DVertexColorObject(renderer._device, renderer._canvasFormat, vertices));
  console.log("HERE4");
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