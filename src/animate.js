"use strict";

import {render} from './render';
import {controls} from './initWorld';
import {stats} from './stats';

export function animate() {
    requestAnimationFrame(animate);
    // let time = Date.now();
    // simulate(); // run physics simulation to create new positions of cloth
    TWEEN.update();
    render(); // update position of cloth, compute normals, rotate camera, render the scene
    stats.update();
    controls.update();

}
