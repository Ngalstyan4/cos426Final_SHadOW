"use strict";
//all below defined in initWorld BEGIN
// var camera;
//all below defined in initWorld END

var reader = new (function(){
    this.filename = "tensorflow";

})();

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

        
        gui.add(reader, 'filename', [ 'none', 'line', '2-3', '2-5', 'tensorflow', 'House-Duck' ] ).name("CHOOSE LEVEL").
        onChange(v => {
            setLevel(v + ".txt")
            if (v == "House-Duck") {
                $('#exampleModalLabel').text("Tadaaaaam");
                $('.modal-body').html("<p>We actually have not been able to create this</p> <p>If you know how, or if you have other level ideas, let us know <a href='https://forms.gle/Zjo4zGi1SFiV4siv6'>here</a></p>");
                $('#gameModal').modal('show');
                
            }
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
