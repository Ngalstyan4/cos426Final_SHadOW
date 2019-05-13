"use strict";

var mouse = new THREE.Vector2(200000,2000000), INTERSECTED;
var del_cube = false;
var click = false;
var potentialClick = false;
var clickMouse = new THREE.Vector2(200000,2000000);

function initEventHandlers() {
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    window.addEventListener("resize", onWindowResize, false);

    window.addEventListener("mousedown", onDocumentMouseDown, false);
    window.addEventListener("mouseup", onDocumentMouseUp, false);

    window.addEventListener("keydown", onKeyDown, false);
    window.addEventListener("keyup", onKeyUp, false);


}

// event handlers
function onDocumentMouseMove( event ) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    // if mouse moved, do not put register a click
    if ( potentialClick && clickMouse.distanceTo(mouse) > 0.00001)
        potentialClick = false;
}

function onDocumentMouseDown( event ) {
    //event.preventDefault();
    clickMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    clickMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    potentialClick = true;
}

function onDocumentMouseUp( event ) {
    //event.preventDefault();
    if (potentialClick) click = true;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown (event) {
    if(event.key == 'd') del_cube = true;
}

function onKeyUp (event) {
    if(event.key == 'd') del_cube = false;
}
