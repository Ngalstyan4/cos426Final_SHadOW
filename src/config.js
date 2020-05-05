"use strict"
export const CONFIG =
{
    DEBUG: false,
    HELPER_STRUCTS: {
        wall1camera:false,
        wall2camera:false
    },
    PLAYGROUND: {
        size: 2048,
        groundLevel:-700,
        divisions: 8,
        height: 20,
        wallHeight: 2048 / 8 * 20 // todo:: fix to refer to size inside the config
    }
}