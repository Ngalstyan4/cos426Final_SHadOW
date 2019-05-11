"use strict";

if (!Detector.webgl) Detector.addGetWebGLMessage();

var meshes = [];

 //all below defined in initWorld BEGIN
 // var stats;
 // var camera;
 // var plane, wholePlane;
 // var grid;
 // var loader;  // this is a TextureLoader
 //all below defined in initWorld END

// the rendering happens here
function render() {

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

    let cellSideLen = CONFIG.PLAYGROUND.size /CONFIG.PLAYGROUND.divisions;
    var intersectArray = meshes.slice();
    intersectArray.push(wholePlane);

    if (click){
        raycaster.setFromCamera( clickMouse, camera );
        var intersects = raycaster.intersectObjects( intersectArray );
        if ( intersects.length > 0 ) {
            let {x,y,z} = intersects[0].point;
            // change the coordinate system
            y -= CONFIG.PLAYGROUND.groundLevel;

            if (intersects[0].object !== wholePlane){
                var normal = intersects[0].face.normal.normalize();
                if (normal.equals(new THREE.Vector3(0,1,0)) || normal.equals(new THREE.Vector3(0,-1,0))){
                    x =  Math.sign(x) * (Math.abs(x) - Math.abs(x) % cellSideLen+cellSideLen/2);
                    z =  Math.sign(z) * (Math.abs(z) - Math.abs(z) % cellSideLen+cellSideLen/2);

                    if (normal.equals(new THREE.Vector3(0,1,0)))
                        y = y + cellSideLen/2;
                    else
                        y = y - cellSideLen/2;
                }
                else if (normal.equals(new THREE.Vector3(1,0,0)) || normal.equals(new THREE.Vector3(-1,0,0))){
                    y =  Math.sign(y) * (Math.abs(y) - Math.abs(y) % cellSideLen +cellSideLen/2);
                    z =  Math.sign(z) * (Math.abs(z) - Math.abs(z) % cellSideLen+cellSideLen/2);

                    if (normal.equals(new THREE.Vector3(1,0,0)))
                        x = x + cellSideLen/2;
                    else
                        x = x - cellSideLen/2;
                }
                else if (normal.equals(new THREE.Vector3(0,0,1)) || normal.equals(new THREE.Vector3(0,0,-1))){
                    x =  Math.sign(x) * (Math.abs(x) - Math.abs(x) % cellSideLen+cellSideLen/2);
                    y =  Math.sign(y) * (Math.abs(y) - Math.abs(y) % cellSideLen + cellSideLen/2);

                    if (normal.equals(new THREE.Vector3(0,0,1)))
                        z = z + cellSideLen/2;
                    else
                        z = z - cellSideLen/2;
                }
            }
            else{
                x =  Math.sign(x) * (Math.abs(x) - Math.abs(x) % cellSideLen+cellSideLen/2);
                y = y + cellSideLen/2;
                z =  Math.sign(z) * (Math.abs(z) - Math.abs(z) % cellSideLen+cellSideLen/2);
            }

            var geometry = new THREE.BoxGeometry( cellSideLen, cellSideLen, cellSideLen );
            // todo:: consider lambert and Phong materials here
            var materials = [1,2,3,4].map(i => new THREE.MeshLambertMaterial( {map: loader.load('assets/textures/wood' + i + '.jpg')} ));
            let ind = Math.floor(Math.random() * materials.length);
            var cube = new THREE.Mesh( geometry, materials[ind] );
            cube.castShadow =true;
            scene.add( cube );

            meshes.push(cube);
            // change the coordinate system
            y += CONFIG.PLAYGROUND.groundLevel;
            cube.position.set(x,y,z);
        }
        click = false;
    }

    /* Render mouse hover effects BEGIN */
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( intersectArray );
    if ( intersects.length > 0 ) {
        let {x,y,z} = intersects[0].point;
        y -= CONFIG.PLAYGROUND.groundLevel;

        var separation = 10;
        if (intersects[0].object !== wholePlane){
            var normal = intersects[0].face.normal.normalize();
            if (normal.equals(new THREE.Vector3(0,1,0)) || normal.equals(new THREE.Vector3(0,-1,0))){
                plane.rotation.x = 3.14/2;
                plane.rotation.y = 0;
                plane.rotation.z = 0;


                plane.position.x =  Math.sign(x) * (Math.abs(x) - Math.abs(x) % cellSideLen+cellSideLen/2);

                if (normal.equals(new THREE.Vector3(0,1,0)))
                    plane.position.y =  y + separation;
                else
                    plane.position.y =  y - separation;

                plane.position.z =  Math.sign(z) * (Math.abs(z) - Math.abs(z) % cellSideLen+cellSideLen/2);
            }
            else if (normal.equals(new THREE.Vector3(1,0,0)) || normal.equals(new THREE.Vector3(-1,0,0))){
                plane.rotation.x = 0;
                plane.rotation.y = 3.14/2;
                plane.rotation.z = 3.14/2;

                if (normal.equals(new THREE.Vector3(1,0,0)))
                    plane.position.x =  x + separation;
                else
                    plane.position.x =  x - separation;

                plane.position.y =  Math.sign(y) * (Math.abs(y) - Math.abs(y) % cellSideLen +cellSideLen/2);
                plane.position.z =  Math.sign(z) * (Math.abs(z) - Math.abs(z) % cellSideLen+cellSideLen/2);
            }
            else if (normal.equals(new THREE.Vector3(0,0,1)) || normal.equals(new THREE.Vector3(0,0,-1))){
                plane.rotation.x = 0;
                plane.rotation.y = 0;
                plane.rotation.z = 0;

                plane.position.x =  Math.sign(x) * (Math.abs(x) - Math.abs(x) % cellSideLen+cellSideLen/2);
                plane.position.y =  Math.sign(y) * (Math.abs(y) - Math.abs(y) % cellSideLen + cellSideLen/2);

                if (normal.equals(new THREE.Vector3(0,0,1)))
                    plane.position.z =  z + separation;
                else
                    plane.position.z =  z - separation;
            }
        }
        else{
            plane.rotation.x = 3.14/2;
            plane.rotation.y = 0;
            plane.rotation.z = 0;

            plane.position.x =  Math.sign(x) * (Math.abs(x) - Math.abs(x) % cellSideLen+cellSideLen/2);
            plane.position.y =  y + separation;
            plane.position.z =  Math.sign(z) * (Math.abs(z) - Math.abs(z) % cellSideLen+cellSideLen/2);
        }

        plane.position.y += CONFIG.PLAYGROUND.groundLevel;
    }
    /* Render mouse hover effects END */


}
