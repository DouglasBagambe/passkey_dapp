/* eslint-disable @typescript-eslint/no-explicit-any */
import { Buffer } from "buffer";
import process from "process";

// Polyfill Buffer and process for browser compatibility
export function setupPolyfills() {
  if (typeof window !== "undefined") {
    window.Buffer = Buffer;
    window.process = process as any;
  }
}
