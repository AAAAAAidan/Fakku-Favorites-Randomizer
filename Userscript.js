// ==UserScript==
// @name         Fakku Favorites Randomizer
// @namespace    https://greasyfork.org/users/559356
// @version      1.0.3
// @description  Randomizes chapters on the favorites page.
// @author       Aidan
// @license      Unlicense
// @match        https://www.fakku.net/users/*/favorites*
// @grant        GM.xmlHttpRequest
// ==/UserScript==

// Button icon made by mavadee (https://www.flaticon.com/authors/mavadee) and modified to red (#AB2328)
const buttonIcon = "https://lh3.googleusercontent.com/pw/ACtC-3eY8JlZRL8Ohtkfip_eRIV1MJMS7IrSGNsNuflm-uBY1K1nTE-UbJK3lCwBehPHUe2vzNaU-11CEaWKgrqZGb_aqmWeE_5zrM2Y40CwA9_HlaDfA8yGB3XxSVHaMxobEH8MQN8awefblwPDqjTBIVF_=s512-no?authuser=1?.jpg";

const buttonCss = `min-width: 24px;
                   min-height: 24px;
                   background-image: url(` + buttonIcon + `);
                   background-repeat: no-repeat;
                   background-color: inherit;
                   background-size: 24px 24px;
                   border: none;`;

const buttonHtml = "<button id='userBtn' title='Randomize Favorites' style='" + buttonCss + "'></button>";

document.getElementsByClassName("py-8")[0].innerHTML += buttonHtml;
document.getElementById("userBtn").addEventListener("click", randomizeFavorites);

const currentUrl = window.location.href;
const parser = new DOMParser();

// There are different page counting elements, so we need to get each one
const pageLinks = document.getElementsByClassName("py-4");
let lastPage = 1;

for (var i = 0; i < pageLinks.length; i++) {
    const linkElement = pageLinks[i];
    let innerHTML = linkElement.innerHTML;

    // For prev, next, and last page links, we need to use the URL
    if (!Number(innerHTML)) {
        innerHTML = linkElement.href.toString().replace(/.*page\//g, "");
    }

    const pageNumber = parseInt(innerHTML);

    if (pageNumber > lastPage) {
        lastPage = pageNumber;
    }
}

function randomizeFavorites() {
    let chapterCounter = 0;
    const log = [];

    const gridId = currentUrl.replace(/.*fakku\.net/g, "").replace(/favorites\/.*/g, "favorites");
    const currentGridContent = document.getElementById(gridId);
    const currentChapters = currentGridContent.getElementsByClassName("col-comic");

    for (var i = 0; i < currentChapters.length; i++) {
        const pageIndex = Math.ceil(Math.random() * lastPage);
        const url = currentUrl.replace(/\/favorites.*/g, "/favorites/page/" + pageIndex);

        GM.xmlHttpRequest({
            method: "GET",
            url: url,
            onload: function(response) {
                const doc = parser.parseFromString(response.responseText, "text/html");
                const gridContent = doc.getElementById(gridId);
                const chapters = gridContent.getElementsByClassName("col-comic");

                let chapter = null;
                let chapterId = "";
                let loopCounter = 0; // To avoid infinite loops that occur when retrieving a page where all chapters have already been added

                do {
                    const chapterIndex = Math.floor(Math.random() * chapters.length);
                    chapter = chapters[chapterIndex];
                    chapterId = chapter.getAttribute("id");
                } while (log.includes(chapterId) && ++loopCounter < 3); // Repeat if chapter has already been added

                currentChapters[chapterCounter++].innerHTML = chapter.innerHTML;
                log.push(chapterId);
            }
        });
    }
}
