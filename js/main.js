"use strict";

var game = false;
var target = new Array(2);

function setLevel(fileName){
    var loader = new THREE.FileLoader();

    if (fileName === "none.txt"){
        // Delete block objects and resize
        deleteBlocks();
        deleteGoal();

        //set blank map and return
        game = false;
        return;
    }

    fileName = 'levels/'+fileName;
    //load a text file and output the result to the console
    loader.load(fileName,
        function ( data ) {
            game = true;
            // Delete block objects and resize
            deleteBlocks();
            deleteGoal();

            // output the text to the console
            var lines = data.split('\n');
            var numbers = lines[0].split(' ');
            var gridSize = parseInt(numbers[0]);
            var height = parseInt(numbers[1]);

            CONFIG.PLAYGROUND.divisions = gridSize;
            CONFIG.PLAYGROUND.wallHeight = CONFIG.PLAYGROUND.size / gridSize * height;
            updateWorldSize();

            target[0] = new Array(height);
            // create boolean arrays
            for (var i = 0; i<height; i++){
                target[0][i] = new Array(gridSize);
                for (var j = 0; j<gridSize; j++){
                    if (lines[height-i][j] === 'X')
                        target[0][i][j]=true;
                    else
                        target[0][i][j]=false;
                }   
            }

            target[1] = new Array(height);
            // create boolean arrays
            for (var i = 0; i<height; i++){
                target[1][i] = new Array(gridSize);
                for (var j = 0; j<gridSize; j++){
                    if (lines[2*height-i+1][j] === 'X')
                        target[1][i][gridSize-1-j]=true;
                    else
                        target[1][i][gridSize-1-j]=false;
                }   
            }

            // add rectangles to wall
            addGoal(target);

        },
        // onProgress callback
        function ( xhr ) {
            console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        },
        // onError callback
        function ( err ) {
            console.error( 'An error happened' );
        }
    );
}

// Boot it all up!
(function(){
    initWorld();
    initEventHandlers();
    animate();
    initGui();
    setLevel(reader.filename + ".txt");
})()
