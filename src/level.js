import {deleteBlocks, game} from "./render";
import {CONFIG} from "./config";
// import {nextHeight} from "./gui";
import {scene, updateWorldSize} from "./initWorld";
import {guiCallbacks, reader} from "./gui";

var target = new Array(2);
var goal = [];

function addGoal(targets) {
    var cellSideLen = CONFIG.PLAYGROUND.size / CONFIG.PLAYGROUND.divisions;
    var sub = 0;
    if (CONFIG.PLAYGROUND.divisions % 2 == 1) {
        sub = -cellSideLen / 2;
    }
    var sep = CONFIG.PLAYGROUND.level_wall_separations;
    for (var i = 0; i < targets[0].length; i++) {
        for (var j = 0; j < targets[0][i].length; j++) {
            if (targets[0][i][j] === true) {
                var geometry = new THREE.PlaneGeometry(cellSideLen, cellSideLen, 32);
                var material = new THREE.MeshNormalMaterial({transparent: true, opacity: 0.8});
                var shadowMaterial = new THREE.ShadowMaterial();
                shadowMaterial.opacity = 0.3;
                var goalPlane = new THREE.Mesh(geometry, material);
                var goalPlaneShadow = new THREE.Mesh(geometry, shadowMaterial);

                goalPlane.position.set(cellSideLen * j + cellSideLen / 2 - CONFIG.PLAYGROUND.size / 2 + sub, CONFIG.PLAYGROUND.groundLevel + cellSideLen * i + cellSideLen / 2, -CONFIG.PLAYGROUND.size / 2 + sep + sub);
                goalPlaneShadow.position.set(cellSideLen * j + cellSideLen / 2 - CONFIG.PLAYGROUND.size / 2 + sub, CONFIG.PLAYGROUND.groundLevel + cellSideLen * i + cellSideLen / 2, -CONFIG.PLAYGROUND.size / 2 + sep + sub);

                goalPlaneShadow.castShadow = true;
                goalPlaneShadow.receiveShadow = true;
                scene.add(goalPlane);
                scene.add(goalPlaneShadow);

                goal.push(goalPlane);
                goal.push(goalPlaneShadow);
            }

            if (targets[1][i][j] === true) {
                var geometry = new THREE.PlaneGeometry(cellSideLen, cellSideLen, 32);
                var material = new THREE.MeshNormalMaterial({transparent: true, opacity: 0.8});
                var shadowMaterial = new THREE.ShadowMaterial({transparent: true});
                shadowMaterial.opacity = 0.3;
                var goalPlane = new THREE.Mesh(geometry, material);
                var goalPlaneShadow = new THREE.Mesh(geometry, shadowMaterial);

                goalPlane.position.set(-CONFIG.PLAYGROUND.size / 2 + sep + sub, CONFIG.PLAYGROUND.groundLevel + cellSideLen * i + cellSideLen / 2, cellSideLen * j + cellSideLen / 2 - CONFIG.PLAYGROUND.size / 2 + sub);
                goalPlaneShadow.position.set(-CONFIG.PLAYGROUND.size / 2 + sep + sub, CONFIG.PLAYGROUND.groundLevel + cellSideLen * i + cellSideLen / 2, cellSideLen * j + cellSideLen / 2 - CONFIG.PLAYGROUND.size / 2 + sub);

                goalPlane.rotation.y = Math.PI / 2;
                goalPlaneShadow.rotation.y = Math.PI / 2;

                goalPlaneShadow.castShadow = true;
                goalPlaneShadow.receiveShadow = true;
                scene.add(goalPlane);
                scene.add(goalPlaneShadow);

                goal.push(goalPlane);
                goal.push(goalPlaneShadow);
            }
        }
    }
}

export function deleteGoal() {
    for (var i = 0; i < goal.length; i++) {
        scene.remove(goal[i]);
    }
    goal = [];
}

export function setLevel(fileName) {

    var loader = new THREE.FileLoader();

    if (fileName === "none.txt") {
        // Delete block objects and resize
        deleteBlocks();
        deleteGoal();
        let nextDivision = 8, nextHeight = 7;
        CONFIG.PLAYGROUND.divisions = nextDivision;
        CONFIG.PLAYGROUND.height = nextHeight;
        CONFIG.PLAYGROUND.wallHeight = CONFIG.PLAYGROUND.size / nextDivision * nextHeight;
        updateWorldSize();

        //set blank map and return
        game.levels = false;
        return;
    }

    fileName = 'levels/' + fileName;
    //load a text file and output the result to the console
    loader.load(fileName,
        function (data) {
            game.levels = true;
            // Delete block objects and resize
            deleteBlocks();
            deleteGoal();

            // output the text to the console
            var lines = data.split('\n');
            var numbers = lines[0].split(' ');
            var gridSize = parseInt(numbers[0]);
            var height = parseInt(numbers[1]);

            CONFIG.PLAYGROUND.divisions = gridSize;
            CONFIG.PLAYGROUND.height = height;
            CONFIG.PLAYGROUND.wallHeight = CONFIG.PLAYGROUND.size / gridSize * height;
            updateWorldSize();

            target[0] = new Array(height);
            // create boolean arrays
            for (var i = 0; i < height; i++) {
                target[0][i] = new Array(gridSize);
                for (var j = 0; j < gridSize; j++) {
                    if (lines[height - i][j] === 'X')
                        target[0][i][j] = true;
                    else
                        target[0][i][j] = false;
                }
            }

            target[1] = new Array(height);
            // create boolean arrays
            for (var i = 0; i < height; i++) {
                target[1][i] = new Array(gridSize);
                for (var j = 0; j < gridSize; j++) {
                    if (lines[2 * height - i + 1][j] === 'X')
                        target[1][i][gridSize - 1 - j] = true;
                    else
                        target[1][i][gridSize - 1 - j] = false;
                }
            }

            // add rectangles to wall
            addGoal(target);

        },
        // onProgress callback
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // onError callback
        function (err) {
            console.error('An error happened');
            $('#exampleModalLabel').text("We are sorry!");
            $('.modal-body').html("<p>We actually have not been able to create this</p> <p>If you know how, or if you have other level ideas, let us know <a href='https://forms.gle/Zjo4zGi1SFiV4siv6'>here</a></p>");
            $('#gameModal').modal('show');
        }
    );
}

/** Register Gui Handlers */
guiCallbacks.push(h => h.chooseLevel.onChange(v => {
    reader.filename = v;
    setLevel(v + ".txt");
}));


