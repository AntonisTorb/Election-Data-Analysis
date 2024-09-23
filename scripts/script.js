let graph = document.querySelector("#graph");
let countrySelector = document.querySelector("#countries");
let fileType = document.querySelector("#filetype");
let downloadButton = document.querySelector("#download-graph-button");

countrySelector.disabled = true;
downloadButton.disabled = true;

let getCountries = async function () {
    const r = await fetch("http://127.0.0.1:8000/countries");
    countrySelector.innerHTML = "";
    const countryList = await r.json();

    for (let i = 0; i < countryList.length; i++) {
        var opt = document.createElement('option');
        opt.innerHTML = countryList[i];
        opt.value = countryList[i];
        countrySelector.appendChild(opt);
    };
    countrySelector.disabled = false;
};

let getGraph = async function (event) {

    event.preventDefault();
    const form = document.querySelector("#graph-parameters");
    const formData = new FormData(form);
    const graphParameters = Object.fromEntries(formData);

    // console.log(JSON.stringify(graphParameters));

    const r = await fetch("http://127.0.0.1:8000/graph", {
        method: "POST",
        headers: {
            'Accept': 'image/*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(graphParameters)
    });

    const graphBlob = await r.blob();
    const graphUrl = URL.createObjectURL(graphBlob);
    graph.src = graphUrl;
    downloadButton.disabled = false;
};

let opacityException = async function (event) {

    if (fileType.value != "jpg"){
        if (event.target.id == fileType.id) {
            await getGraph(event);
        };
        return false;
    };

    document.querySelector("#bg-alpha-slider").value = 1;
    document.querySelector("#bg-alpha-number").value = 1;
    document.querySelector("#grid-alpha-slider").value = 1;
    document.querySelector("#grid-alpha-number").value = 1;

    if (fileType.value == "jpg" && event.target.id == fileType.id){
        await getGraph(event);
    };

    return true;
};

let updateOpacity = async function (event) {

    const isJpg = await opacityException(event);
    if (isJpg){
        return;
    };

    if (event.target.id == "bg-alpha-slider") {
        const slider = document.querySelector("#bg-alpha-slider");
        const number = document.querySelector("#bg-alpha-number");
        number.value = slider.value;
    } else if (event.target.id == "bg-alpha-number") {
        const slider = document.querySelector("#bg-alpha-slider");
        const number = document.querySelector("#bg-alpha-number");
        slider.value = number.value;
    } else if (event.target.id == "grid-alpha-slider") {
        const slider = document.querySelector("#grid-alpha-slider");
        const number = document.querySelector("#grid-alpha-number");
        number.value = slider.value;
    } else if (event.target.id == "grid-alpha-number") {
        const slider = document.querySelector("#grid-alpha-slider");
        const number = document.querySelector("#grid-alpha-number");
        slider.value = number.value;
    };
    await getGraph(event);
};

let downloadFile = function(){
    let link = downloadButton.querySelector("a");
    link.href = graph.src;
    link.download = `${countrySelector.value} historical parliament composition.${fileType.value}`;
    link.click();
};

document.addEventListener("DOMContentLoaded", getCountries);

let bgOpacitySlider = document.querySelector("#bg-alpha-slider");
let bgOpacityNumber = document.querySelector("#bg-alpha-number");

let gridOpacitySlider = document.querySelector("#grid-alpha-slider");
let gridOpacityNumber = document.querySelector("#grid-alpha-number");

bgOpacitySlider.addEventListener("input", updateOpacity);
bgOpacityNumber.addEventListener("input", updateOpacity);
gridOpacitySlider.addEventListener("input", updateOpacity);
gridOpacityNumber.addEventListener("input", updateOpacity);

fileType.addEventListener("input", opacityException);

countrySelector.addEventListener("input", getGraph);
downloadButton.addEventListener("click", downloadFile);

let form = document.querySelector("#graph-parameters");
form.addEventListener("submit", getGraph);
