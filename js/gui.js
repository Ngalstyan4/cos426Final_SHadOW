"use strict";
//all below defined in initWorld BEGIN
// var camera;
//all below defined in initWorld END

function initGui() {

    var guiEnabled = true;

    if (guiEnabled) {
        // GUI properties
        let guiControls = new (function() {
            this.camera = camera.position;
            this.debug = CONFIG.DEBUG;
        })();

        // GUI elements
        let gui = new dat.GUI();

        gui.add(guiControls, "debug")
        .name("Debug Mode")
        .onChange(v => CONFIG.DEBUG = v)
        .listen();
        let cameraControls = gui.addFolder("Camera");

        cameraControls.add(guiControls.camera, "x").step(0.001).name("Camera X").listen();
        cameraControls.add(guiControls.camera, "y").step(0.001).name("Camera Y").listen();
        cameraControls.add(guiControls.camera, "z").step(0.001).name("Camera Z").listen();

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
