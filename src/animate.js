"use strict";

import {render} from './render';
import {stats, controls} from './initWorld';
export function animate() {
    requestAnimationFrame(animate);
    // let time = Date.now();
    // simulate(); // run physics simulation to create new positions of cloth
    TWEEN.update();
    render(); // update position of cloth, compute normals, rotate camera, render the scene
    stats.update();
    controls.update();

}
