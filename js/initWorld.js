"use strict";

// var mouse; // defined in events.js
var stats;
var camera;
var plane, wholePlane;
var grid;
var scene;
var renderer;
var controls;
var raycaster;
var sceneDebugElems = [];
var loader;
var walls = new Array(2);


// Objects to update reference
var wall1Front, wall1Back, wall1shadow, wall2Front, wall2Back, wall2shadow, wall1Light, wall2Light;

function initWorld() {

    // Let there be Light !
    scene = new THREE.Scene();
    loader = new THREE.TextureLoader();
    scene.fog = new THREE.Fog(0xcce0ff, 8000, 10000);

    // Let there be someone to confirm there is Light !
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight,1, 10000);
    camera.position.x = 4447.902;
    camera.position.y = 2707.858
    camera.position.z = 2980.549;
    camera.lookAt(new THREE.Vector3(0,400,0))
    scene.add(camera);


    // todo  gui add handle
    if (CONFIG.DEBUG) {
        // make axes a little longer than the game area
        let axesHelper = new THREE.AxesHelper( CONFIG.PLAYGROUND.size/2 * 1.1 );
        scene.add( axesHelper );
        sceneDebugElems.push(axesHelper);
    }

    // Add renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, devicePixelRatio: 1 });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(scene.fog.color);

    /* DOM init BEGIN */
    var container = document.createElement("div");
    document.body.appendChild(container);

    container.appendChild(renderer.domElement);
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.shadowMap.enabled = true;

    // This gives us stats on how well the simulation is running
    stats = new Stats();
    container.appendChild(stats.domElement);
    /* DOM init END */


    // mouse controls
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.maxPolarAngle = Math.PI/1.5;
    controls.minDistance = 400;
    controls.maxDistance = 6000;
    // controls.target.set(-2000,-CONFIG.PLAYGROUND.wallHeight/2,0);

    // lights (fourth thing you need is lights)

    let light, materials;
    scene.add(new THREE.AmbientLight(0x666666));
    light = new THREE.DirectionalLight(0xdfebff, 1.75);
    light.position.set(50, 200, 100);
    light.position.multiplyScalar(1.3);
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;

    let d = 300;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;
    light.shadow.camera.far = 1000;

    scene.add(light);
    // floor grid
    grid = new THREE.GridHelper( CONFIG.PLAYGROUND.size, CONFIG.PLAYGROUND.divisions );
    grid.translateY(CONFIG.PLAYGROUND.groundLevel);
    scene.add( grid );

    // hover highlight plane
    let cellSideLen = CONFIG.PLAYGROUND.size /CONFIG.PLAYGROUND.divisions;
    var geometry = new THREE.PlaneGeometry( cellSideLen, cellSideLen, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    plane = new THREE.Mesh( geometry, material );
    plane.position.set(cellSideLen/2, CONFIG.PLAYGROUND.groundLevel, cellSideLen/2);
    plane.rotation.x = Math.PI;
    plane.castShadow = true;
    plane.receiveShadow = true;
    scene.add( plane );

    // Add a transparent plane on the floor to easily do raycasting
    var geometry = new THREE.PlaneGeometry( CONFIG.PLAYGROUND.size, CONFIG.PLAYGROUND.size, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0x00ffff, side: THREE.DoubleSide, opacity:0} );
    material.transparent = true;
    wholePlane = new THREE.Mesh( geometry, material );
    wholePlane.position.set(0,CONFIG.PLAYGROUND.groundLevel,0);
    wholePlane.rotation.x = Math.PI / 2;

    scene.add( wholePlane );

    // Add walls BEGIN
    let wallHeight = CONFIG.PLAYGROUND.wallHeight
    let wallGeometry = new THREE.PlaneGeometry( CONFIG.PLAYGROUND.size, wallHeight, 32 );
    let wallFrontMaterial = new THREE.MeshBasicMaterial( {map: loader.load('assets/textures/wall.bmp'), side: THREE.FrontSide} );
    let wallBackMaterial = new THREE.MeshBasicMaterial( {map: loader.load('assets/textures/wall.bmp'), side: THREE.BackSide,transparent:true, opacity:0.3} );
    let wallShadowMaterial = new THREE.ShadowMaterial({transparent: true, opacity : 0.5 });
    wallShadowMaterial.opacity = 0.5;
    wall1Front = new THREE.Mesh( wallGeometry, wallFrontMaterial );
    wall1Back = new THREE.Mesh( wallGeometry, wallBackMaterial );

    wall1shadow = new THREE.Mesh( wallGeometry, wallShadowMaterial );
    // -0.1 corrections in next 2 lines just make sure that an object on
    // the playground does not cast a shadow on the wall next to it
    // if it ends up on a block right next to the edge
    wall1Front.position.set(0,wallHeight/2+CONFIG.PLAYGROUND.groundLevel,-CONFIG.PLAYGROUND.size/2-10);
    wall1Back.position.set(0,wallHeight/2+CONFIG.PLAYGROUND.groundLevel,-CONFIG.PLAYGROUND.size/2-10);

    wall1shadow.position.set(0,wallHeight/2+CONFIG.PLAYGROUND.groundLevel,-CONFIG.PLAYGROUND.size/2-10);
    // wholePlane.rotation.x = Math.PI / 2;
    wall1shadow.castShadow = true;
    wall1shadow.receiveShadow = true;

    scene.add( wall1Front );
    scene.add( wall1Back );

    scene.add( wall1shadow );

    renderer.shadowMapSoft = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowCameraNear = 3;
    renderer.shadowCameraFar = 5000;
    renderer.shadowCameraFov = 50;

    renderer.shadowMapBias = 0.0039;
    renderer.shadowMapDarkness = 0.5;
    renderer.shadowMapWidth = 1024;
    renderer.shadowMapHeight = 1024;

   wall2Front = wall1Front.clone();
   wall2Back = wall1Back.clone();

   wall2Front.rotation.y = Math.PI / 2;
   wall2Back.rotation.y = Math.PI / 2;


   wall2shadow = new THREE.Mesh( wallGeometry, wallShadowMaterial );
   wall2shadow.castShadow = true;
   wall2shadow.receiveShadow = true;
   wall2shadow.rotation.y = Math.PI / 2;
    // -0.1 corrections in next 2 lines just make sure that an object on
    // the playground does not cast a shadow on the wall next to it
    // if it ends up on a block right next to the edge    wall2shadow.position.set(-CONFIG.PLAYGROUND.size/2-0.1,wallHeight/2,0);
    wall2shadow.position.set(-CONFIG.PLAYGROUND.size/2-10,wallHeight/2+CONFIG.PLAYGROUND.groundLevel,0);
    wall2Front.position.set(-CONFIG.PLAYGROUND.size/2-10,wallHeight/2+CONFIG.PLAYGROUND.groundLevel,0);
    wall2Back.position.set(-CONFIG.PLAYGROUND.size/2-10,wallHeight/2+CONFIG.PLAYGROUND.groundLevel,0);

    scene.add( wall2Front );
    scene.add( wall2Back );

    scene.add( wall2shadow );
    // Add walls END

    // Add lights towards the walls BEGIN

    //Create a DirectionalLight and turn on shadows for the light
    wall2Light = new THREE.DirectionalLight( 0xff0000, 0, 100 );
    wall2Light.position.set( CONFIG.PLAYGROUND.size, 0, 0 ); 			//default; light shining from top
    wall2Light.castShadow = true;            // default false
    //Set up shadow properties for the light
    wall2Light.shadow.mapSize.width = 5120;  // default
    wall2Light.shadow.mapSize.height = 5120; // default
    wall2Light.shadow.camera.near = 0.5;    // default
    wall2Light.shadow.camera.left = -CONFIG.PLAYGROUND.size/2;
    wall2Light.shadow.camera.right = CONFIG.PLAYGROUND.size/2;
    wall2Light.shadow.camera.top = wallHeight+CONFIG.PLAYGROUND.groundLevel;
    wall2Light.shadow.camera.bottom = CONFIG.PLAYGROUND.groundLevel;
    wall2Light.shadow.camera.far = CONFIG.PLAYGROUND.size*2;

    scene.add( wall2Light );
    wall1Light = wall2Light.clone();
    wall1Light.position.set( 0, 0, CONFIG.PLAYGROUND.size); 			//default; light shining from top
    scene.add( wall1Light );

    if (CONFIG.HELPER_STRUCTS.wall1camera) {
        let wall1CameraHelper = new THREE.CameraHelper( wall1Light.shadow.camera );
        scene.add(wall1CameraHelper);
    }

    if (CONFIG.HELPER_STRUCTS.wall2camera) {
        let wall2CameraHelper = new THREE.CameraHelper( wall2Light.shadow.camera );
        scene.add(wall2CameraHelper);
    }

    // Add lights towards the walls END



    raycaster = new THREE.Raycaster();
}

function updateWorldSize(){
    scene.remove(grid);

    let cellSideLen = CONFIG.PLAYGROUND.size /CONFIG.PLAYGROUND.divisions;
    var sub = 0;
    if (CONFIG.PLAYGROUND.divisions % 2 == 1){
        sub = -cellSideLen / 2;
    }

    // floor grid
    grid = new THREE.GridHelper( CONFIG.PLAYGROUND.size, CONFIG.PLAYGROUND.divisions );
    grid.translateY(CONFIG.PLAYGROUND.groundLevel);
    grid.translateX(sub);
    grid.translateZ(sub);
    scene.add( grid );

    // hover highlight plane
    var geometry = new THREE.PlaneGeometry( cellSideLen, cellSideLen, 32 );
    plane.position.set(cellSideLen/2, CONFIG.PLAYGROUND.groundLevel, cellSideLen/2);
    plane.geometry = geometry;


    // Add a transparent plane on the floor to easily do raycasting
    geometry = new THREE.PlaneGeometry( CONFIG.PLAYGROUND.size, CONFIG.PLAYGROUND.size, 32 );
    wholePlane.position.set(sub,CONFIG.PLAYGROUND.groundLevel,sub);
    wholePlane.geometry = geometry;

    // Add walls BEGIN
    let wallHeight = CONFIG.PLAYGROUND.wallHeight;
    let wallGeometry = new THREE.PlaneGeometry( CONFIG.PLAYGROUND.size, wallHeight, 32 );
    wall1Front.geometry = wallGeometry;
    wall1Back.geometry = wallGeometry;

    wall1shadow.geometry = wallGeometry;
    // -0.1 corrections in next 2 lines just make sure that an object on
    // the playground does not cast a shadow on the wall next to it
    // if it ends up on a block right next to the edge
    wall1Front.position.set(sub,wallHeight/2+CONFIG.PLAYGROUND.groundLevel,-CONFIG.PLAYGROUND.size/2-10 + sub);
    wall1Back.position.set(sub,wallHeight/2+CONFIG.PLAYGROUND.groundLevel,-CONFIG.PLAYGROUND.size/2-10 + sub);

    wall1shadow.position.set(sub,wallHeight/2+CONFIG.PLAYGROUND.groundLevel,-CONFIG.PLAYGROUND.size/2-10 + sub);
    // wholePlane.rotation.x = Math.PI / 2;

    wall2Front.geometry = wallGeometry;
    wall2Back.geometry = wallGeometry;

    wall2shadow.geometry = wallGeometry;
    // -0.1 corrections in next 2 lines just make sure that an object on
    // the playground does not cast a shadow on the wall next to it
    // if it ends up on a block right next to the edge    wall2shadow.position.set(-CONFIG.PLAYGROUND.size/2-0.1,wallHeight/2,0);
    wall2shadow.position.set(-CONFIG.PLAYGROUND.size/2-10+sub,wallHeight/2+CONFIG.PLAYGROUND.groundLevel,sub);
    wall2Front.position.set(-CONFIG.PLAYGROUND.size/2-10+sub,wallHeight/2+CONFIG.PLAYGROUND.groundLevel,sub);
    wall2Back.position.set(-CONFIG.PLAYGROUND.size/2-10+sub,wallHeight/2+CONFIG.PLAYGROUND.groundLevel,sub);

    // scene.add( wall2 );
    // scene.add( wall2shadow );
    // Add walls END

    //Create a DirectionalLight and turn on shadows for the light
    wall2Light.shadow.camera.left = -CONFIG.PLAYGROUND.size/2 + sub;
    wall2Light.shadow.camera.right = CONFIG.PLAYGROUND.size/2 + sub;
    wall2Light.shadow.camera.top = wallHeight+CONFIG.PLAYGROUND.groundLevel;

    wall1Light.shadow.camera.left = -CONFIG.PLAYGROUND.size/2 + sub;
    wall1Light.shadow.camera.right = CONFIG.PLAYGROUND.size/2 + sub;
    wall1Light.shadow.camera.top = wallHeight+CONFIG.PLAYGROUND.groundLevel;
    wall1Light.position.set(0, 0, CONFIG.PLAYGROUND.size); 			//default; light shining from top
}
