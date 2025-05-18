const shopItems = ["red", "green", "yellow"];
let ownedSkins = JSON.parse(localStorage.getItem("ownedSkins") || "[]");
let orbs = parseInt(localStorage.getItem("orbs") || "0");
document.getElementById("orb-count").innerText = orbs;

shopItems.forEach(item => {
    const div = document.createElement("div");
    div.innerText = "Buy " + item + " skin for 10 orbs";
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

    div.appendChild(btn);
    document.getElementById("shop-items").appendChild(div);
});