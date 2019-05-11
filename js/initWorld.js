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
var loader;

function initWorld() {

    // Let there be Light !
    scene = new THREE.Scene();
    loader = new THREE.TextureLoader();
    scene.fog = new THREE.Fog(0xcce0ff, 500, 10000);

    // Let there be someone to confirm there is Light !
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight,1, 10000);
    camera.position.x = 1690;
    camera.position.y = 1220
    camera.position.z = 704;
    camera.lookAt(new THREE.Vector3(0,400,0))
    scene.add(camera);


    // todo  gui add handle
    if (CONFIG.DEBUG) {
        // make axes a little longer than the game area
        var axesHelper = new THREE.AxesHelper( CONFIG.PLAYGROUND.size/2 * 1.1 );
        scene.add( axesHelper );
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
    controls.maxPolarAngle = Math.PI/2;
    controls.minDistance = 400;
    controls.maxDistance = 6000;
    // controls.target.set(-2000,-CONFIG.PLAYGROUND.wallHeight/2,0);

    // lights (fourth thing you need is lights)

    let light, materials;
    // scene.add(new THREE.AmbientLight(0x666666));
    // light = new THREE.DirectionalLight(0xdfebff, 1.75);
    // light.position.set(50, 200, 100);
    // light.position.multiplyScalar(1.3);
    // light.castShadow = true;
    // light.shadow.mapSize.width = 1024;
    // light.shadow.mapSize.height = 1024;
    //
    // let d = 300;
    // light.shadow.camera.left = -d;
    // light.shadow.camera.right = d;
    // light.shadow.camera.top = d;
    // light.shadow.camera.bottom = -d;
    // light.shadow.camera.far = 1000;
    //
    // scene.add(light);
    // floor grid
    grid = new THREE.GridHelper( CONFIG.PLAYGROUND.size, CONFIG.PLAYGROUND.divisions );
    scene.add( grid );

    // hover highlight plane
    let cellSideLen = CONFIG.PLAYGROUND.size /CONFIG.PLAYGROUND.divisions
    var geometry = new THREE.PlaneGeometry( cellSideLen, cellSideLen, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    plane = new THREE.Mesh( geometry, material );
    plane.position.set(cellSideLen/2, 0, cellSideLen/2);
    plane.rotation.x = Math.PI;
    plane.castShadow = true;
    plane.receiveShadow = true;
    scene.add( plane );

    // Add a transparent plane on the floor to easily do raycasting
    var geometry = new THREE.PlaneGeometry( CONFIG.PLAYGROUND.size, CONFIG.PLAYGROUND.size, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0x00ffff, side: THREE.DoubleSide, opacity:0} );
    material.transparent = true;
    wholePlane = new THREE.Mesh( geometry, material );
    wholePlane.position.set(0,0,0);
    wholePlane.rotation.x = Math.PI / 2;

    scene.add( wholePlane );

    // Add walls BEGIN
    let wallHeight = CONFIG.PLAYGROUND.wallHeight
    let wallGeometry = new THREE.PlaneGeometry( CONFIG.PLAYGROUND.size, wallHeight, 32 );
    let wallMaterial = new THREE.MeshBasicMaterial( {color: 0xcccccc, side: THREE.DoubleSide, opacity: 0.8} );
    let wallShadowMaterial = new THREE.ShadowMaterial()
    let wall1 = new THREE.Mesh( wallGeometry, wallMaterial );
    let wall1shadow = new THREE.Mesh( wallGeometry, wallShadowMaterial );
    // -0.1 corrections in next 2 lines just make sure that an object on
    // the playground does not cast a shadow on the wall next to it
    // if it ends up on a block right next to the edge
    wall1.position.set(0,wallHeight/2,-CONFIG.PLAYGROUND.size/2-0.1);
    wall1shadow.position.set(0,wallHeight/2,-CONFIG.PLAYGROUND.size/2-0.1);
    // wholePlane.rotation.x = Math.PI / 2;
    wall1shadow.castShadow = true;
    wall1shadow.receiveShadow = true;

    scene.add( wall1 );
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

   let wall2 = wall1.clone();
   wall2.rotation.y = Math.PI / 2;

   let wall2shadow = new THREE.Mesh( wallGeometry, wallShadowMaterial );
   wall2shadow.castShadow = true;
   wall2shadow.receiveShadow = true;
   wall2shadow.rotation.y = Math.PI / 2;
    // -0.1 corrections in next 2 lines just make sure that an object on
    // the playground does not cast a shadow on the wall next to it
    // if it ends up on a block right next to the edge    wall2shadow.position.set(-CONFIG.PLAYGROUND.size/2-0.1,wallHeight/2,0);
    wall2shadow.position.set(-CONFIG.PLAYGROUND.size/2-0.1,wallHeight/2,0);
    wall2.position.set(-CONFIG.PLAYGROUND.size/2-0.1,wallHeight/2,0);

    scene.add( wall2 );
    scene.add( wall2shadow );
    // Add walls END

    // Add lights towards the walls BEGIN

    //Create a DirectionalLight and turn on shadows for the light
    let wall2Light = new THREE.DirectionalLight( 0xff0000, 1000, 100 );
    wall2Light.position.set( CONFIG.PLAYGROUND.size, 0, 0 ); 			//default; light shining from top
    wall2Light.castShadow = true;            // default false
    //Set up shadow properties for the light
    wall2Light.shadow.mapSize.width = 5120;  // default
    wall2Light.shadow.mapSize.height = 5120; // default
    wall2Light.shadow.camera.near = 0.5;    // default
    wall2Light.shadow.camera.left = -CONFIG.PLAYGROUND.size/2;
    wall2Light.shadow.camera.right = CONFIG.PLAYGROUND.size/2;
    wall2Light.shadow.camera.top = wallHeight;
    wall2Light.shadow.camera.bottom = 0;
    wall2Light.shadow.camera.far = CONFIG.PLAYGROUND.size*2;

    scene.add( wall2Light );
    let wall1Light = wall2Light.clone();
    wall2Light.position.set( 0, 0, CONFIG.PLAYGROUND.size); 			//default; light shining from top
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
