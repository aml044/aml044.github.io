struct VertexData {
  position: vec2<f32>,
  velocity: vec2<f32>,
  rotor: vec4<f32>,
  weights: vec2<f32>,
  edgeOrientation: vec2<f32>,
};

@group(0) @binding(0) var<storage, read> state_in: array<VertexData>;
@group(0) @binding(1) var<storage, read_write> state_out: array<VertexData>;
@group(0) @binding(2) var<uniform> stiffness: f32;


// === Gravity Integration ===
@compute @workgroup_size(256)
fn gravityUpdate(@builtin(global_invocation_id) id : vec3<u32>) {
  
  let i = id.x;
  let g = vec2<f32>(0.0, -9.8); // gravity
  let dt = 0.016;               // timestep (~60 FPS)
  let groundY = -1.0;           // simple ground plane

  let v = state_in[i];

  if (i >= arrayLength(&state_in)) {
  return;
  }

  // Apply stiffness scaling here
  var newVelocity = v.velocity + (g * dt * stiffness);
  var newPosition = v.position + (newVelocity * dt * stiffness);  

  // basic ground collision (lock Y)
  if (newPosition.y < groundY) {
    newPosition.y = groundY;
    newVelocity.y = 0.0;
  }

  // Write result
  state_out[i].position = newPosition;
  state_out[i].velocity = newVelocity;
  state_out[i].rotor = v.rotor;
  state_out[i].weights = v.weights;
  state_out[i].edgeOrientation = v.edgeOrientation;
}
