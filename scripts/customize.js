const container = document.getElementById("skins-container");
const skins = ["cyan", "red", "green", "yellow"];
let selected = localStorage.getItem("selectedSkin") || "cyan";

skins.forEach(skin => {
    const btn = document.createElement("button");
    btn.innerText = skin;
    btn.style.backgroundColor = skin;
    btn.onclick = () => {
        selected = skin;
        localStorage.setItem("selectedSkin", skin);
        alert("Selected: " + skin);
    };
    container.appendChild(btn);
});