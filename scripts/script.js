let graph = document.querySelector("#graph");
let countrySelector = document.querySelector("#countries");
let startDateSelect = document.querySelector("#start-date");
let endDateSelect = document.querySelector("#end-date");
let bgOpacitySlider = document.querySelector("#bg-alpha-slider");
let bgOpacityNumber = document.querySelector("#bg-alpha-number");
let gridOpacitySlider = document.querySelector("#grid-alpha-slider");
let gridOpacityNumber = document.querySelector("#grid-alpha-number");
let inclRegression = document.querySelector("#include-regression");
let fileType = document.querySelector("#filetype");
let downloadButton = document.querySelector("#download-graph-button");
let prevTime = new Date().getTime();

let lightModeBtn = document.querySelector("#light")
let darkModeBtn = document.querySelector("#dark")

countrySelector.disabled = true;
startDateSelect.disabled = true;
endDateSelect.disabled = true;
bgOpacitySlider.disabled = true;
bgOpacityNumber.disabled = true;
gridOpacitySlider.disabled = true;
gridOpacityNumber.disabled = true;
fileType.disabled = true;
downloadButton.disabled = true;

let getCountries = async function () {

    try {
        const r = await fetch("http://127.0.0.1:8000/countries");
        countrySelector.innerHTML = "";
        const countryList = await r.json();

        for (let country of countryList) {
            let opt = document.createElement('option');
            opt.innerHTML = country;
            opt.value = country;
            countrySelector.appendChild(opt);
        };
        countrySelector.selectedIndex = -1;
        countrySelector.disabled = false;
    } catch {
        document.querySelector("#btn-get-graph").disabled = true;
    };
};

let getDates = async function () {

    startDateSelect.innerHTML = "";
    endDateSelect.innerHTML = "";

    let r = await fetch(`http://127.0.0.1:8000/dates/${countrySelector.value}`);
    const electionDates = await r.json();
    if (electionDates.length === 0) {
        return;
    };

    for (let i = 0; i < electionDates.length; i++) {
        if (i < electionDates.length - 1) {
            let opt = document.createElement('option');
            opt.innerHTML = electionDates[i];
            opt.value = electionDates[i];
            startDateSelect.appendChild(opt);
        };
        if (i > 0) {
            let opt = document.createElement('option');
            opt.innerHTML = electionDates[i];
            opt.value = electionDates[i];
            endDateSelect.appendChild(opt);
        };
        startDateSelect.selectedIndex = 0;
        endDateSelect.selectedIndex = electionDates.length - 2;
    };
    startDateSelect.disabled = false;
    endDateSelect.disabled = false;
};

let dateRangeModify = async function (event) {

    let startDateIndex = startDateSelect.selectedIndex;
    let endDateIndex = endDateSelect.selectedIndex;

    for (let i = 0; i < startDateSelect.childElementCount; i++) {
        startDateSelect.options[i].disabled = false;
        endDateSelect.options[i].disabled = false;
    };

    for (let i = 0; i < startDateIndex; i++) {
        let toDisable = endDateSelect.options[i];
        toDisable.disabled = true;
    };

    for (let i = endDateIndex + 1; i < startDateSelect.childElementCount; i++) {
        let toDisable = startDateSelect.options[i];
        toDisable.disabled = true;
    };

    getGraph(event);

};

let getGraph = async function (event) {

    event.preventDefault();
    if (countrySelector.value === "") {
        return;
    };

    let curTime = new Date().getTime();
    if (curTime - prevTime < 200) {
        return;
    };
    prevTime = curTime;

    fileType.disabled = false;
    bgOpacitySlider.disabled = false;
    bgOpacityNumber.disabled = false;
    gridOpacitySlider.disabled = false;
    gridOpacityNumber.disabled = false;


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

    if (fileType.value != "jpg") {
        if (event.target.id == fileType.id) {
            await getGraph(event);
        };
        return false;
    };

    document.querySelector("#bg-alpha-slider").value = 1;
    document.querySelector("#bg-alpha-number").value = 1;
    document.querySelector("#grid-alpha-slider").value = 1;
    document.querySelector("#grid-alpha-number").value = 1;

    if (fileType.value == "jpg" && event.target.id == fileType.id) {
        await getGraph(event);
    };

    return true;
};

let updateOpacity = async function (event) {

    const isJpg = await opacityException(event);
    if (isJpg) {
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

let downloadFile = function () {
    let link = downloadButton.querySelector("a");
    link.href = graph.src;
    link.download = `${countrySelector.value} historical parliament composition.${fileType.value}`;
    link.click();
};

// setDarkMode and setLightMode defined in "modeDetection.js".
darkModeBtn.addEventListener("click", setDarkMode);
lightModeBtn.addEventListener("click", setLightMode);

document.addEventListener("DOMContentLoaded", getCountries);

bgOpacitySlider.addEventListener("input", updateOpacity);
bgOpacityNumber.addEventListener("mouseup", updateOpacity);
gridOpacitySlider.addEventListener("input", updateOpacity);
gridOpacityNumber.addEventListener("mouseup", updateOpacity);

inclRegression.addEventListener("input", getGraph)

fileType.addEventListener("input", opacityException);

countrySelector.addEventListener("input", getDates);
startDateSelect.addEventListener("input", dateRangeModify);
endDateSelect.addEventListener("input", dateRangeModify);
countrySelector.addEventListener("input", getGraph);
downloadButton.addEventListener("click", downloadFile);

let form = document.querySelector("#graph-parameters");
form.addEventListener("submit", getGraph);
