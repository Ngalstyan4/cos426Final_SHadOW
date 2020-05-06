"use strict";
import {CONFIG} from './config';
import {camera, loader, plane, raycaster, renderer, scene, wholePlane} from './initWorld';
import {click, clickMouse, del_cube, mouse} from './events';
import {winAnimation} from "./tween";

if (!Detector.webgl) Detector.addGetWebGLMessage();
export var game = {levels: false};

export var meshes = [];
var borders = [];
var win = false;
var constrain = true;

var type = 0;

var blockColor = new THREE.Color(66 / 256, 134 / 256, 244 / 256);

export function deleteBlocks() {
    for (var i = 0; i < meshes.length; i++) {
        scene.remove(meshes[i]);
    }
    for (var i = 0; i < borders.length; i++) {
        scene.remove(borders[i].shape);
    }
    meshes = [];
    borders = [];
}

function notBehindWalls(block) {
    var cellSideLen = CONFIG.PLAYGROUND.size / CONFIG.PLAYGROUND.divisions;
    var sub = 0;
    if (CONFIG.PLAYGROUND.divisions % 2 == 1) {
        sub = 0.5;
    }

    var vec = block.position;
    var shadowX = Math.round((vec.x + CONFIG.PLAYGROUND.size / 2) / cellSideLen - 0.5 + sub);
    var shadowZ = Math.round((vec.z + CONFIG.PLAYGROUND.size / 2) / cellSideLen - 0.5 + sub);

    if (shadowX < 0 || shadowZ < 0)
        return false;
    return true;
}

function checkValidBlock(block) {
    var cellSideLen = CONFIG.PLAYGROUND.size / CONFIG.PLAYGROUND.divisions;
    var sub = 0;
    if (CONFIG.PLAYGROUND.divisions % 2 == 1) {
        sub = 0.5;
    }

    var vec = block.position;
    var shadowX = Math.round((vec.x + CONFIG.PLAYGROUND.size / 2) / cellSideLen - 0.5 + sub);
    var shadowY = Math.round((vec.y - CONFIG.PLAYGROUND.groundLevel) / cellSideLen - 0.5);
    var shadowZ = Math.round((vec.z + CONFIG.PLAYGROUND.size / 2) / cellSideLen - 0.5 + sub);

    if (shadowX < 0 || shadowZ < 0 || shadowY < 0)
        return false;
    if (shadowX >= CONFIG.PLAYGROUND.divisions || shadowY >= CONFIG.PLAYGROUND.height || shadowZ >= CONFIG.PLAYGROUND.divisions)
        return false;
    return true;
}

//all below defined in initWorld BEGIN
// var stats;
// var camera;
// var plane, wholePlane;
// var grid;
// var loader;  // this is a TextureLoader
//all below defined in initWorld END

// the rendering happens here
export function render() {

    let timer = Date.now() * 0.0002;


    // option to auto-rotate camera
    // if (rotate) {
    //     let cameraRadius = Math.sqrt(
    //         camera.position.x * camera.position.x + camera.position.z * camera.position.z;
    //     );
    //     camera.position.x = Math.cos(timer) * cameraRadius;
    //     camera.position.z = Math.sin(timer) * cameraRadius;
    // }
    camera.lookAt(scene.position);
    renderer.render(scene, camera); // render the scene

    let cellSideLen = CONFIG.PLAYGROUND.size / CONFIG.PLAYGROUND.divisions;
    var intersectArray = meshes.slice();
    intersectArray.push(wholePlane);


    if (click.clicked) {
        raycaster.setFromCamera(clickMouse, camera);
        var intersects = raycaster.intersectObjects(intersectArray);
        if (intersects.length > 0) {
            let {x, y, z} = intersects[0].point;
            // change the coordinate system
            y -= CONFIG.PLAYGROUND.groundLevel;

            if (intersects[0].object !== wholePlane) {
                if (del_cube) {
                    for (var i = 0; i < borders.length; i++) {
                        if (borders[i].box === intersects[0].object.position) {
                            scene.remove(borders[i].shape);
                        }
                    }
                    borders = borders.filter(o => o.box !== intersects[0].object.position);

                    scene.remove(intersects[0].object);
                    meshes = meshes.filter(o => o !== intersects[0].object);
                    console.log("check: ", checkWinCondition());
                    if (game.levels && checkWinCondition())
                        winAnimation();
                    click.clicked = false;
                    return;
                }
                var normal = intersects[0].face.normal.normalize();
                if (normal.equals(new THREE.Vector3(0, 1, 0)) || normal.equals(new THREE.Vector3(0, -1, 0))) {
                    x = Math.sign(x) * (Math.abs(x) - Math.abs(x) % cellSideLen + cellSideLen / 2);
                    z = Math.sign(z) * (Math.abs(z) - Math.abs(z) % cellSideLen + cellSideLen / 2);

                    if (normal.equals(new THREE.Vector3(0, 1, 0)))
                        y = y + cellSideLen / 2;
                    else
                        y = y - cellSideLen / 2;
                } else if (normal.equals(new THREE.Vector3(1, 0, 0)) || normal.equals(new THREE.Vector3(-1, 0, 0))) {
                    y = Math.sign(y) * (Math.abs(y) - Math.abs(y) % cellSideLen + cellSideLen / 2);
                    z = Math.sign(z) * (Math.abs(z) - Math.abs(z) % cellSideLen + cellSideLen / 2);

                    if (normal.equals(new THREE.Vector3(1, 0, 0)))
                        x = x + cellSideLen / 2;
                    else
                        x = x - cellSideLen / 2;
                } else if (normal.equals(new THREE.Vector3(0, 0, 1)) || normal.equals(new THREE.Vector3(0, 0, -1))) {
                    x = Math.sign(x) * (Math.abs(x) - Math.abs(x) % cellSideLen + cellSideLen / 2);
                    y = Math.sign(y) * (Math.abs(y) - Math.abs(y) % cellSideLen + cellSideLen / 2);

                    if (normal.equals(new THREE.Vector3(0, 0, 1)))
                        z = z + cellSideLen / 2;
                    else
                        z = z - cellSideLen / 2;
                }
            } else {
                if (del_cube) return;
                x = Math.sign(x) * (Math.abs(x) - Math.abs(x) % cellSideLen + cellSideLen / 2);
                y = y + cellSideLen / 2;
                z = Math.sign(z) * (Math.abs(z) - Math.abs(z) % cellSideLen + cellSideLen / 2);
            }

            var geometry = new THREE.BoxGeometry(cellSideLen, cellSideLen, cellSideLen);
            // change the coordinate system            

            // todo:: consider lambert and Phong materials here
            var material;
            if (type === 2) {
                material = new THREE.MeshBasicMaterial();
                material.color = blockColor.clone();
            } else if (type === 1) {
                material = new THREE.MeshNormalMaterial();
            } else {
                var materials = [1, 2, 3, 4].map(i => new THREE.MeshLambertMaterial({map: loader.load('assets/textures/wood' + i + '.jpg')}));
                let ind = Math.floor(Math.random() * materials.length);
                material = materials[ind];
            }
            var cube = new THREE.Mesh(geometry, material);
            cube.castShadow = true;

            scene.add(cube);
            meshes.push(cube);

            y += CONFIG.PLAYGROUND.groundLevel;
            cube.position.set(x, y, z);

            if (notBehindWalls(cube) && (checkValidBlock(cube) || !constrain)) {
                geometry = new THREE.BoxGeometry(cellSideLen, cellSideLen, cellSideLen);
                geometry.translate(x, y, z);
                // wireframe
                var geo = new THREE.EdgesGeometry(geometry);
                var mat = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 16});
                var wireframe = {shape: new THREE.LineSegments(geo, mat), box: cube.position};
                wireframe.shape.renderOrder = 1; // make sure wireframes are rendered 2nd
                scene.add(wireframe.shape);
                borders.push(wireframe);

                if (game.levels && checkWinCondition())
                    return winAnimation();
            } else {
                scene.remove(cube);
                meshes = meshes.filter(o => o !== cube);
            }
        }
        click.clicked = false;
    }

    /* Render mouse hover effects BEGIN */

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(intersectArray);
    if (intersects.length > 0) {
        let {x, y, z} = intersects[0].point;
        y -= CONFIG.PLAYGROUND.groundLevel;

        if (intersects[0].object !== wholePlane) {
            var normal = intersects[0].face.normal.normalize();
            if (normal.equals(new THREE.Vector3(0, 1, 0)) || normal.equals(new THREE.Vector3(0, -1, 0))) {
                plane.rotation.x = Math.PI / 2;
                plane.rotation.y = 0;
                plane.rotation.z = 0;


                plane.position.x = Math.sign(x) * (Math.abs(x) - Math.abs(x) % cellSideLen + cellSideLen / 2);

                if (normal.equals(new THREE.Vector3(0, 1, 0)))
                    plane.position.y = y + CONFIG.PLAYGROUND.hover_grid_separation;
                else
                    plane.position.y = y - CONFIG.PLAYGROUND.hover_grid_separation;

                plane.position.z = Math.sign(z) * (Math.abs(z) - Math.abs(z) % cellSideLen + cellSideLen / 2);
            } else if (normal.equals(new THREE.Vector3(1, 0, 0)) || normal.equals(new THREE.Vector3(-1, 0, 0))) {
                plane.rotation.x = 0;
                plane.rotation.y = Math.PI / 2;
                plane.rotation.z = Math.PI / 2;

                if (normal.equals(new THREE.Vector3(1, 0, 0)))
                    plane.position.x = x + CONFIG.PLAYGROUND.hover_grid_separation;
                else
                    plane.position.x = x - CONFIG.PLAYGROUND.hover_grid_separation;

                plane.position.y = Math.sign(y) * (Math.abs(y) - Math.abs(y) % cellSideLen + cellSideLen / 2);
                plane.position.z = Math.sign(z) * (Math.abs(z) - Math.abs(z) % cellSideLen + cellSideLen / 2);
            } else if (normal.equals(new THREE.Vector3(0, 0, 1)) || normal.equals(new THREE.Vector3(0, 0, -1))) {
                plane.rotation.x = 0;
                plane.rotation.y = 0;
                plane.rotation.z = 0;

                plane.position.x = Math.sign(x) * (Math.abs(x) - Math.abs(x) % cellSideLen + cellSideLen / 2);
                plane.position.y = Math.sign(y) * (Math.abs(y) - Math.abs(y) % cellSideLen + cellSideLen / 2);

                if (normal.equals(new THREE.Vector3(0, 0, 1)))
                    plane.position.z = z + CONFIG.PLAYGROUND.hover_grid_separation;
                else
                    plane.position.z = z - CONFIG.PLAYGROUND.hover_grid_separation;
            }
        } else {
            plane.rotation.x = Math.PI / 2;
            plane.rotation.y = 0;
            plane.rotation.z = 0;

            plane.position.x = Math.sign(x) * (Math.abs(x) - Math.abs(x) % cellSideLen + cellSideLen / 2);
            plane.position.y = y + CONFIG.PLAYGROUND.hover_grid_separation;
            plane.position.z = Math.sign(z) * (Math.abs(z) - Math.abs(z) % cellSideLen + cellSideLen / 2);
        }

        plane.position.y += CONFIG.PLAYGROUND.groundLevel;
    }
    /* Render mouse hover effects END */


}
