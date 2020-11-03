
closeGameOver = function () {
    const menu = document.getElementById("new-game");
    menu.style.zIndex = "-1";
    menu.style.animation = ""
};

openNewGame = function () {
    const menu = document.getElementById("new-game");
    menu.style.zIndex = "1";
    menu.style.animation = "fadein 2s 1"
};

closeNewGame = function () {
    const menu = document.getElementById("new-game");
    menu.style.zIndex = "-1";
    menu.style.animation = ""
};