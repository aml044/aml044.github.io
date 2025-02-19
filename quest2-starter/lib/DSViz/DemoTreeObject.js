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

import Standard2DPGAPosedVertexColorObject from "quest2-starter/lib/DSViz/Standard2DPGAPosedVertexColorObject.js"

export default class DemoTreeObject extends Standard2DPGAPosedVertexColorObject {
  constructor(device, canvasFormat, pose) {
    let _vertices = new Float32Array([
      // x, y, r, g, b
      //Fire
      0,  0.075, 255.0/255, 150.0/255 , 150.0/255, 1, 
      -0.1, -0.5, 255.0/255, 150.0/255 , 150.0/255, 1,
      0.1, -0.5, 255.0/255, 150.0/255 , 150.0/255, 1,

       -0.052, -0.15, 120.0/255, 0/255, 0/255, 1, // Two triangles for the stem
       -0.052, -0.45, 120/255, 0.0/255, 0.0/255, 1,
       0.052, -0.45, 120/255, 0.0/255, 0.0/255, 1,
       -0.052, -0.15, 120/255, 0.0/255, 0.0/255, 1,
       0.052, -0.45, 120/255, 0.0/255, 0.0/255, 1,
       0.052, -0.15, 120/255, 0.0/255, 0.0/255, 1,
    

       0,  0.075, 150.0/255, 150.0/255 , 150.0/255, 1, // A triangle for a layer of the Xmas tree
       -0.15, -0.4, 150.0/255, 150.0/255 , 150.0/255, 1,
       0.15, -0.4, 150.0/255, 150.0/255 , 150.0/255, 1,
       
    ]); 
    super(device, canvasFormat, _vertices, pose);
    this._interval = 100;
    this._t = 0;
    this._step = 1;
    this._pose0 = [-1, 0, 0.5, 0.5, 0.5, 0.5];
    this._pose1 = [0, 1, -0.5, 0.5, 0.5, 0.5];
  }
  
  updateGeometry() {
    // linearly interpolate the motor
    this._pose[0] = this._pose0[0] * (1 - this._t / this._interval) + this._pose1[0] * this._t / this._interval;
    this._pose[1] = this._pose0[1] * (1 - this._t / this._interval) + this._pose1[1] * this._t / this._interval;
    this._pose[2] = this._pose0[2] * (1 - this._t / this._interval) + this._pose1[2] * this._t / this._interval;
    this._pose[3] = this._pose0[3] * (1 - this._t / this._interval) + this._pose1[3] * this._t / this._interval;
    // interpolating back and forth
    this._t += this._step;
    if (this._t >= 100) {
      this._step = -1;
    }
    else if (this._t <= 0) {
      this._step = 1; 
    }
    super.updateGeometry();
  }
}