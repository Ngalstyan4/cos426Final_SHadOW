"use strict";

if (!Detector.webgl) Detector.addGetWebGLMessage();

var meshes = [];
var goal = [];
var win = false;

function deleteBlocks(){
    for (var i = 0; i<meshes.length;i++){
        scene.remove(meshes[i]);
    }
    meshes = [];
}

function deleteGoal(){
    for (var i = 0; i<goal.length;i++){
        scene.remove(goal[i]);
    }
    goal = [];
}


function checkWinCondition(){
    for (var i = 0; i< walls[0].length; i++){
        for (var j = 0; j< walls[0][i].length; j++){
            if (walls[0][i][j] !== target[0][i][j])
                return;
            if (walls[1][i][j] !== target[1][i][j])
                return;
        }
    }
    win = true;
}

function addGoal(targets){
    for(var i=0; i< targets[0].length; i++){
        for (var j=0; j< targets[0][i].length; j++){
            if (targets[0][i][j]===true){
                var cellSideLen = CONFIG.PLAYGROUND.size /CONFIG.PLAYGROUND.divisions
                var geometry = new THREE.PlaneGeometry( cellSideLen, cellSideLen, 32 );
                var material = new THREE.MeshNormalMaterial();
                var shadowMaterial = new THREE.ShadowMaterial();
                shadowMaterial.opacity = 0.3;
                var goalPlane = new THREE.Mesh( geometry, material );
                var goalPlaneShadow = new THREE.Mesh(geometry, shadowMaterial);

                goalPlane.position.set(cellSideLen*j + cellSideLen/2 -CONFIG.PLAYGROUND.size/2, CONFIG.PLAYGROUND.groundLevel+cellSideLen*i + cellSideLen/2,-CONFIG.PLAYGROUND.size/2 +10);
                goalPlaneShadow.position.set(cellSideLen*j + cellSideLen/2 -CONFIG.PLAYGROUND.size/2, CONFIG.PLAYGROUND.groundLevel+cellSideLen*i + cellSideLen/2,-CONFIG.PLAYGROUND.size/2 +10);

                goalPlaneShadow.castShadow = true;
                goalPlaneShadow.receiveShadow = true;
                scene.add( goalPlane );
                scene.add( goalPlaneShadow );

                goal.push(goalPlane);
                goal.push(goalPlaneShadow);
            }

            if (targets[1][i][j]===true){
                var cellSideLen = CONFIG.PLAYGROUND.size /CONFIG.PLAYGROUND.divisions
                var geometry = new THREE.PlaneGeometry( cellSideLen, cellSideLen, 32 );
                var material = new THREE.MeshNormalMaterial();
                var shadowMaterial = new THREE.ShadowMaterial();
                shadowMaterial.opacity = 0.3;
                var goalPlane = new THREE.Mesh( geometry, material );
                var goalPlaneShadow = new THREE.Mesh(geometry, shadowMaterial);

                goalPlane.position.set(-CONFIG.PLAYGROUND.size/2 +10, CONFIG.PLAYGROUND.groundLevel+cellSideLen*i + cellSideLen/2,cellSideLen*j + cellSideLen/2 -CONFIG.PLAYGROUND.size/2);
                goalPlaneShadow.position.set(-CONFIG.PLAYGROUND.size/2 +10, CONFIG.PLAYGROUND.groundLevel+cellSideLen*i + cellSideLen/2,cellSideLen*j + cellSideLen/2 -CONFIG.PLAYGROUND.size/2);

                goalPlane.rotation.y = Math.PI/2;
                goalPlaneShadow.rotation.y = Math.PI/2;

                goalPlaneShadow.castShadow = true;
                goalPlaneShadow.receiveShadow = true;
                scene.add( goalPlane );
                scene.add( goalPlaneShadow );

                goal.push(goalPlane);
                goal.push(goalPlaneShadow);
            }
        }
    }
}

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

    if (win){

        var from = {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z
        };

        var to1 = {
            x: CONFIG.PLAYGROUND.size*2,
            y: 0,
            z:0
        };
        var to2 = {
            x: 0,
            y: 0,
            z:CONFIG.PLAYGROUND.size*2
        };
        var final =  {
            x:4447.902,
            y: 2707.858,
            z: 2980.549
        }
        var tween1 = new TWEEN.Tween(from)
            .to(to1, 600)
            .easing(TWEEN.Easing.
                Circular.Out)
            .onUpdate(function () {
            camera.position.set(this.x, this.y, this.z);
            camera.lookAt(new THREE.Vector3(0, 0, 0));
        })
            .onComplete(function () {
            camera.lookAt(new THREE.Vector3(0, 0, 0));


            var tween2 = new TWEEN.Tween(to1).delay(800)
            .to(to2, 600)
            .easing(TWEEN.Easing.
                Circular.Out)
            .onUpdate(function () {
            camera.position.set(this.x, this.y, this.z);
            camera.lookAt(new THREE.Vector3(0, 0, 0));
        })
        .onComplete(function() {
            camera.lookAt(new THREE.Vector3(0, 0, 0));

            var tween3 = new TWEEN.Tween(to2).delay(800)
            .to(final, 800)
            .easing(TWEEN.Easing.Circular.Out)
            .onUpdate(function () {
            camera.position.set(this.x, this.y, this.z);
            camera.lookAt(new THREE.Vector3(0, 0, 0));
        })
            .onComplete(function () {
            camera.lookAt(new THREE.Vector3(0, 0, 0));
            $('#exampleModalLabel').text("Congratulations!!");
            $('.modal-body').text("You Won!");
            $('#gameModal').modal('show');
         })
            .start();

        })
            .start();
        })
            .start();        win = false;
    }

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

                if(del_cube) {
                    console.log(intersects, intersectArray, intersectArray.indexOf(intersects[0].object));
                    scene.remove(intersects[0].object);
                    meshes = meshes.filter(o => o !==intersects[0].object);
                    click = false;
                    return;
                }
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
                if(del_cube) return;
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
            
            if (game){
                var shadowX = Math.round((x + CONFIG.PLAYGROUND.size/2)/cellSideLen-0.5);
                var shadowY = Math.round((y-CONFIG.PLAYGROUND.groundLevel) / cellSideLen-0.5);
                var shadowZ = Math.round((z + CONFIG.PLAYGROUND.size/2)/cellSideLen-0.5);

                if (shadowX >=0 && shadowX < walls[0][0].length && shadowY >=0 && shadowY < walls[0].length)       
                    walls[0][shadowY][shadowX]= true;
                if (shadowZ >=0 && shadowZ < walls[0][0].length && shadowY >=0 && shadowY < walls[0].length)  
                    walls[1][shadowY][shadowZ]= true;

                checkWinCondition();
            }
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
