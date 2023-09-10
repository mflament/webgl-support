export interface GLTimerQuery {
    start(): void;

    stop(callback: (elapsed: number) => void): void;

    delete(): void;
}

export function createGLTimerQuery(gl: WebGL2RenderingContext): GLTimerQuery | undefined {
    const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
    if (!ext)
        return undefined;
    const query = gl.createQuery();
    if (!query)
        return undefined;

    const awaitQuery = (callback: (elapsed: number) => void) => {
        const check = () => {
            const available = gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE);
            if (available) {
                const elapsedNanos = gl.getQueryParameter(query, gl.QUERY_RESULT);
                callback(elapsedNanos * 1E-6);
            } else {
                setTimeout(check)
            }
        }
        check();
    }

    return {
        start() {
            gl.beginQuery(ext.TIME_ELAPSED_EXT, query);
        },
        stop(callback): void {
            gl.endQuery(ext.TIME_ELAPSED_EXT);
            awaitQuery(callback);
        },
        delete() {
            gl.deleteQuery(query);
        }
    }
}