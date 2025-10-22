export class Json2LuaUtil {
    // 创建代码模板类
    private static indentCache = new Map<number, string>()

    static indent(level: number): string {
        if (!this.indentCache.has(level)) {
        this.indentCache.set(level, '\t'.repeat(level))
        }
        return this.indentCache.get(level)!
    }

    static getNodeVarName(nodeId: string | number): string {
        return `result_${nodeId}`
    } 
}