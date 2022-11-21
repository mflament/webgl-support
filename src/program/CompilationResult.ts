import {GLProgram, ProgramVaryings} from "./GLProgram";

export interface ProgramLogs {
    vs?: string | null;
    fs?: string | null;
    program: string | null;
}

export interface ProgramSources {
    vs: string;
    fs: string;
}

export class CompilationResult {
    constructor(readonly program: GLProgram,
                readonly sources: ProgramSources,
                readonly varyings: ProgramVaryings | undefined,
                readonly compileTime: number,
                readonly logs: ProgramLogs | undefined) {
    }

    get compiled(): boolean {
        return !this.logs;
    }

    hasError(): this is CompilationResult & { readonly logs: ProgramLogs } {
        return !!this.logs;
    }

    formatLogs(): string | undefined {
        const {logs, sources} = this;
        if (!logs)
            return undefined;
        let error = '';
        if (logs.vs !== undefined) {
            error += formatSources(sources.vs);
            error += "---------------------------------------------\n";
            error += formatLogs(logs.vs) + "\n";
        }
        if (logs.fs !== undefined) {
            error += formatSources(sources.fs);
            error += "---------------------------------------------\n";
            error += formatLogs(logs.fs);
        }
        if (logs.program !== undefined) {
            error += "---------------------------------------------\n";
            error += formatLogs(logs.program) + "\n";
        }
        return error;
    }

    toString(): string {
        return this.formatLogs() || "Compiled";
    }
}


function formatSources(source: string) {
    return source.split('\n').map((s, i) => formatLineNumber(i + 1) + s).join("\n");
}

function formatLineNumber(l: number) {
    return l.toString().padEnd(4) + ': ';
}

function formatLogs(logs: string | null) {
    return logs || 'No logs';
}
