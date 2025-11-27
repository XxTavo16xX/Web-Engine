
// * Dependencies Required

import { config } from "dotenv";

// * Managers Required

import Engine_Manager from "./managers/engine";

// * Initializing DotEnv

config({ path: ".env" });

// * Initializing Engine Manager

Engine_Manager.init();