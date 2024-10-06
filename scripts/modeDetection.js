let setLightMode = function () {
    document.querySelector("html").classList.add("light");
    document.querySelector("html").classList.remove("dark");
};

let setDarkMode = function () {
    document.querySelector("html").classList.add("dark");
    document.querySelector("html").classList.remove("light");
};

let determineLightDarkMode = function (event) {
    let query = window.matchMedia('(prefers-color-scheme: light)')
    if (event.matches || query.matches) {
        setLightMode();
    } else {
        setDarkMode();
    };
};

determineLightDarkMode(NaN);
const modeChange = window.matchMedia('(prefers-color-scheme: light)');
modeChange.addEventListener("change", determineLightDarkMode);
