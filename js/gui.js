"use strict";
//all below defined in initWorld BEGIN
// var camera;
//all below defined in initWorld END

var reader = new (function(){
    this.filename = "none";

})();

var guiControls;

function initGui() {

    var guiEnabled = true;

    if (guiEnabled) {
        // GUI properties
        guiControls = new (function() {
            this.camera = camera.position;
            this.debug = CONFIG.DEBUG;
            this.blockColor = new THREE.Color();
            this.newLevel = ""
            this.gridSize = CONFIG.PLAYGROUND.divisions;
            this.height = nextHeight;
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

        let appearanceControls = gui.addFolder("Block Type");

        appearanceControls.add({textureCube}, "textureCube").name("Texture Cube");
        appearanceControls.add({normalCube}, "normalCube").name("Normal Cube");
        appearanceControls.add({colorCube}, "colorCube").name("Color Cube");

        appearanceControls
        .addColor(guiControls, "blockColor")
        .name("Block Color")
        .onChange(function(value) {
            blockColor.setRGB(value.r/256, value.g/256, value.b/256);
        });

        
        gui.add(reader, 'filename', [ 'none', 'line', '2-3', '2-5', 'tensorflow', 'CHALLENGE', 'House-Duck', 'Heart-Diamond'] ).name("CHOOSE LEVEL").
        onChange(v => {
            reader.filename = v;
            setLevel(v + ".txt")
            // if (v == "House-Duck") {
            //     $('#exampleModalLabel').text("Tadaaaaam");
            //     $('.modal-body').html("<p>We actually have not been able to create this</p> <p>If you know how, or if you have other level ideas, let us know <a href='https://forms.gle/Zjo4zGi1SFiV4siv6'>here</a></p>");
            //     $('#gameModal').modal('show');
                
            // }
    })
        .listen();
        // gui.add(reader, 'changeLevel');



        // let sizeControl = gui
        //   .add(guiControls, "fabricLength", 200, 1000)
        //   .step(20)
        //   .name("Size")
        //   .onChange(function(value) {
        //     fabricLength = value;
        //     xSegs = Math.round(value / 20);
        //     ySegs = Math.round(value / 20);
        //     restartCloth();
        //   });


        // interactionControls
        //   .add(guiControls, "object", ["None", "Sphere", "Box", "Curved Floor"])
        //   .name("object")
        //   .onChange(function(value) {
        //     placeObject(value);
        //   });


        // let appearanceControls = gui.addFolder("Appearance");
        // appearanceControls
        //   .addColor(guiControls, "clothColor")
        //   .name("cloth color")
        //   .onChange(function(value) {
        //     clothMaterial.color.setHex(value);
        //   });

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
    res += walls[0].reverse().map(wall => wall.map(a => a? "X":".").reduce((a,b) => a + " " + b )).reduce((a,b) => a+"\n"+b);
    res += "\n\n";
    res += walls[1].reverse().map(wall => wall.reverse().map(a => a? "X":".").reduce((a,b) => a + " " + b )).reduce((a,b) => a+"\n"+b);
    $('#exampleModalLabel').text("This is encoding of the level you created!!");
    let htm = "<p>Please share it with us in the feedback form <a target='blank' href='https://forms.gle/Zjo4zGi1SFiV4siv6'>here</a><!/p><textarea style='width:200px; height:300px;' type='text' class='form-control classname' id='copy-input' cols=40 rows=20readonly>"+res+"</textarea>";
    htm += "<a href='#' id='copy' data-clipboard-target='#copy-input' class='btn btn-default'>Copy input content to clipboard</a>"
    $('.modal-body').html(htm);
    $('#gameModal').modal('show');
    var clipboard = new Clipboard('#copy');
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