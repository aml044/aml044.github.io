/* 
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

// TODO 3: Define a struct to store a particle
struct Particle {
  pos: vec2f, //Current position
  initPos: vec2f, //Initial Position (respawning)
  vel: vec2f, //Velocity
  initVel: vec2f, //for respanwing
  lifespan: f32, //Current lifespan
  initLifespan: f32 //for respanwing
}
struct VelConfig {
  velMode: u32,  
}
// TODO 4: Write the bind group spells here using array<Particle>
// name the binded variables particlesIn and particlesOut
@group(0) @binding(0) var<storage, read> particlesIn: array<Particle>;
@group(0) @binding(1) var<storage, read_write> particlesOut: array<Particle>;
@group(0) @binding(2) var<uniform> velConfig: VelConfig;

struct VertexOut {
  @builtin(position) pos: vec4f,
  @location(0) alpha: f32,
};

@vertex
fn vertexMain(@builtin(instance_index) idx: u32, @builtin(vertex_index) vIdx: u32) -> VertexOut {
  let particle = particlesIn[idx].pos;
  let lifespanFactor = particlesIn[idx].lifespan / particlesIn[idx].initLifespan; // normalize lifespan [0,1]
  let baseSize = 0.0125;
  let size = baseSize * lifespanFactor;

  let pi = 3.14159265;
  let theta = 2. * pi / 8. * f32(vIdx);
  let x = cos(theta) * size;
  let y = sin(theta) * size;

  var out: VertexOut;
  out.pos = vec4f(vec2f(x + particle[0], y + particle[1]), 0, 1);
  out.alpha = lifespanFactor;
  return out;
}

@fragment
fn fragmentMain(@location(0) alpha: f32) -> @location(0) vec4f {
  return vec4f(238.0 / 255.0, 118.0 / 255.0, 35.0 / 255.0, alpha);
}
@compute @workgroup_size(256)
fn computeMain(@builtin(global_invocation_id) global_id: vec3u) {
  // TODO 6: Revise the compute shader to update the particles using the velocity
  let idx = global_id.x;
  
  if (idx < arrayLength(&particlesIn)) {
    var p = particlesIn[idx];
    
    //Apply Gravity
    let gravity = vec2f(0.0, -0.0005);
    p.vel += gravity;

    //Apply Wind
    let wind = generateWind(p.pos.y, 1.5, 0.00005);
    p.vel += wind;

    //Update position and lifespan
    p.pos += p.vel;
    p.lifespan -= 1.0;

    if (p.lifespan <= 0.0 || p.pos.x < -1.0 || p.pos.x > 1.0 || p.pos.y < -1.0 || p.pos.y > 1.0) {
      p.pos = p.initPos;
      p.lifespan = p.initLifespan;

      if (velConfig.velMode == 0u) {
        let randX = (f32(idx % 10) / 50.0) - 0.1;
        let randY = (f32((idx * 2) % 10) / 50.0) - 0.1;
        p.vel = vec2f(randX, randY);
      } else if ( velConfig.velMode == 1u ) {
        p.vel = vec2f(0.0, 0.0);
      } else if (velConfig.velMode == 2u) {
        let angle = atan2(p.pos.y, p.pos.x);
        let speed = 0.02;
        let tangent = vec2f(-sin(angle), cos(angle)); // 90° to radial direction
        p.vel = tangent * speed;
      }
    }
    particlesOut[idx] = p;
    }
}

fn generateWind(time: f32, frequency: f32, strength: f32) -> vec2f {
  let angle = sin(time * frequency) * 3.14159265;
  return vec2<f32>(cos(angle), sin(angle)) * strength;
}