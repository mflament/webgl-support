export interface Cached<T> {
    get(): T;

    release(): void;
}

export function cached<T extends { delete?(): void }>(factory: () => T): Cached<T> {
    let instance: T | undefined = undefined, references = 0;
    return {
        get(): T {
            if (instance === undefined) instance = factory();
            references++;
            return instance;
        },
        release() {
            references--;
            if (references === 0 && instance) {
                instance.delete && instance.delete();
                instance = undefined;
            }
        }
    }
}