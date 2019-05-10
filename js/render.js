"use strict";

if (!Detector.webgl) Detector.addGetWebGLMessage();

 //all below defined in initWorld BEGIN
 // var stats;
 // var camera;
 // var plane, wholePlane;
 // var grid;
 //all below defined in initWorld END

// the rendering happens here
function render() {
    let timer = Date.now() * 0.0002;
    // option to auto-rotate camera
    // if (rotate) {
    //     let cameraRadius = Math.sqrt(
    //         camera.position.x * camera.position.x + camera.position.z * camera.position.z
    //     );
    //     camera.position.x = Math.cos(timer) * cameraRadius;
    //     camera.position.z = Math.sin(timer) * cameraRadius;
    // }
    camera.lookAt(scene.position);
    renderer.render(scene, camera); // render the scene


    /* Render mouse hover effects BEGIN */
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( [wholePlane] );
    if ( intersects.length > 0 ) {
        let {x,z} = intersects[0].point;

        plane.position.x =  Math.sign(x) * (Math.abs(x) - Math.abs(x) % 125+125/2);
        plane.position.z =  Math.sign(z) * (Math.abs(z) - Math.abs(z) % 125+125/2);
    }
    /* Render mouse hover effects END */


}
