# 工作流脚本生成说明（WorkflowAnalyzer + JsCodeParser）

## 概述

可视化规则编辑保存的工作流数据（`WorkflowData`）需要转换为可在运行时执行的脚本。当前工程中的实现分为两阶段：

| 阶段 | 模块 | 路径 | 职责 |
|------|------|------|------|
| 分析 | `WorkflowAnalyzer` | `src/utils/json2lua/WorkflowAnalyzer.ts` | 构建节点/边索引、生成执行顺序、计算层级、分支与汇合点等 |
| 生成 | `JsCodeParser` | `src/utils/parser/JsCodeParser.ts` | 根据分析结果拼接**脚本字符串**（语法为 **JavaScript**：`const` / `let`、箭头函数、`doWork(root, context)` 等） |

说明：数据模型里仍使用字段名 `lua` 存放生成结果，但 **`JsCodeParser` 实际输出的是 JS 风格代码**，与注释中偶发的「Lua」字样属于历史命名，阅读源码时以 `JsCodeParser.ts` 为准。

设计器侧在 `src/components/designer/index.vue` 中实例化 `JsCodeParser` 并调用 `generate(workflow, funcData)`。

## 核心数据结构（与类型定义一致）

类型见 `src/types/JsCodeParser.ts`、`src/types/workflow.ts`。

- **`NodeAnalysis.type`**：当前仅为 `'normal' | 'condition'`（条件节点即 ifelse 逻辑）。
- **`BranchInfo`**：描述 ifelse 各分支（`if` / `elseif` / `else`）、分支内节点与出口等。
- **`AnalysisResult`**：包含 `nodeAnalysis`、`branchInfoMap`、`nodeBranchMap`、`executionOrder`（主链路节点 ID 顺序）。

逻辑节点枚举 `LogicType`（`src/types/workflow.ts`）当前包括：`if_else`、`global_param`、`global_variable`、`calculator`、`+` 等，**不包含迭代器类型**；若文档其它处提到「迭代器节点」，以类型定义与画布实际配置为准。

## WorkflowAnalyzer 分析流程（与 `analyze()` 一致）

1. `initNodeMap`：建立节点 Map、出入边索引，初始化 `nodeAnalysis`，对 ifelse 构建分支基础信息。  
2. `generateExecutionOrder`：得到主链路执行顺序 `executionOrderResult.main`。  
3. `initNodeLevel`：按执行顺序计算节点层级。  
4. `assignNodeToBranch`：将节点归属到分支。  
5. `processMergePoints`：处理汇合点。  
6. `processGlobalVarPath`：全局变量相关路径可能调整执行顺序。  
7. `processDifferentSourceMerge`：不同源汇合点处理。  
8. 返回 `AnalysisResult`。

## JsCodeParser 生成流程（与 `generate` / `doGenerate` 一致）

1. `clear` / 注入 `workflow`、`funcData`，通过 `getFunctionCode`（`FuncParser`）得到 `codeMap`。  
2. `new WorkflowAnalyzer(workflow)` 并 `analyze()`，得到 `nodeAnalysis`、`branchInfoMap`、`executionOrder`。  
3. `doGenerate()`：  
   - `collectModules`：按函数元数据收集模块信息（供业务扩展）。  
   - `generateModuleDeclarations`：当前生成日志别名等前置片段。  
   - `generateFunctionCode`：为各节点表达式生成外层函数（如 `const func_xxx = (data) => { ... }`）。  
   - 生成主入口：`const doWork = (root, context) => { ... }`，内含变量声明、主流程、返回语句。  

具体分支、汇合、全局参数/变量等拼接逻辑见 `JsCodeParser.ts` 内 `generateMainFlow`、`generateNodeCode`、`generateDifferentSourceMergeBlock` 等私有方法。

## 辅助处理器（parserFunc）

与 `JsCodeParser` 配合的类位于 `src/utils/parserFunc/`：

- **`GlobalParam.ts`**：全局参数相关处理。  
- **`GlobalVariable.ts`**：全局变量相关处理（含对 `WorkflowAnalyzer` 的引用）。  
- **`Calculator.ts`**：计算器类逻辑节点相关处理。  

文档中若出现本仓库**不存在**的类名（如独立的「LuaGenerator」「IteratorManager」「SubPropertyExtractor」等），均属过时描述，请忽略。

## 使用与约束

- 工作流应避免循环依赖；分析/生成阶段会对异常结构打日志或产生不完整脚本。  
- 大型图如需优化，可考虑缓存分析结果或减少重复 `analyze()`。  
- 调试时可直接查看 `JsCodeParser.generate` 的返回值，并在浏览器控制台配合 `log`/`warn`/`error` 使用。

## 相关文档

- [X6 画布功能说明](./X6画布功能说明文档.md)  
- [函数编辑器说明（JSDoc）](./函数编辑器说明文档.md)  

## 版本说明

- 工程版本见根目录 `package.json`（如 `designonline-base-rule-web`）。  
- 本文档与 `src/utils/json2lua/WorkflowAnalyzer.ts`、`src/utils/parser/JsCodeParser.ts` 保持同步；若实现变更，请优先以源码为准更新本节。
