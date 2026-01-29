// 使用 @monaco-editor/loader 以异步方式按需加载 monaco-editor
// 好处：
// 1. 首屏体积更小，只有真正需要编辑器时才会加载 monaco
// 2. 自动处理 web worker 等复杂配置
import loader from '@monaco-editor/loader'

// 引入 monaco-editor 的类型定义，实际运行时的 monaco 对象由 loader 提供
import type * as Monaco from 'monaco-editor'
const { VITE_PUBLIC_PATH } = import.meta.env

/**
 * 创建编辑器实例时的配置项
 * 对外暴露一个精简的选项接口，内部会组合成 monaco.editor.IStandaloneEditorConstructionOptions
 */
export interface MonacoInstanceOptions {
  /** 初始代码内容 */
  value?: string
  /** 语言 ID，例如 'javascript' | 'typescript' | 'json' 等 */
  language?: string
  /** 主题，常见有 'vs' | 'vs-dark' | 'hc-black' 等 */
  theme?: string
  /** 是否只读 */
  readOnly?: boolean
  /**
   * 其他 monaco.editor.IStandaloneEditorConstructionOptions 中支持的任何字段
   * 例如 fontSize、minimap、wordWrap 等
   */
  [key: string]: any
}

/**
 * 对单个 Monaco 编辑器实例的封装
 * - 每个实例包含一个 editor 和一个独立的 model
 * - 通过 dispose 方法可以完整回收对应的资源
 */
export interface MonacoInstance {
  /** 内部生成的唯一 ID，用于管理和查找实例 */
  id: string
  /** monaco 的编辑器实例 */
  editor: Monaco.editor.IStandaloneCodeEditor
  /** 对应的文本 model（存储内容、语言等） */
  model: Monaco.editor.ITextModel
  /** 销毁当前实例：会释放 editor 和 model，并从管理器中移除 */
  dispose: () => void
}

/**
 * MonacoManager
 *
 * 设计目标：
 * 1. 通过单例模式集中管理 monaco 的加载和多个编辑器实例
 * 2. 只初始化 / 加载一次 monaco，避免重复加载和体积浪费
 * 3. 为每个编辑器创建独立的 model，使得语言、高亮、内容互不干扰
 * 4. 提供按语言注册补全等扩展能力
 */
export class MonacoManager {
  /** 单例实例引用 */
  private static _instance: MonacoManager

  /**
   * monaco 加载中的 Promise
   * - 第一次构造时通过 loader.init() 赋值
   * - 确保多次调用 ensureMonaco 时复用同一个加载过程
   */
  private monacoPromise: Promise<typeof Monaco> | null = null

  /**
   * 真正的 monaco 对象
   * - 在 monacoPromise resolve 后被赋值
   * - 之后可以直接使用，而无需再通过 loader 获取
   */
  private monaco!: typeof Monaco

  /**
   * 当前所有已创建的编辑器实例集合
   * key: 内部生成的实例 id
   * value: 对应的 MonacoInstance
   */
  private instances = new Map<string, MonacoInstance>()

  /**
   * 实例 ID 自增计数器
   * - 每创建一次编辑器就自增，用来生成形如 editor-1 / editor-2 等 id
   */
  private idSeed = 0

  /**
   * 私有构造函数（单例模式）
   * - 外部无法直接 new，只能通过 getInstance 获取唯一实例
   */
  private constructor() {
    // 可选：在这里配置 monaco 资源的 vs 路径
    // 通常指向构建产物中 monaco-editor/min/vs 的位置
    // 当前配置假定项目使用 /node_modules 作为静态资源根路径
    loader.config({
      paths: {
        vs: VITE_PUBLIC_PATH + 'vs'
        // 或者你的本地静态资源路径
      }
    })

    this.monacoPromise = loader.init().then(m => {
      this.monaco = m
      return m
    })
  }

  /**
   * 获取 MonacoManager 单例
   *
   * 使用方式：
   * const manager = MonacoManager.getInstance()
   */
  public static getInstance() {
    if (!this._instance) {
      this._instance = new MonacoManager()
    }
    return this._instance
  }

  /**
   * 确保 monaco 已经被加载并返回 monaco 对象
   *
   * - 如果 monaco 已存在，直接返回
   * - 如果还没有加载，则触发 loader.init() 并返回对应 Promise
   */
  public async ensureMonaco(): Promise<typeof Monaco> {
    if (this.monaco) return this.monaco
    if (!this.monacoPromise) {
      this.monacoPromise = loader.init().then(m => {
        this.monaco = m
        return m
      })
    }
    return this.monacoPromise
  }

  /**
   * 创建一个独立的编辑器实例：独立的 model + editor
   * @param container - 承载编辑器的 DOM 容器
   * @param options   - 编辑器配置
   */
  public async createInstance(
    container: HTMLElement,
    options: MonacoInstanceOptions = {}
  ): Promise<MonacoInstance> {
    const monaco = await this.ensureMonaco()

    const id = `editor-${++this.idSeed}`
    const language = options.language || 'javascript'
    const value = options.value || ''

    // 为每个实例创建独立 model，并给它一个唯一的 URI：不同实例互不共享内容
    const model = monaco.editor.createModel(
      value,
      language
      // 使用唯一的 URI（inmemory://editor-x.xx）避免与其他实例冲突
      // monaco.Uri.parse(`custom://${id}.${language}`)
    )

    const editor = monaco.editor.create(container, {
      model,
      language, // 冗余写一下也没问题
      theme: options.theme || 'vs-dark',
      readOnly: options.readOnly ?? false,
      automaticLayout: true,
      ...options
    })

    // 组装实例对象，暴露统一的 dispose 方法
    const instance: MonacoInstance = {
      id,
      editor,
      model,
      dispose: () => {
        editor.dispose()
        model.dispose()
        this.instances.delete(id)
      }
    }

    this.instances.set(id, instance)
    return instance
  }

  /**
   * 通过 id 获取实例
   *
   * @param id - 创建实例时生成的 id（如 editor-1）
   * @returns 对应的 MonacoInstance 或 null
   */
  public getInstance(id: string) {
    return this.instances.get(id) || null
  }

  /**
   * 销毁指定实例
   *
   * - 内部会调用实例自身的 dispose
   * - 同时从管理器的 instances Map 中移除
   */
  public disposeInstance(id: string) {
    const inst = this.instances.get(id)
    if (!inst) return
    inst.dispose()
  }

  /**
   * 全部销毁
   */
  public disposeAll() {
    this.instances.forEach(inst => inst.dispose())
    this.instances.clear()
  }

  /**
   * 按语言注册补全：各语言互不影响
   *
   * @param languageId - 语言 ID，例如 'javascript'、'typescript'、'json' 等
   * @param provider   - CompletionItemProvider 实现
   *
   * 说明：
   * - 这是针对某个 languageId 进行全局注册
   * - 所有使用该 languageId 的 editor 实例都会共享这个补全规则
   * - 若需要只作用于某一个实例，可以自行在外部持有返回的 disposable，
   *   并在该实例销毁时调用 dispose() 解除注册
   */
  public async registerLanguageCompletion(
    languageId: string,
    provider: Monaco.languages.CompletionItemProvider
  ): Promise<Monaco.IDisposable> {
    const monaco = await this.ensureMonaco()
    const disposable = monaco.languages.registerCompletionItemProvider(languageId, provider)
    return disposable
  }
}
