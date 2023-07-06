export function hasNodeRequire(): boolean {
    return !!globalThis.require;
}

export function hasNodeProcess(): boolean {
    return !!globalThis.process;
}

export function isElectron(): boolean {
    return hasNodeProcess() && hasNodeRequire();
}