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

import FilteredRenderer from 'quest2-starter/lib/Viz/2DFilteredRenderer.js'
import Standard2DFullScreenObject from 'quest2-starter/lib/DSViz/Standard2DFullScreenObject.js'
import Standard2DPGAPosedVertexColorObject from 'quest2-starter/lib/DSViz/Standard2DPGAPosedVertexColorObject.js'
import Standard2DVertexColorObject from 'quest2-starter/lib/DSViz/Standard2DVertexColorObject.js'
import LineStrip2DVertexObject from 'quest2-starter/lib/DSViz/LineStrip2DVertexObject.js'
import DemoTreeObject from 'quest2-starter/lib/DSViz/DemoTreeObject.js'
import PGA2D from 'quest2-starter/lib/Math/PGA2D.js'

async function init() {
  // Create a canvas tag
  const canvasTag = document.createElement('canvas');
  canvasTag.id = "renderCanvas";
  document.body.appendChild(canvasTag);
  // Create a 2d animated renderer
  const renderer = new FilteredRenderer(canvasTag);
  await renderer.init();
  // Create a background
  await renderer.appendSceneObject(new Standard2DFullScreenObject(renderer._device, renderer._canvasFormat, "quest2-starter/assets/cosmos.jpg"));

  //SUN
  const keySegments = 30; // Number of segments for the circle
  const keyRadius = .3; // Radius of the circle
  const keyCenterX = 0; // X position of the eye
  const keyCenterY = 0; // Y position of the eye
  const verticesKey = [];
  // Generate triangles for the circle
  for (let i = 0; i < keySegments; i++) {
    const angle1 = (i / keySegments) * 2 * Math.PI;       
    const angle2 = ((i + 1) / keySegments) * 2 * Math.PI; 
  
    // Center of the circle
    verticesKey.push(keyCenterX, keyCenterY, 1, 1, 0, 0);
  
    verticesKey.push(
      keyCenterX + keyRadius * Math.cos(angle1),
      keyCenterY + keyRadius * Math.sin(angle1), 1, 1, 0, 0
    );
  
    verticesKey.push(
      keyCenterX + keyRadius * Math.cos(angle2),
      keyCenterY + keyRadius * Math.sin(angle2), 1, 1, 0, 0
    );
  }
  var pose = [1, 0, 0, 0, 1, 1];
  pose = new Float32Array(pose); // need to covert to Float32Array for uploading to GPU with fixed known size
  // Append the SUN as a filled circle
  await renderer.appendSceneObject(new Standard2DPGAPosedVertexColorObject(
    renderer._device,
    renderer._canvasFormat,
    new Float32Array(verticesKey), pose
  ));

  //Mercury
  const mercSegments = 30; // Number of segments for the circle
  const mercRadius = .04; // Radius of the circle
  const mercCenterX = .35; // X position of the eye
  const mercCenterY = -.2; // Y position of the eye
  const mercVertices = [];
  // Generate triangles for the circle
  for (let i = 0; i < mercSegments; i++) {
    const angle1 = (i / mercSegments) * 2 * Math.PI;       
    const angle2 = ((i + 1) / mercSegments) * 2 * Math.PI; 

    // Center of the circle
    mercVertices.push(mercCenterX, mercCenterY, 150/225.0, 150/255.0, 150/255.0, 0);
  
    mercVertices.push(
      mercCenterX + mercRadius * Math.cos(angle1),
      mercCenterY + mercRadius * Math.sin(angle1), 150/225.0, 150/255.0, 150/255.0, 0
    );
  
    mercVertices.push(
      mercCenterX + mercRadius * Math.cos(angle2),
      mercCenterY + mercRadius * Math.sin(angle2), 150/225.0, 150/255.0, 150/255.0, 0
    );
  }
  var mercuryPose = [1, 1, 0, 0, 1, 1];
  mercuryPose = new Float32Array(mercuryPose); // need to covert to Float32Array for uploading to GPU with fixed known size
  // Append the mercury as a filled circle
  await renderer.appendSceneObject(new Standard2DPGAPosedVertexColorObject(
    renderer._device,
    renderer._canvasFormat,
    new Float32Array(mercVertices), mercuryPose
  ));


  //Venus
  const venusSegments = 30; // Number of segments for the circle
  const venusRadius = .05; // Radius of the circle
  const venusCenterX = .5; // X position of the eye
  const venusCenterY = -.2; // Y position of the eye
  const venusVertices = [];
  // Generate triangles for the circle
  for (let i = 0; i < venusSegments; i++) {
    const angle1 = (i / venusSegments) * 2 * Math.PI;       
    const angle2 = ((i + 1) / venusSegments) * 2 * Math.PI; 

    // Center of the circle
    venusVertices.push(venusCenterX, venusCenterY, 255/225.0, 0/255.0, 0/255.0, 0);
  
    venusVertices.push(
      venusCenterX + venusRadius * Math.cos(angle1),
      venusCenterY + venusRadius * Math.sin(angle1), 255/225.0, 0/255.0, 0/255.0, 0
    );
  
    venusVertices.push(
      venusCenterX + venusRadius * Math.cos(angle2),
      venusCenterY + venusRadius * Math.sin(angle2), 255/225.0, 0/255.0, 0/255.0, 0
    );
  }
  var venusPose = [1, 1, 0, 0, 1, 1];
 venusPose = new Float32Array(venusPose); // need to covert to Float32Array for uploading to GPU with fixed known size
  // Append the SUN as a filled circle
  await renderer.appendSceneObject(new Standard2DPGAPosedVertexColorObject(
    renderer._device,
    renderer._canvasFormat,
    new Float32Array(venusVertices), venusPose
  ));

  //Earth
  const earthSegments = 30; // Number of segments for the circle
  const earthRadius = .05; // Radius of the circle
  const earthCenterX = .62; // X position of the eye
  const earthCenterY = -.27; // Y position of the eye
  const earthVertices = [];
  // Generate triangles for the circle
  for (let i = 0; i < earthSegments; i++) {
    const angle1 = (i / earthSegments) * 2 * Math.PI;       
    const angle2 = ((i + 1) / earthSegments) * 2 * Math.PI; 

    // Center of the circle
    earthVertices.push(earthCenterX, earthCenterY, 0/225.0, 0/255.0, 255/255.0, 0);
  
    earthVertices.push(
      earthCenterX + earthRadius * Math.cos(angle1),
      earthCenterY + earthRadius * Math.sin(angle1), 0/225.0, 0/255.0, 255/255.0, 0
    );
  
    earthVertices.push(
      earthCenterX + earthRadius * Math.cos(angle2),
      earthCenterY + earthRadius * Math.sin(angle2), 0/225.0, 0/255.0, 255/255.0, 0
    );
  }
  var earthPose = [1, 1, 0, 0, 1, 1];
  earthPose = new Float32Array(earthPose); // need to covert to Float32Array for uploading to GPU with fixed known size
  // Append the mercury as a filled circle
  await renderer.appendSceneObject(new Standard2DPGAPosedVertexColorObject(
    renderer._device,
    renderer._canvasFormat,
    new Float32Array(earthVertices), earthPose
  ));

  //earth-moon
  const moonSegments = 30;
  const moonRadius = 0.005;
  const moonCenterX = .70;
  const moonCenterY = -.20;
  const moonVertices = [];
  for (let i = 0; i < moonSegments; i++) {
    const angle1 = (i / moonSegments) * 2 * Math.PI;       
    const angle2 = ((i + 1) / moonSegments) * 2 * Math.PI; 

    // Center of the circle
    moonVertices.push(moonCenterX, moonCenterY, 150/225.0, 150/255.0, 150/255.0, 0);
  
    moonVertices.push(
      moonCenterX + moonRadius * Math.cos(angle1),
      moonCenterY + moonRadius * Math.sin(angle1), 150/225.0, 150/255.0, 150/255.0, 0
    );
  
    moonVertices.push(
      moonCenterX + moonRadius * Math.cos(angle2),
      moonCenterY + moonRadius * Math.sin(angle2), 150/225.0, 150/255.0, 150/255.0, 0
    );
  }
  var moonPose = [1, 1, .62, -.67, 1, 1];
  moonPose = new Float32Array(moonPose); // need to covert to Float32Array for uploading to GPU with fixed known size
  // Append the mercury as a filled circle
  await renderer.appendSceneObject(new Standard2DPGAPosedVertexColorObject(
    renderer._device,
    renderer._canvasFormat,
    new Float32Array(moonVertices), moonPose
  ));

  //mars
  const marsSegments = 30; // Number of segments for the circle
  const marsRadius = .05; // Radius of the circle
  const marsCenterX = .62; // X position of the eye
  const marsCenterY = -.27; // Y position of the eye
  const marsVertices = [];
  // Generate triangles for the circle
  for (let i = 0; i < marsSegments; i++) {
    const angle1 = (i / marsSegments) * 2 * Math.PI;       
    const angle2 = ((i + 1) / marsSegments) * 2 * Math.PI; 

    // Center of the circle
    marsVertices.push(marsCenterX, marsCenterY, 200/225.0, 70/255.0, 10/255.0, 0);
  
    marsVertices.push(
      marsCenterX + marsRadius * Math.cos(angle1),
      marsCenterY + marsRadius * Math.sin(angle1), 200/225.0, 70/255.0, 10/255.0, 0
    );
  
    marsVertices.push(
      marsCenterX + marsRadius * Math.cos(angle2),
      marsCenterY + marsRadius * Math.sin(angle2), 200/225.0, 70/255.0, 10/255.0, 0
    );
  }
  var marsPose = [1, 0, 0, 0, 1, 1];
  marsPose = new Float32Array(marsPose); // need to covert to Float32Array for uploading to GPU with fixed known size
  // Append the mercury as a filled circle
  await renderer.appendSceneObject(new Standard2DPGAPosedVertexColorObject(
    renderer._device,
    renderer._canvasFormat,
    new Float32Array(marsVertices), marsPose
  ));


  //jupiter
  const jupiterSegments = 30; // Number of segments for the circle
  const jupiterRadius = .08; // Radius of the circle
  const jupiterCenterX = .7; // X position of the eye
  const jupiterCenterY = -.3; // Y position of the eye
  const jupiterVertices = [];
  // Generate triangles for the circle
  for (let i = 0; i < jupiterSegments; i++) {
    const angle1 = (i / jupiterSegments) * 2 * Math.PI;       
    const angle2 = ((i + 1) / jupiterSegments) * 2 * Math.PI; 

    // Center of the circle
    jupiterVertices.push(jupiterCenterX, jupiterCenterY, 225/225.0, 215/255.0, 215/255.0, 0);
  
    jupiterVertices.push(
      jupiterCenterX + jupiterRadius * Math.cos(angle1),
      jupiterCenterY + jupiterRadius * Math.sin(angle1), 225/225.0, 215/255.0, 215/255.0, 0
    );
  
    jupiterVertices.push(
      jupiterCenterX + jupiterRadius * Math.cos(angle2),
      jupiterCenterY + jupiterRadius * Math.sin(angle2), 225/225.0, 215/255.0, 215/255.0, 0
    );
  }
  var jupiterPose = [1, .32, 0, 0, 1, 1];
  jupiterPose = new Float32Array(jupiterPose); // need to covert to Float32Array for uploading to GPU with fixed known size
  // Append the mercury as a filled circle
  await renderer.appendSceneObject(new Standard2DPGAPosedVertexColorObject(
    renderer._device,
    renderer._canvasFormat,
    new Float32Array(jupiterVertices), jupiterPose
  ));

  //saturn
  const saturnSegments = 30; // Number of segments for the circle
  const saturnRadius = .08; // Radius of the circle
  const saturnCenterX = .79; // X position of the eye
  const saturnCenterY = -.38; // Y position of the eye
  const saturnVertices = [];
  // Generate triangles for the circle
  for (let i = 0; i < saturnSegments; i++) {
    const angle1 = (i / saturnSegments) * 2 * Math.PI;       
    const angle2 = ((i + 1) / saturnSegments) * 2 * Math.PI; 

    // Center of the circle
    saturnVertices.push(saturnCenterX, saturnCenterY, 215/225.0, 119/255.0, 35/255.0, 0);
  
    saturnVertices.push(
      saturnCenterX + saturnRadius * Math.cos(angle1),
      saturnCenterY + saturnRadius * Math.sin(angle1), 215/225.0, 119/255.0, 35/255.0, 0
    );
  
    saturnVertices.push(
      saturnCenterX + saturnRadius * Math.cos(angle2),
      saturnCenterY + saturnRadius * Math.sin(angle2), 215/225.0, 119/255.0, 35/255.0, 0
    );
  }
  var saturnPose = [0, 0 ,0, 0, 1, 1];
  saturnPose = new Float32Array(saturnPose); // need to covert to Float32Array for uploading to GPU with fixed known size
  // Append the mercury as a filled circle
  await renderer.appendSceneObject(new Standard2DPGAPosedVertexColorObject(
    renderer._device,
    renderer._canvasFormat,
    new Float32Array(saturnVertices), saturnPose
  ));

  //uranus
  const uranusSegments = 30; // Number of segments for the circle
  const uranusRadius = .05; // Radius of the circle
  const uranusCenterX = .8; // X position of the eye
  const uranusCenterY = -.4; // Y position of the eye
  const uranusVertices = [];
  // Generate triangles for the circle
  for (let i = 0; i < uranusSegments; i++) {
    const angle1 = (i / uranusSegments) * 2 * Math.PI;       
    const angle2 = ((i + 1) / uranusSegments) * 2 * Math.PI; 

    // Center of the circle
    uranusVertices.push(uranusCenterX, uranusCenterY, 0/225.0, 255/255.0, 255/255.0, 0);
  
    uranusVertices.push(
      uranusCenterX + uranusRadius * Math.cos(angle1),
      uranusCenterY + uranusRadius * Math.sin(angle1), 0/225.0, 255/255.0, 215/255.0, 0
    );
  
    uranusVertices.push(
      uranusCenterX + uranusRadius * Math.cos(angle2),
      uranusCenterY + uranusRadius * Math.sin(angle2), 0/225.0, 255/255.0, 255/255.0, 0
    );
  }
  var uranusPose = [1, .56, 0, 0, 1, 1];
  uranusPose = new Float32Array(uranusPose); // need to covert to Float32Array for uploading to GPU with fixed known size
  // Append the mercury as a filled circle
  await renderer.appendSceneObject(new Standard2DPGAPosedVertexColorObject(
    renderer._device,
    renderer._canvasFormat,
    new Float32Array(uranusVertices), uranusPose
  ));

   //Neptune
   const neptuneSegments = 30; // Number of segments for the circle
   const neptuneRadius = .06; // Radius of the circle
   const neptuneCenterX = 1; // X position of the eye
   const neptuneCenterY = -.25; // Y position of the eye
   const neptuneVertices = [];
   // Generate triangles for the circle
   for (let i = 0; i < neptuneSegments; i++) {
     const angle1 = (i / neptuneSegments) * 2 * Math.PI;       
     const angle2 = ((i + 1) / neptuneSegments) * 2 * Math.PI; 
 
     // Center of the circle
     neptuneVertices.push(neptuneCenterX, neptuneCenterY, 0/225.0, 0/255.0, 159/255.0, 0);
   
     neptuneVertices.push(
       neptuneCenterX + neptuneRadius * Math.cos(angle1),
       neptuneCenterY + neptuneRadius * Math.sin(angle1), 0/225.0, 0/255.0, 159/255.0, 0
     );
   
     neptuneVertices.push(
       neptuneCenterX + neptuneRadius * Math.cos(angle2),
       neptuneCenterY + neptuneRadius * Math.sin(angle2), 0/225.0, 0/255.0, 159/255.0, 0
     );
   }
   var neptunePose = [1, .77, 0, 0, 1, 1];
   neptunePose = new Float32Array(neptunePose); // need to covert to Float32Array for uploading to GPU with fixed known size
   // Append the mercury as a filled circle
   await renderer.appendSceneObject(new Standard2DPGAPosedVertexColorObject(
     renderer._device,
     renderer._canvasFormat,
     new Float32Array(neptuneVertices), neptunePose
   ));

  // Create another triangle geometry
  let demoTreePose = new Float32Array([1, 0, 0, 0, 0.5, 0.5]);
  await renderer.appendSceneObject(new DemoTreeObject(renderer._device, renderer._canvasFormat, demoTreePose));
  // run at every 100 ms
  let angle = Math.PI / 100;
  // rotate about p
  let center = [0, 0];
  let dr = PGA2D.normaliozeMotor([Math.cos(angle / 2), -Math.sin(angle / 2), -center[0] * Math.sin(angle / 2), -center[1] * Math.sin(angle / 2)]);
  setInterval(() => { 
    renderer.render();

    let mercuryMotor = PGA2D.normaliozeMotor(PGA2D.geometricProduct(dr, [mercuryPose[0], mercuryPose[1], mercuryPose[2], mercuryPose[3]]));
    mercuryPose[0] = mercuryMotor[0];
    mercuryPose[1] = mercuryMotor[1];
    mercuryPose[2] = mercuryMotor[2];
    mercuryPose[3] = mercuryMotor[3];

    let venusMotor = PGA2D.normaliozeMotor(PGA2D.geometricProduct(dr, [venusPose[0], venusPose[1], venusPose[2], venusPose[3]]));
    venusPose[0] = venusMotor[0];
    venusPose[1] = venusMotor[1];
    venusPose[2] = venusMotor[2];
    venusPose[3] = venusMotor[3];

    let demoTreeMotor = PGA2D.normaliozeMotor(PGA2D.geometricProduct(dr, [demoTreePose[0], demoTreePose[1], demoTreePose[2], demoTreePose[3]]));
    demoTreePose[0] = demoTreeMotor[0];
    demoTreePose[1] = demoTreeMotor[1];
    demoTreePose[2] = demoTreeMotor[2];
    demoTreePose[3] = demoTreeMotor[3];

    let earthTreeMotor = PGA2D.normaliozeMotor(PGA2D.geometricProduct(dr, [earthPose[0], earthPose[1], earthPose[2], earthPose[3]]));
    earthPose[0] = earthTreeMotor[0];
    earthPose[1] = earthTreeMotor[1];
    earthPose[2] = earthTreeMotor[2];
    earthPose[3] = earthTreeMotor[3];

    let marsMotor = PGA2D.normaliozeMotor(PGA2D.geometricProduct(dr, [marsPose[0], marsPose[1], marsPose[2], marsPose[3]]));
    marsPose[0] = marsMotor[0];
    marsPose[1] = marsMotor[1];
    marsPose[2] = marsMotor[2];
    marsPose[3] = marsMotor[3];

    let jupiterMotor = PGA2D.normaliozeMotor(PGA2D.geometricProduct(dr, [jupiterPose[0], jupiterPose[1], jupiterPose[2], jupiterPose[3]]));
    jupiterPose[0] = jupiterMotor[0];
    jupiterPose[1] = jupiterMotor[1];
    jupiterPose[2] = jupiterMotor[2];
    jupiterPose[3] = jupiterMotor[3];

    let saturnMotor = PGA2D.normaliozeMotor(PGA2D.geometricProduct(dr, [saturnPose[0], saturnPose[1], saturnPose[2], saturnPose[3]]));
    saturnPose[0] = saturnMotor[0];
    saturnPose[1] = saturnMotor[1];
    saturnPose[2] = saturnMotor[2];
    saturnPose[3] = saturnMotor[3];


    let uranusMotor = PGA2D.normaliozeMotor(PGA2D.geometricProduct(dr, [uranusPose[0], uranusPose[1], uranusPose[2], uranusPose[3]]));
    uranusPose[0] = uranusMotor[0];
    uranusPose[1] = uranusMotor[1];
    uranusPose[2] = uranusMotor[2];
    uranusPose[3] = uranusMotor[3];

    let neptuneMotor = PGA2D.normaliozeMotor(PGA2D.geometricProduct(dr, [neptunePose[0], neptunePose[1], neptunePose[2], uranusPose[3]]));
    neptunePose[0] = neptuneMotor[0];
    neptunePose[1] = neptuneMotor[1];
    neptunePose[2] = neptuneMotor[2];
    neptunePose[3] = neptuneMotor[3];

    let moonMotor = PGA2D.normaliozeMotor(PGA2D.geometricProduct(dr, [moonPose[0], moonPose[1], moonPose[2], moonPose[3]]));
  // Update Moon Pose
    moonPose[0] = moonMotor[0];
    moonPose[1] = moonMotor[1];
    moonPose[2] = moonMotor[2];
    moonPose[3] = moonMotor[3];

  }, 100); // call every 100 ms
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