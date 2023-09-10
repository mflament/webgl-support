export type InputEventType = 'mousedown' | 'mouseup' | 'mousemove' | 'wheel';
export type InputListener<E extends InputEventType> = (event: HTMLElementEventMap[E]) => void;

export type InputListeners = {
    [E in InputEventType]?: InputListener<E>
};

export function addEventListeners(target: HTMLElement, listeners: InputListeners) {
    for (let key in listeners) {
        if (isInputEventType(key))
            addEventListener(target, key, listeners);
    }
}

function addEventListener<E extends InputEventType>(target: HTMLElement, eventType: E, listeners: InputListeners) {
    const listener = listeners[eventType];
    if (listener)
        target.addEventListener(eventType, listener);
}

export function removeEventListeners(target: HTMLElement, listeners: InputListeners) {
    for (let key in listeners) {
        if (isInputEventType(key))
            removeEventListener(target, key, listeners);
    }
}

function removeEventListener<E extends InputEventType>(target: HTMLElement, eventType: E, listeners: InputListeners) {
    const listener = listeners[eventType];
    if (listener)
        target.removeEventListener(eventType, listener);
}

export function isInputEventType(key: string): key is InputEventType {
    return key === 'mousedown'
        || key === 'mouseup'
        || key === 'mousemove'
        || key === 'wheel'
        || key === 'keydown'
        || key === 'keyup';
}
