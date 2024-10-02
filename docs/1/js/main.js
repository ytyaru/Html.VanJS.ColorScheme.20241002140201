window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOMContentLoaded!!');
    const {h1, p, a} = van.tags
    const author = 'ytyaru'
    van.add(document.querySelector('main'), 
        h1(a({href:`https://github.com/${author}/Html.VanJS.ColorScheme.20241002140201/`}, 'ColorScheme')),
        p('配色設定'),
//        p('Color scheme settings'),
    )
    van.add(document.querySelector('footer'),  new Footer('ytyaru', '../').make())

    const cs = new ColorScheme()
    cs.mode = 'dark'
    cs.mode = 'light'
    console.log(cs.ui.el)
    van.add(document.body, cs.ui.el)
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

