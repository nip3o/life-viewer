function ajax(url, method='GET') {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest()
        xhr.open(method, url)

        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response)
            } else {
                reject()
            }
        }
        xhr.onerror = reject
        xhr.send()
    })
}

let app = new Vue({
    el: '#app',
    data: {
        connectionError: false,
        entries: [],
        activeEntry: null,
        activeEntryHTML: null,
        entriesByYear: {},
    },
})

function getEntryHTML(entry) {
    return ajax('../' + entry.path).then((text) => {
        const converter = new showdown.Converter()
        return converter.makeHtml(text)
    })
}

Vue.component('entry-item', {
    props: ['entry'],
    template: `
<div class="entry-item" v-on:click.prevent="showEntry(entry)" v-bind:class="{ active: isActive(entry) }">
    <div><a href="#">{{ entry.title }}</a></div>
    <small>{{ entry.date | date("dddd D MMM YYYY") }}</small> |
    <small>{{ entry.tags.join(', ') }}</small>
</div>
`,
    methods: {
        showEntry: (entry) => {
            app.activeEntry = entry

            getEntryHTML(entry).then((html) => {
                app.activeEntryHTML = html
            })
        },
        isActive: (entry) => {
            return app.activeEntry === entry
        }
    },
    filters: {
        date: (value, format) => {
            return moment(value).format(format)
        }
    },
})

ajax('life.json').then((response) => {
    app.showOverview = false
    app.entries = JSON.parse(response).map(item => {
        item.date = new Date(item.date)
        return item
    }).sort((a, b) => b.date - a.date)


    app.entriesByYear = app.entries.reduce((result, value) => { 
        const year = value.date.getFullYear()
        result[year] = result[year] || []
        result[year].push(value)
        return result
    }, {})

}).catch((e) => {
    console.error(e)
    app.connectionError = true
})
