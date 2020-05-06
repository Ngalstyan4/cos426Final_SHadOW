"use strict"
export const CONFIG =
    {
        GUI: true,
        DEBUG: false,
        HELPER_STRUCTS: {
            wall1camera: false,
            wall2camera: false
        },
        PLAYGROUND: {
            size: 80,
            groundLevel: -10,
            divisions: 8,
            // height: 0,
            wallHeight: 80 / 8 * 20, // todo:: fix to refer to size inside the config
            wall_grid_separation: -1,
            hover_grid_separation: 1,
            level_wall_separations: 1,

        }
    }
