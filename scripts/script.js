const graphButton = document.getElementById("btn--get-graph")
const countryButton = document.getElementById("btn--get-countries")
const graph = document.getElementById("graph")
const sel = document.getElementById("countries")
sel.disabled = true

getCountries = async function () {
    const r = await fetch("http://127.0.0.1:8000/countries")
    sel.innerHTML = ""
    const countryList = await r.json()

    for (let i = 0; i < countryList.length; i++) {
        var opt = document.createElement('option');
        opt.innerHTML = countryList[i];
        opt.value = countryList[i];
        sel.appendChild(opt);
    }
    sel.disabled = false
}

getGraph = async function () {
    const data = {
        country: sel.value,
        filetype: "webp",
        bg_color: "#5e5e5e",
        bg_alpha: 0,
        line_color: "#0b03fc",
        point_color: "#fca103",
        text_color: "#6f03fc",
        grid_color: "#000000",
        grid_alpha: 0.2,
        axes_color: "#fc2003",
    }
    const r = await fetch("http://127.0.0.1:8000/graph", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    const graphBlob = await r.blob()
    const graphUrl = URL.createObjectURL(graphBlob)
    graph.src = graphUrl
}

graphButton.addEventListener("click", getGraph)
document.addEventListener("DOMContentLoaded", getCountries)