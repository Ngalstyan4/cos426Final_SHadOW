"use strict";
//all below defined in initWorld BEGIN
// var camera;
//all below defined in initWorld END

var reader = new (function(){
    this.filename = "none";

})();

function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}

var saveString = null;
var guiControls;

function initGui() {

    var guiEnabled = true;

    if (guiEnabled) {
        // GUI properties
        guiControls = new (function() {
            this.camera = camera.position;
            this.debug = CONFIG.DEBUG;
            this.blockColor = 0x4286f4;
            this.newLevel = "";
            this.gridSize = CONFIG.PLAYGROUND.divisions;
            this.height = nextHeight;
            this.constrainBlocks=true;
            this.remove = false;
        })();

        // GUI elements
        let gui = new dat.GUI();
        gui.add({saveLevel}, "saveLevel").name("Save Level");
        gui.add(guiControls, "debug")
        .name("Debug Mode")
        .onChange(v =>
            {
                CONFIG.DEBUG = v;
                if (CONFIG.DEBUG)
                    sceneDebugElems.forEach(e => scene.add(e));
                else
                    sceneDebugElems.forEach(e => scene.remove(e));

            })
        .listen();
        let cameraControls = gui.addFolder("Camera");

        cameraControls.add(guiControls.camera, "x").step(0.001).name("Camera X")
        .listen();
        cameraControls.add(guiControls.camera, "y").step(0.001).name("Camera Y").listen();
        cameraControls.add(guiControls.camera, "z").step(0.001).name("Camera Z").listen();

        let sizeControl = gui.addFolder("Size");
        sizeControl.add(guiControls, "gridSize", 5, 25)
            .step(1)
            .name("Grid Size")
            .onChange(function(value) {
                nextDivision = value;
                if (reader.filename != "none"){
                    //message this cannot be done in game mode
                    $('#exampleModalLabel').text("Sorry!");
                    $('.modal-body').text("You cannot change the map size in game mode. Try changing to level \"none\"");
                    $('#gameModal').modal('show');
                    return;
                }
                CONFIG.PLAYGROUND.divisions = value;
                CONFIG.PLAYGROUND.wallHeight = CONFIG.PLAYGROUND.size / CONFIG.PLAYGROUND.divisions * CONFIG.PLAYGROUND.height;
                deleteBlocks();
                updateWorldSize();
            });

        sizeControl.add(guiControls, "height", 4, 20)
            .step(1)
            .name("Height")
            .onChange(function(value) {
                nextHeight = value;
                if (reader.filename != "none"){
                    //message this cannot be done in game mode
                    $('#exampleModalLabel').text("Sorry!");
                    $('.modal-body').text("You cannot change the map height in game mode. Try changing to level \"none\"");
                    $('#gameModal').modal('show');
                    return;
                }
                CONFIG.PLAYGROUND.height = value;
                CONFIG.PLAYGROUND.wallHeight = CONFIG.PLAYGROUND.size / CONFIG.PLAYGROUND.divisions * CONFIG.PLAYGROUND.height;
                updateWorldSize();
            });

        let saveState = gui.addFolder("Save Settings");
        saveState.add({saveWorld}, "saveWorld").name("Save State to File");
        saveState.add({loadWorld}, "loadWorld").name("Load State to File");

        let appearanceControls = gui.addFolder("Creative Tools");
        appearanceControls.open();
        appearanceControls.add({textureCube}, "textureCube").name("Texture Cube");
        appearanceControls.add({normalCube}, "normalCube").name("Normal Cube");
        appearanceControls.add({colorCube}, "colorCube").name("Color Cube");

        appearanceControls
        .addColor(guiControls, "blockColor")
        .name("Block Color")
        .onChange(function(value) {
            console.log(value);
            blockColor = new THREE.Color(value);
        });

        let gameSettings = gui.addFolder("Game Settings");
        gameSettings.open();
        gameSettings.add(reader, 'filename', [ 'none', 'line', '2-3', '2-5', 'tensorflow', 'CHALLENGE', 'House-Duck', 'Heart-Diamond','bighouse','thankyou'] ).name("CHOOSE LEVEL").
        onChange(v => {
            reader.filename = v;
            setLevel(v + ".txt")
        }).listen();

        gameSettings.add(guiControls, "constrainBlocks")
        .name("Limit to Grid")
        .onChange(function(value) {
            constrain = value;
        });

        gui.add(guiControls, "remove")
        .name("Remove Blocks")
        .onChange(function(value) {
            del_cube = value;
        });
    }
}

function saveLevel() {
    var walls = new Array(2);
    for (var r = 0; r<2; r++){
        walls[r] = new Array(CONFIG.PLAYGROUND.height);
        for (var i = 0; i< CONFIG.PLAYGROUND.height; i++){
            walls[r][i] = new Array(CONFIG.PLAYGROUND.divisions);
            for (var j = 0; j< CONFIG.PLAYGROUND.divisions; j++){
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


    let res = CONFIG.PLAYGROUND.divisions + " " + CONFIG.PLAYGROUND.height + "\n";
    res += walls[0].reverse().map(wall => wall.map(a => a? "X":".").reduce((a,b) => a + b )).reduce((a,b) => a+"\n"+b);
    res += "\n\n";
    res += walls[1].reverse().map(wall => wall.reverse().map(a => a? "X":".").reduce((a,b) => a + b )).reduce((a,b) => a+"\n"+b);
    $('#exampleModalLabel').text("This is encoding of the level you created!!");
    let htm = "<p>Please share it with us in the feedback form <a target='blank' href='https://forms.gle/Zjo4zGi1SFiV4siv6'>here</a><!/p><textarea style='width:200px; height:300px;' type='text' class='form-control classname' id='copy-input' cols=40 rows=20readonly>"+res+"</textarea>";
    //htm += "<a href='#' id='copy' data-clipboard-target='#copy-input' class='btn btn-default'>Copy input content to clipboard</a>"
    $('.modal-body').html(htm);
    $('#gameModal').modal('show');
    //var clipboard = new Clipboard('#copy-input');
}

function colorCube(){
    type = 2;
}

function normalCube(){
    type = 1;
}

function textureCube(){
    type = 0;
}

function saveWorld(){
    var str = CONFIG.PLAYGROUND.divisions + " " + CONFIG.PLAYGROUND.height + "\n";
    for (var i = 0; i < meshes.length; i++){
        var cube = meshes[i];
        str = str + cube.position.x + " " + cube.position.y + " " + cube.position.z + " ";
        if (cube.material instanceof THREE.MeshNormalMaterial){
            str = str + "1\n";
        }
        else if (cube.material instanceof THREE.MeshBasicMaterial){
            str = str + "2 " + cube.material.color.r + " " + cube.material.color.g + " " + cube.material.color.b + "\n";
        }
        else if (cube.material instanceof THREE.MeshLambertMaterial){
            str = str + "0\n";
        }
    }
    saveTextAsFile(str, "level.txt");
}

function loadFile(){
    var fileToLoad = document.getElementById("saveFile").files[0];
 
    if (fileToLoad != ""){
        var fileReader = new FileReader();
        fileReader.onload = function(fileLoadedEvent) 
        {
            saveString = fileLoadedEvent.target.result;
        };
        fileReader.readAsText(fileToLoad, "UTF-8");
    }
}

function loadWorld(){
    if (saveString === null){
        $('#exampleModalLabel').text("That was unexpected!");
        $('.modal-body').text("In order to load a board you need to submit a save file in the input on the left side of the screen. If you did and this is not working, let us know in the Feedback Form.");
        $('#gameModal').modal('show');
        return;
    }

    deleteBlocks();

    var lines = saveString.split("\n");
    var number = lines[0].split(" ");
    var w = parseInt(number[0]);
    var h = parseInt(number[1]);

    if (reader.filename !== "none" && (w!==CONFIG.PLAYGROUND.divisions || h!==CONFIG.PLAYGROUND.height)){
        $('#exampleModalLabel').text("Sorry!");
        $('.modal-body').text("You cannot upload a file of different dimenstions in game mode. Try changing to level \"none\"");
        $('#gameModal').modal('show');
        return;
    }
    else if (w!==CONFIG.PLAYGROUND.divisions || h!==CONFIG.PLAYGROUND.height){
        CONFIG.PLAYGROUND.height = h;
        CONFIG.PLAYGROUND.divisions = w;
        CONFIG.PLAYGROUND.wallHeight = CONFIG.PLAYGROUND.size / CONFIG.PLAYGROUND.divisions * CONFIG.PLAYGROUND.height;
        updateWorldSize();
    }

    for (var i = 1; i<lines.length; i++){
        var numbers = lines[i].split(" ");

        var cellSideLen = CONFIG.PLAYGROUND.size / CONFIG.PLAYGROUND.divisions;
        var geometry = new THREE.BoxGeometry( cellSideLen, cellSideLen, cellSideLen );
    
        var material;
        if (parseInt(numbers[3]) === 2){
            material = new THREE.MeshBasicMaterial();
            material.color = new THREE.Color(parseFloat(numbers[4]),parseFloat(numbers[5]),parseFloat(numbers[6]));
        }
        else if (parseInt(numbers[3]) === 1){
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

        var x = parseFloat(numbers[0]);
        var y =  parseFloat(numbers[1]);
        var z =  parseFloat(numbers[2]);

        cube.position.set(x,y,z);

        geometry = new THREE.BoxGeometry( cellSideLen, cellSideLen, cellSideLen );
        geometry.translate(x,y,z);
        // wireframe
        var geo = new THREE.EdgesGeometry( geometry );
        var mat = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 16 } );
        var wireframe = { shape: new THREE.LineSegments( geo, mat ) , box: cube.position};
        wireframe.shape.renderOrder = 1; // make sure wireframes are rendered 2nd
        scene.add( wireframe.shape );
        borders.push(wireframe);
    }

    if (game)
        checkWinCondition();

}