;(function(){
class ColorScheme {
    constructor(options={}) {
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
        this._ui = new ColorSchemeUiList({
            core: this._core,
            type: 'ul',
            data: { light:{text:'☀', rt:'Light'}, dark:{text:'🌙', rt:'Dark'} },
            attrs: {},
        })
        /*
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
        */
        if (options.isSyncSystem ?? false) {
            this._sys = new ColorSchemeSystem(options)
            this._sys.addEvent()
        }
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
    next() {
        const old = this._mode
        const i = this._modes.findIndex(v=>v===this._mode)
        this._mode = this._modes[((this._modes.length-1<=i) ? 0 : i+1)]
        this._onChange(old)
    }
    prev() {
        const old = this._mode
        const i = this._modes.findIndex(v=>v===this._mode)
        this._mode = this._modes[((i<=0) ? this._modes.length-1 : i-1)]
        this._onChange(old)
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
class ColorSchemeSystem { // システムの配色設定と同期する
    constructor(options) {
        this._modes = ['light', 'dark']
        this._mode = 'light'
        this._onChange = ()=>{}
        this._mode = null
    }
    get mode() { return this._mode }
    get onChange() { return this._onChange }
    set onChange(v) {if ('function'!==typeof v){throw new TypeError(`onChangeは関数であるべきです。:${v}`)}else{this._onChange=v}}
    addEvent() { window.matchMedia('(prefers-color-scheme: dark)').addListener('change', (mql)=>this.#onChange(mql)) }
    delEvent() { window.matchMedia('(prefers-color-scheme: dark)').removeListener('change', (mql)=>this.#onChange(mql)) }
    #onChange(mql) {
        this._mode = (mql.matches) ? 'dark' : 'light'
        this._onChange(this._mode)
    }
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
    }
}
class ColorSchemeUiList { // モード切替用<ul>/<ol>要素を作成する
    constructor(options) {
        this._type = 'ul' // ul/ol
        this._core = options.core
        this._core.onChange = this.#update.bind(this)
        this._onChange = ()=>{}
        this._onMakeLi = ()=>{}
        this._el = this.#make(options.data ?? this._core.modes, options.attrs ?? {})
    }
    get el() { return this._el }
    #make(data, attrs) {
        const list = document.createElement(this._type)
        for (let key of Object.keys(attrs ?? {})) { list[key] = attrs[key]; console.log(key) }
        this.#addClass(list, attrs)
        list.tabIndex = 0
        list.dataset.id = 'color-scheme-choose-ui-list'
        list.style.listStyle = 'none'
        list.style.padding = '0'
        list.style.cursor = 'pointer'
        list.style.userSelect = 'none'
        list.addEventListener('click', async(e)=>this._core.next())
        list.addEventListener('keydown', async(e)=>{
            if (!e.repeat && [' ','Enter'].some(v=>v===e.key)) { this._core.next() }
        })
        //list.onchange = this.#onChange.bind(this)
        list.append(...this.#makeLis(data))
        return list
    }
    #makeLis(data) {
        if (Array.isArray(data)) { return data.map((v,i)=>this.#makeLi(this.#onMakeLiChildA.bind(this),[v,i])) }
        else if ('object'===typeof data && Object===data.constructor) {
            return [...Object.entries(data)].map(([k,v],i)=>this.#makeLi(this.#onMakeLiChildO.bind(this), [k,v,i]))
        }
        else {throw new TypeError(`dataは配列かオブジェクトであるべきです。例:['light','dark']/{light:{text:'☀', rt:'Light'}, dark:{text:'🌙', rt:'Dark'}} : ${data}`)}
        /*
        if (Array.isArray(data)) { return data.map((v,i)=>this.#onMakeLiA(v,i)) }
        else if ('object'===typeof data && Object===data.constructor) {
            return [...Object.entries(data)].map(([k,v],i)=>this.#onMakeLiO(k,v,i))
            //return [...Object.entries(data)].map(([k,v],i)=>this.#makeLiO(k,v,i))
        }
        else {throw new TypeError(`dataは配列かオブジェクトであるべきです。例:['light','dark']/{light:{text:'☀', rt:'Light'}, dark:{text:'🌙', rt:'Dark'}} : ${data}`)}
//        return [...Object.entries(data)].map(([k,v],i)=>this.#onMakeLi(k,v,i))
        */
    }
    //#makeLi(data, onMakeChild, args) {
    #makeLi(onMakeLiChild, args) {
        const li = document.createElement('li')
        li.dataset.key = args[0]
        li.style.display = this._core.mode === args[0] ? 'inline-block' : 'none'
        li.append(onMakeLiChild(...args))
        return li
    }
    /*
    #makeLiA(v, i) { const li = this.#makeLi(v); li.append(this.#onMakeLiChildA(v,i)) return li; }
    #makeLiO(k, v, i) {
        const li = this.#makeLi(v)
        li.append(this.#onMakeLiChildO(k, v, i))
        return li
    }
    #makeLi(data) {
        const li = document.createElement('li')
        li.dataset.key = k
        //li.append(this._onMakeLi(d))
        li.style.display = 'none'
        //li.append(this.#makeLiChild(data))
        li.append((Array.isArray(data)) 
        ? this.#makeLiChildA(data) 
        : ('object'===typeof data && Object===data.constructor) 
            ? this.#makeLiChildO(data)
            : null)
        return li
    }
    #makeLiChild(data) {
        if (Array.isArray(data)) { return data.map((v,i)=>this.#onMakeLiA(v,i)) }
        else if ('object'===typeof data && Object===data.constructor) {
            return [...Object.entries(data)].map(([k,v],i)=>this.#onMakeLiO(k,v,i))
            //return [...Object.entries(data)].map(([k,v],i)=>this.#makeLiO(k,v,i))
        }
        else {throw new TypeError(`dataは配列かオブジェクトであるべきです。例:['light','dark']/{light:{text:'☀', rt:'Light'}, dark:{text:'🌙', rt:'Dark'}} : ${data}`)}
    }
    */
    #onMakeLiChildA(v, i) { return document.createTextNode(v) } // data:['light','dark']
    #onMakeLiChildO(k, v, i) { // data:{light:{text:'☀', rt:'Light'}, dark:{text:'🌙', rt:'Dark'}}
        const ruby = document.createElement('ruby')
        ruby.style.rubyPosition = 'under'
        if (v.text) { ruby.textContent = v.text }
        else if (v.image) {
            const img = document.createElement('ruby')
            img.src = v.image
            ruby.appendChild(img)
        } else { throw new TypeError('vはオブジェクトでありtextかimageプロパティを持っているべきです。') }
//        ruby.textContent = v.text
        if (v.rt) {
            const rt = document.createElement('rt')
            rt.textContent = v.rt
            ruby.appendChild(rt)
        }
        return ruby
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
    }
    #update() {
        for (let li of this._el.children) {
            li.style.display = (li.dataset.key === this._core.mode) ? 'inline-block' : 'none';
        }
    }
}
window.ColorScheme = ColorScheme
})();
