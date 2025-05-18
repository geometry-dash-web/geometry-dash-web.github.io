const container = document.getElementById("skins-container");
const allSkins = [0, 1, 2, 3, 4, 5, 6, 7]; // All possible skin IDs
const ownedSkins = JSON.parse(localStorage.getItem("ownedSkins") || "[]");
let selected = parseInt(localStorage.getItem("selectedSkin") || "0");

allSkins.forEach(id => {
    const skinDiv = document.createElement("div");
    skinDiv.className = `skin-sprite skin-${id}`;
    skinDiv.style.margin = "10px";
    skinDiv.style.border = selected === id ? "2px solid yellow" : "2px solid transparent";

    if (ownedSkins.includes(id)) {
        skinDiv.onclick = () => {
            selected = id;
            localStorage.setItem("selectedSkin", id);
            updateSelection();
        };
    } else {
        skinDiv.style.opacity = 0.4;
        skinDiv.title = "Not Owned";
    }

    container.appendChild(skinDiv);
});

function updateSelection() {
    const children = container.children;
    for (let i = 0; i < children.length; i++) {
        children[i].style.border = (allSkins[i] === selected) ? "2px solid yellow" : "2px solid transparent";
    }
}
