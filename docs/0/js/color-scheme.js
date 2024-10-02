;(function(){
class ColorScheme {
    constructor(options) {
//        this._core = new ColorSchemeCore(options)
//        this._ui = new ColorSchemeUiSelect(options)
        /*
        const modes = ['light','dark']
        const modes = {
            light: '☀',
            dark: '🌙',
        }
        */
        this._core = new ColorSchemeCore(options)
        this._ui = new ColorSchemeUiSelect({
            core: this._core,
            data: this._core.modes,
            attrs: {
//                id: 'IDDDDDDDDDD',
//                class: 'A BC D',
                //class: ['A', 'BC','D'],
                //class: 'A,BC,D',
            }
        })
    }
    get core() { return this._core }
    get ui() { return this._ui }
}
class ColorSchemeCore { // <body>のclass属性値をdark/lightに切り替える
    constructor(options) {
        this._modes = ['light', 'dark']
        this._mode = 'light'
        this._onChange = ()=>{}
    }
    get modes() { return this._modes }
    get mode() { return this._mode }
    set mode(v) {
        if (!this._modes.some(V=>V===v)) { throw new TypeError(`modeは${this._modes}のいずれかであるべきです。:${mode}`) }
        const old = this._mode
        this._mode = v
        if (old !== this._mode) { this.#onChange(old) }
    }
    get onChange() { return this._onChange }
    set onChange(v) {if ('function'!==typeof v){throw new TypeError(`onChangeは関数であるべきです。:${v}`)}else{this._onChange=v}}
    #onChange(o) {
        this.#switchClass()
        this._onChange(this._mode, o)
        console.log(`changed: ${this._mode}<-${o}`)
    }
    #switchClass() { for (let m of this._modes) { document.body.classList[(m===this._mode) ? 'add' : 'remove'](m) } }
}

class ColorSchemeUiSelect { // モード切替用<select>要素を作成する
    constructor(options) {
        this._core = options.core
        this._onChange = ()=>{}
//        this._onMakeLi = ()=>{}
        this._el = this.#make(options.data ?? this._core.modes, options.attrs ?? {})
        console.log(options)
        console.log(this._el)
    }
    get el() { return this._el }
    #make(data, attrs) {
        console.log(data,attrs)
        const select = document.createElement('select')
        for (let key of Object.keys(attrs ?? {})) { select[key] = attrs[key]; console.log(key) }
        this.#addClass(select, attrs)
        select.dataset.id = 'color-scheme-choose-ui-select'
        select.onchange = this.#onChange.bind(this)
        select.append(...this.#makeOptions(data))
        return select
    }
    #makeOptions(data) {
        if (Array.isArray(data)) { return data.map((v,i)=>this.#makeOption(v,v,i)) }
        else if ('object'===typeof data && Object===data.constructor) {
            return [...Object.entries(data)].map(([k,v],i)=>this.#makeOption(k,v,i))
        }
        else {throw new TypeError(`dataは配列かオブジェクトであるべきです。例:['light','dark']/{light:'☀', dark:'🌙'}:${data}`)}
        return [...Object.entries(data)].map(([k,v],i)=>this.#makeOption(k,v,i))
    }
    #makeOption(k, v, i) {
        const option = document.createElement('option')
        option.value = k
        option.textContent = v
        return option
    }
    #onChange(e) {
        this._core.mode = e.target.value
        console.log(e.target.value, e)
    }
    #addClass(select, attrs) {
        if (attrs.class ?? null) {
            ((Array.isArray(attrs.class))
            ? attrs.class
            : (`${attrs.class}`.split((`${attrs.class}`.includes(',')) ? ',' : ' ')))
            .map(v=>select.classList.add(v.trim()))
        }
        //if (attrs.class ?? null) { ((Array.isArray(attrs.class)) ? attrs.class : `${attrs.class}`.split(' ')).map(v=>select.classList.add(v)) }
    }
}
class ColorSchemeUiList { // モード切替用<ul>/<ol>要素を作成する

    #onMakeLi(data) { return }
}
window.ColorScheme = ColorScheme
})();
