"use strict";

var mouse = new THREE.Vector2(200000,2000000), INTERSECTED

function initEventHandlers() {
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    window.addEventListener("resize", onWindowResize, false);

}

// event handlers
function onDocumentMouseMove( event ) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
