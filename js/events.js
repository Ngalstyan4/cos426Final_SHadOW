"use strict";

var mouse = new THREE.Vector2(200000,2000000), INTERSECTED;

var click = false;
var clickMouse = new THREE.Vector2(200000,2000000);

function initEventHandlers() {
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    window.addEventListener("resize", onWindowResize, false);

    window.addEventListener("mousedown", onDocumentMouseDown, false);
}

// event handlers
function onDocumentMouseMove( event ) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onDocumentMouseDown( event ) {
    event.preventDefault();
    clickMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    clickMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    click = true;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
