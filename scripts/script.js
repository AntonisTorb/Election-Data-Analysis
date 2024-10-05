let graph = document.querySelector("#graph");
let countrySelector = document.querySelector("#countries");
let bgOpacitySlider = document.querySelector("#bg-alpha-slider");
let bgOpacityNumber = document.querySelector("#bg-alpha-number");
let gridOpacitySlider = document.querySelector("#grid-alpha-slider");
let gridOpacityNumber = document.querySelector("#grid-alpha-number");
let fileType = document.querySelector("#filetype");
let downloadButton = document.querySelector("#download-graph-button");

let lightModeBtn = document.querySelector("#light")
let darkModeBtn = document.querySelector("#dark")

countrySelector.disabled = true;
bgOpacitySlider.disabled = true;
bgOpacityNumber.disabled = true;
gridOpacitySlider.disabled = true;
gridOpacityNumber.disabled = true;
fileType.disabled = true;
downloadButton.disabled = true;

/*
This doesn't work on Chrome...
let test = function(event){
    console.log(event.matches)
}

const query = window.matchMedia('(prefers-color-scheme: light)');
console.log(query.matches)
query.addEventListener("change", test)*/

let setLightMode = function(){
    let root = document.querySelector(':root');
    let rootStyle = getComputedStyle(root);

    root.style.setProperty("--text-color", rootStyle.getPropertyValue("--light-text-color"));
    root.style.setProperty("--main-bg-color", rootStyle.getPropertyValue("--light-color-1"));
    root.style.setProperty("--scrollbar-thumb-color", rootStyle.getPropertyValue("--light-color-2"));
    root.style.setProperty("--header-bg-color", rootStyle.getPropertyValue("--light-color-3"));
    root.style.setProperty("--footer-bg-color", rootStyle.getPropertyValue("--light-color-3"));
    root.style.setProperty("--input-bg-color", rootStyle.getPropertyValue("--light-color-3"));
    root.style.setProperty("--scrollbar-track-color", rootStyle.getPropertyValue("--light-color-4"));
    root.style.setProperty("--border-color", rootStyle.getPropertyValue("--light-color-4"));
    root.style.setProperty("--mode-selection-color", rootStyle.getPropertyValue("--light-color-4"));
    root.style.setProperty("--hover-input-color", rootStyle.getPropertyValue("--light-color-4"));
    root.style.setProperty("--dl-btn-color", rootStyle.getPropertyValue("--light-dl-btn-color"));
    root.style.setProperty("--dl-btn-hover-color", rootStyle.getPropertyValue("--light-dl-btn-hover-color"));
    root.style.setProperty("--disabled-input-text-color", rootStyle.getPropertyValue("--light-disabled-input-text-color"));
    root.style.setProperty("--link-color", rootStyle.getPropertyValue("--light-link-color"));
    root.style.setProperty("--link-hover-color", rootStyle.getPropertyValue("--light-link-hover-color"));
    lightModeBtn.style.setProperty("background-color", rootStyle.getPropertyValue("--mode-selection-color"));
    darkModeBtn.style.setProperty("background-color", "transparent");
};

let setDarkMode = function(){
    let root = document.querySelector(':root');
    let rootStyle = getComputedStyle(root);

    root.style.setProperty("--text-color", rootStyle.getPropertyValue("--dark-text-color"));
    root.style.setProperty("--main-bg-color", rootStyle.getPropertyValue("--dark-color-1"));
    root.style.setProperty("--scrollbar-thumb-color", rootStyle.getPropertyValue("--dark-color-2"));
    root.style.setProperty("--header-bg-color", rootStyle.getPropertyValue("--dark-color-3"));
    root.style.setProperty("--footer-bg-color", rootStyle.getPropertyValue("--dark-color-3"));
    root.style.setProperty("--input-bg-color", rootStyle.getPropertyValue("--dark-color-3"));
    root.style.setProperty("--scrollbar-track-color", rootStyle.getPropertyValue("--dark-color-4"));
    root.style.setProperty("--border-color", rootStyle.getPropertyValue("--dark-color-4"));
    root.style.setProperty("--mode-selection-color", rootStyle.getPropertyValue("--dark-color-4"));
    root.style.setProperty("--hover-input-color", rootStyle.getPropertyValue("--dark-color-4"));
    root.style.setProperty("--dl-btn-color", rootStyle.getPropertyValue("--dark-dl-btn-color"));
    root.style.setProperty("--dl-btn-hover-color", rootStyle.getPropertyValue("--dark-dl-btn-hover-color"));
    root.style.setProperty("--disabled-input-text-color", rootStyle.getPropertyValue("--dark-disabled-input-text-color"));
    root.style.setProperty("--link-color", rootStyle.getPropertyValue("--dark-link-color"));
    root.style.setProperty("--link-hover-color", rootStyle.getPropertyValue("--dark-link-hover-color"));
    darkModeBtn.style.setProperty("background-color", rootStyle.getPropertyValue("--mode-selection-color"));
    lightModeBtn.style.setProperty("background-color", "transparent");
};

let getCountries = async function () {
    try{
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
        fileType.disabled = false;
        bgOpacitySlider.disabled = false;
        bgOpacityNumber.disabled = false;
        gridOpacitySlider.disabled = false;
        gridOpacityNumber.disabled = false;
    }catch{
        let getBtn = document.querySelector("#btn-get-graph").disabled = true;
    };
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

darkModeBtn.addEventListener("click", setDarkMode)
lightModeBtn.addEventListener("click", setLightMode)

document.addEventListener("DOMContentLoaded", getCountries);

bgOpacitySlider.addEventListener("input", updateOpacity);
bgOpacityNumber.addEventListener("input", updateOpacity);
gridOpacitySlider.addEventListener("input", updateOpacity);
gridOpacityNumber.addEventListener("input", updateOpacity);

fileType.addEventListener("input", opacityException);

countrySelector.addEventListener("input", getGraph);
downloadButton.addEventListener("click", downloadFile);

let form = document.querySelector("#graph-parameters");
form.addEventListener("submit", getGraph);
