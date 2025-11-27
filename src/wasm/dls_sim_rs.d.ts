/* tslint:disable */
/* eslint-disable */
export class Simulation {
  free(): void;
  [Symbol.dispose](): void;
  add_intensity(intensity: number): void;
  estimate_size(dt: number, temperature: number, viscosity: number, wavelength: number): any;
  get_positions(): Float64Array;
  update_params(temperature: number, viscosity: number, diameter: number, polydispersity: number): void;
  reset_correlator(): void;
  calculate_intensity(wavelength: number): number;
  calculate_correlation(): Float32Array | undefined;
  constructor(num_particles: number, temperature: number, viscosity: number, diameter: number, box_w: number, box_h: number, box_d: number, polydispersity: number);
  step(dt: number): void;
  run_steps(dt: number, steps: number, wavelength: number): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_simulation_free: (a: number, b: number) => void;
  readonly simulation_add_intensity: (a: number, b: number) => void;
  readonly simulation_calculate_correlation: (a: number) => [number, number];
  readonly simulation_calculate_intensity: (a: number, b: number) => number;
  readonly simulation_estimate_size: (a: number, b: number, c: number, d: number, e: number) => any;
  readonly simulation_get_positions: (a: number) => [number, number];
  readonly simulation_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => number;
  readonly simulation_reset_correlator: (a: number) => void;
  readonly simulation_run_steps: (a: number, b: number, c: number, d: number) => void;
  readonly simulation_step: (a: number, b: number) => void;
  readonly simulation_update_params: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
