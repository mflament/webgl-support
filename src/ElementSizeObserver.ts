type ElementSizeListener = (width: number, height: number) => void;

export class ElementSizeObserver {
    readonly disconnect: () => void;

    constructor(readonly element: HTMLElement, public onSizeChange: ElementSizeListener, public debounceMillis = 0) {

        const fireEvent = (contentRect: DOMRectReadOnly) => onSizeChange(Math.floor(contentRect.width), Math.floor(contentRect.height));

        let tid: number | undefined = undefined;
        const onResize = (entries: ResizeObserverEntry[]) => {
            const dm = this.debounceMillis;
            const contentRect = entries[0].contentRect;
            if (dm > 0) {
                if (tid !== undefined)
                    clearTimeout(tid);
                tid = self.setTimeout(() => fireEvent(contentRect), dm);
            } else {
                fireEvent(contentRect);
            }
        }

        const resizeObserver = new ResizeObserver(onResize);
        resizeObserver.observe(element);

        this.disconnect = () => {
            if (tid !== undefined)
                clearTimeout(tid);
            resizeObserver.disconnect();
        }
    }

}