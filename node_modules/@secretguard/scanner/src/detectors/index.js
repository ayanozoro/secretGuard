import { genericDetector } from "./genericDetector.js";
import { awsDetector } from "./awsDetector.js";
import { githubDetector } from "./githubDetector.js";
import { jwtDetector } from "./jwtDetector.js";
import { privateKeyDetector } from "./privateKeyDetector.js";
import { databaseDetector } from "./databaseDetector.js";

/**
 * Registry of all active security detector plugins.
 * Can be dynamically extended without modifying the scanner engine.
 */
export const DEFAULT_DETECTORS = [
  awsDetector,
  githubDetector,
  privateKeyDetector,
  jwtDetector,
  databaseDetector,
  genericDetector
];

export class DetectorRegistry {
  constructor(detectors = DEFAULT_DETECTORS) {
    this.detectors = [...detectors];
  }

  register(detector) {
    if (!detector.id || typeof detector.scan !== "function") {
      throw new Error("Invalid detector format. Must have an 'id' and a 'scan' method.");
    }
    this.detectors.push(detector);
  }

  getDetectors() {
    return this.detectors;
  }
}
