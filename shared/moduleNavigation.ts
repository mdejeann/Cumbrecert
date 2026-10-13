export function getNextModulePath(level: number, moduleNumber: number, totalModules: number): string {
  return moduleNumber < totalModules
    ? `/curso/${level}/modulo/${moduleNumber + 1}`
    : `/curso/${level}/examen-final`;
}

export function createModuleResetState() {
  return {
    answers: [] as (number | null)[],
    result: null,
  };
}

export function getNextModuleTransition(level: number, moduleNumber: number, totalModules: number) {
  return {
    path: getNextModulePath(level, moduleNumber, totalModules),
    ...createModuleResetState(),
  };
}
