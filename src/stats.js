import Stats from '../libjs/stats.min.js';

let container = document.createElement("div");
document.body.appendChild(container);

// This gives us stats on how well the simulation is running
let stats = new Stats();
container.appendChild(stats.domElement);

export {stats};