function LinearInterpolate(A, B, t) {
    return A * (1 - t) + B * t;
  }

  let easeineaseout = (t) => {
    if (t > 0.5) return t * (4 - 2 * t) -1;
    else return 2 * t * t;
  }

  console.log(LinearInterpolate(0, 10, 0.5));


let pose0 = [1, 0];
let pose1 = [0, 1];
var pose = [pose0[0], pose0[1], 0, 0, 1, 1, 0.25, 0.25];
var pose = [pose0[0], pose0[1], 0, 0, 1, 1, 0.25, 0.25];
pose = new Float32Array(pose);
await renderer.appendSceneObject(new Standard2DGAPosedVertexObject(renderer._device, renderer._canvasFormat, vertices, pose));

let interval = 100;
var t = 0;
let step = 1;
setInterval(() => { 
  renderer.render();
  // linearly interpolate the motor
  pose[0] = pose0[0] * (1 - t / interval) + pose1[0] * t / interval;
  pose[1] = pose0[1] * (1 - t / interval) + pose1[1] * t / interval;
  pose[2] = pose0[2] * (1 - t / interval) + pose1[2] * t / interval;
  pose[3] = pose0[3] * (1 - t / interval) + pose1[3] * t / interval;
  t += step;
  if (t >= 100) {
    step = -1;
  }
  else if (t <= 0) {
  step = 1; 
  }
}, interval); // call every 100 ms