"use strict";

if (!Detector.webgl) Detector.addGetWebGLMessage();

var meshes = [];
var goal = [];
var borders = [];
var win = false;
var constrain = true;

var type = 0;

var blockColor = new THREE.Color(0,0,0);

function deleteBlocks(){
    for (var i = 0; i<meshes.length;i++){
        scene.remove(meshes[i]);
    }
    for (var i = 0; i<borders.length;i++){
        scene.remove(borders[i].shape);
    }
    meshes = [];
    borders = [];
}

function deleteGoal(){
    for (var i = 0; i<goal.length;i++){
        scene.remove(goal[i]);
    }
    goal = [];
}


function checkWinCondition(){
    var walls = new Array(2);
    for (var r = 0; r<2; r++){
        walls[r] = new Array(target[0].length);
        for (var i = 0; i< target[0].length; i++){
            walls[r][i] = new Array(target[0][0].length);
            for (var j = 0; j< walls[0][i].length; j++){
                walls[r][i][j] = false;
            }
        }
    }

    for (var i = 0; i< meshes.length; i++){
        var cellSideLen = CONFIG.PLAYGROUND.size /CONFIG.PLAYGROUND.divisions;
        var sub = 0;
        if (CONFIG.PLAYGROUND.divisions % 2 == 1){
            sub = 0.5;
        }

        var vec = meshes[i].position;
        var shadowX = Math.round((vec.x + CONFIG.PLAYGROUND.size/2)/cellSideLen-0.5+sub);
        var shadowY = Math.round((vec.y-CONFIG.PLAYGROUND.groundLevel) / cellSideLen-0.5);
        var shadowZ = Math.round((vec.z + CONFIG.PLAYGROUND.size/2)/cellSideLen-0.5+sub);

        if (shadowX >=0 && shadowX < walls[0][0].length && shadowY >=0 && shadowY < walls[0].length)       
            walls[0][shadowY][shadowX]= true;
        if (shadowZ >=0 && shadowZ < walls[0][0].length && shadowY >=0 && shadowY < walls[0].length)  
            walls[1][shadowY][shadowZ]= true;
    }

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

function notBehindWalls(block){
    var cellSideLen = CONFIG.PLAYGROUND.size /CONFIG.PLAYGROUND.divisions;
    var sub = 0;
    if (CONFIG.PLAYGROUND.divisions % 2 == 1){
        sub = 0.5;
    }

    var vec = block.position;
    var shadowX = Math.round((vec.x + CONFIG.PLAYGROUND.size/2)/cellSideLen-0.5+sub);
    var shadowZ = Math.round((vec.z + CONFIG.PLAYGROUND.size/2)/cellSideLen-0.5+sub);

    if (shadowX<0 || shadowZ<0)
        return false;
    return true;
}

function checkValidBlock(block){
    var cellSideLen = CONFIG.PLAYGROUND.size /CONFIG.PLAYGROUND.divisions;
    var sub = 0;
    if (CONFIG.PLAYGROUND.divisions % 2 == 1){
        sub = 0.5;
    }

    var vec = block.position;
    var shadowX = Math.round((vec.x + CONFIG.PLAYGROUND.size/2)/cellSideLen-0.5+sub);
    var shadowY = Math.round((vec.y-CONFIG.PLAYGROUND.groundLevel) / cellSideLen-0.5);
    var shadowZ = Math.round((vec.z + CONFIG.PLAYGROUND.size/2)/cellSideLen-0.5+sub);

    if (shadowX<0 || shadowZ<0 || shadowY<0)
        return false;
    if (shadowX>=CONFIG.PLAYGROUND.divisions || shadowY>=CONFIG.PLAYGROUND.height || shadowZ>=CONFIG.PLAYGROUND.divisions)
        return false;
    return true;
}

function addGoal(targets){
    var cellSideLen = CONFIG.PLAYGROUND.size /CONFIG.PLAYGROUND.divisions;
    var sub = 0;
    if (CONFIG.PLAYGROUND.divisions % 2 == 1){
        sub = -cellSideLen / 2;
    }
    var sep = -2;
    for(var i=0; i< targets[0].length; i++){
        for (var j=0; j< targets[0][i].length; j++){
            if (targets[0][i][j]===true){
                var geometry = new THREE.PlaneGeometry( cellSideLen, cellSideLen, 32 );
                var material = new THREE.MeshNormalMaterial({transparent:true, opacity: 0.8});
                var shadowMaterial = new THREE.ShadowMaterial();
                shadowMaterial.opacity = 0.3;
                var goalPlane = new THREE.Mesh( geometry, material );
                var goalPlaneShadow = new THREE.Mesh(geometry, shadowMaterial);

                goalPlane.position.set(cellSideLen*j + cellSideLen/2-CONFIG.PLAYGROUND.size/2+sub, CONFIG.PLAYGROUND.groundLevel+cellSideLen*i + cellSideLen/2,-CONFIG.PLAYGROUND.size/2 +sep+sub);
                goalPlaneShadow.position.set(cellSideLen*j + cellSideLen/2 -CONFIG.PLAYGROUND.size/2+sub, CONFIG.PLAYGROUND.groundLevel+cellSideLen*i + cellSideLen/2,-CONFIG.PLAYGROUND.size/2 +sep+sub);

                goalPlaneShadow.castShadow = true;
                goalPlaneShadow.receiveShadow = true;
                scene.add( goalPlane );
                scene.add( goalPlaneShadow );

                goal.push(goalPlane);
                goal.push(goalPlaneShadow);
            }

            if (targets[1][i][j]===true){
                var geometry = new THREE.PlaneGeometry( cellSideLen, cellSideLen, 32 );
                var material = new THREE.MeshNormalMaterial({transparent:true, opacity: 0.8});
                var shadowMaterial = new THREE.ShadowMaterial({transparent:true});
                shadowMaterial.opacity = 0.3;
                var goalPlane = new THREE.Mesh( geometry, material );
                var goalPlaneShadow = new THREE.Mesh(geometry, shadowMaterial);

                goalPlane.position.set(-CONFIG.PLAYGROUND.size/2 +sep+sub, CONFIG.PLAYGROUND.groundLevel+cellSideLen*i + cellSideLen/2,cellSideLen*j + cellSideLen/2 -CONFIG.PLAYGROUND.size/2+sub);
                goalPlaneShadow.position.set(-CONFIG.PLAYGROUND.size/2 +sep+sub, CONFIG.PLAYGROUND.groundLevel+cellSideLen*i + cellSideLen/2,cellSideLen*j + cellSideLen/2 -CONFIG.PLAYGROUND.size/2+sub);

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
                    for (var i = 0; i<borders.length; i++){
                        if (borders[i].box === intersects[0].object.position){
                            scene.remove(borders[i].shape);
                        }
                    }
                    borders = borders.filter(o => o.box !== intersects[0].object.position);

                    scene.remove(intersects[0].object);
                    meshes = meshes.filter(o => o !==intersects[0].object);

                    if (game)
                        checkWinCondition();
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
            // change the coordinate system            

            // todo:: consider lambert and Phong materials here
            var material;
            if (type === 2){
                material = new THREE.MeshBasicMaterial();
                material.color = blockColor.clone();
            }
            else if (type === 1){
                material = new THREE.MeshNormalMaterial();
            }
            else{
                var materials = [1,2,3,4].map(i => new THREE.MeshLambertMaterial( {map: loader.load('assets/textures/wood' + i + '.jpg')} ));
                let ind = Math.floor(Math.random() * materials.length);
                material = materials[ind];
            }
            var cube = new THREE.Mesh( geometry, material );
            cube.castShadow =true;

            scene.add( cube );
            meshes.push(cube);

            y += CONFIG.PLAYGROUND.groundLevel;
            cube.position.set(x,y,z);

            if (notBehindWalls(cube) && (checkValidBlock(cube) || !constrain)){
                geometry = new THREE.BoxGeometry( cellSideLen, cellSideLen, cellSideLen );
                geometry.translate(x,y,z);
                // wireframe
                var geo = new THREE.EdgesGeometry( geometry );
                var mat = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 16 } );
                var wireframe = { shape: new THREE.LineSegments( geo, mat ) , box: cube.position};
                wireframe.shape.renderOrder = 1; // make sure wireframes are rendered 2nd
                scene.add( wireframe.shape );
                borders.push(wireframe);

                if (game){
                    checkWinCondition();
                }
            }
            else{
                scene.remove(cube);
                meshes = meshes.filter(o => o !==cube);
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
