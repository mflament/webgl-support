import {GLContext} from "../GLContext";

export class FPSOverlay {
    readonly element: HTMLDivElement;

    private _toggleKey?: string = 'f';
    private _toggleListener?: (e: KeyboardEvent) => void;
    private readonly _intervalId: number;

    constructor(readonly context: GLContext) {
        const element = document.createElement('div');
        const style: Partial<CSSStyleDeclaration> = {
            display: 'block',
            position: 'absolute',
            right: '10px',
            top: '10px',
            color: 'green',
            fontSize: '1em',
            fontWeight: 'bold',
            fontFamily: 'system'
        }
        Object.assign(element.style, style);
        this.element = element;
        document.body.append(element);

        const updateFPS = () => element.textContent = context.fps.toFixed(0)
        this._intervalId = self.setInterval(() => updateFPS, 1000);
    }

    destroy(): void {
        self.clearInterval(this._intervalId);
    }

    get visible(): boolean {
        return this.element.style.display === 'block';
    }

    set visible(v: boolean) {
        this.element.style.display = v ? 'block' : 'none';
    }

    toggle(): void {
        this.visible = !this.visible;
    }

    get toggleKey(): string | undefined {
        return this._toggleKey;
    }

    set toggleKey(key: string | undefined) {
        this._toggleKey = key;
        const canvas = this.context.canvas;

        if (this._toggleListener) {
            canvas.removeEventListener('keydown', this._toggleListener);
            this._toggleListener = undefined;
        }

        if (key) {
            this._toggleListener = e => e.key === key && this.toggle();
            canvas.addEventListener('keydown', this._toggleListener);
        }
    }

}