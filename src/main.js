"use strict";
import {initEventHandlers} from './events';
import {initWorld} from './initWorld';
import {animate} from './animate';
import {initGui, reader} from './gui';
import {setLevel} from './level';

// Boot it all up!
(function () {
    initWorld();
    initEventHandlers();
    animate();
    initGui();
    setLevel(reader.filename + ".txt");
})()
