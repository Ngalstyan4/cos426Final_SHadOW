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

function initWorld() {

    // Let there be Light !
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xcce0ff, 500, 10000);

    // Let there be someone to confirm there is Light !
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight,1, 10000);
    camera.position.x = 1690;
    camera.position.y = 1220
    camera.position.z = 704;
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
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 400;
    controls.maxDistance = 3000;
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
    scene.add( grid );

    // hover highlight plane
    let cellSideLen = CONFIG.PLAYGROUND.size /CONFIG.PLAYGROUND.divisions
    var geometry = new THREE.PlaneGeometry( cellSideLen, cellSideLen, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    plane = new THREE.Mesh( geometry, material );
    plane.position.set(cellSideLen/2, 0, cellSideLen/2);
    plane.rotation.x = Math.PI / 2;
    scene.add( plane );

    // Add a transparent plane on the floor to easily do raycasting
    var geometry = new THREE.PlaneGeometry( CONFIG.PLAYGROUND.size, CONFIG.PLAYGROUND.size, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0x00ffff, side: THREE.DoubleSide, opacity: 0} );
    material.transparent = true;
    wholePlane = new THREE.Mesh( geometry, material );
    wholePlane.position.set(0,0,0);
    wholePlane.rotation.x = Math.PI / 2;

    scene.add( wholePlane );


    raycaster = new THREE.Raycaster();
}
