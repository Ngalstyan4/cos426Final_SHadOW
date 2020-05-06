import {camera} from "./initWorld";
import {CONFIG} from "./config";

export function winAnimation() {
    var from = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
    };

    var to1 = {
        x: CONFIG.PLAYGROUND.size * 2,
        y: 0,
        z: 0
    };
    var to2 = {
        x: 0,
        y: 0,
        z: CONFIG.PLAYGROUND.size * 2
    };
    var final = {
        x: 4447.902,
        y: 2707.858,
        z: 2980.549
    }
    var tween1 = new TWEEN.Tween(from)
        .to(to1, 600)
        .easing(TWEEN.Easing.Circular.Out)
        .onUpdate(function () {
            camera.position.set(this.x, this.y, this.z);
            camera.lookAt(new THREE.Vector3(0, 0, 0));
        })
        .onComplete(function () {
            camera.lookAt(new THREE.Vector3(0, 0, 0));


            var tween2 = new TWEEN.Tween(to1).delay(800)
                .to(to2, 600)
                .easing(TWEEN.Easing.Circular.Out)
                .onUpdate(function () {
                    camera.position.set(this.x, this.y, this.z);
                    camera.lookAt(new THREE.Vector3(0, 0, 0));
                })
                .onComplete(function () {
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
        .start();

}