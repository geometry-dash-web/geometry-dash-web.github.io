const shopItems = [0, 1, 2]; // Skin IDs from your sprite sheet (0–15)
let ownedSkins = JSON.parse(localStorage.getItem("ownedSkins") || "[]");
let orbs = parseInt(localStorage.getItem("orbs") || "0");
document.getElementById("orb-count").innerText = orbs;

shopItems.forEach(item => {
    const itemContainer = document.createElement("div");
    itemContainer.style.margin = "10px";

    // Display sprite preview
    const sprite = document.createElement("div");
    sprite.className = `skin-sprite skin-${item}`;
    itemContainer.appendChild(sprite);

    const info = document.createElement("p");
    info.innerText = `Skin #${item} - 10 orbs`;
    itemContainer.appendChild(info);

    const btn = document.createElement("button");
    btn.innerText = ownedSkins.includes(item) ? "Owned" : "Buy";
    btn.disabled = ownedSkins.includes(item);

    btn.onclick = () => {
        if (orbs >= 10 && !ownedSkins.includes(item)) {
            orbs -= 10;
            ownedSkins.push(item);
            localStorage.setItem("orbs", orbs);
            localStorage.setItem("ownedSkins", JSON.stringify(ownedSkins));
            btn.innerText = "Owned";
            btn.disabled = true;
            document.getElementById("orb-count").innerText = orbs;
        }
    };

    itemContainer.appendChild(btn);
    document.getElementById("shop-items").appendChild(itemContainer);
});
