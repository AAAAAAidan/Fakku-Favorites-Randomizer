// ==UserScript==
// @name         Fakku Favorites Randomizer
// @namespace    https://greasyfork.org/users/559356
// @version      1.0.2
// @description  Randomizes chapters on the favorites page.
// @author       Aidan
// @match        https://www.fakku.net/users/*/favorites*
// @grant        GM.xmlHttpRequest
// ==/UserScript==

var pageMeta = document.getElementsByClassName("pagination-2020");

if (pageMeta.length > 0) {
    // Button icon made by mavadee (https://www.flaticon.com/authors/mavadee) and modified to red (#AB2328)
    var buttonIcon = "https://lh3.googleusercontent.com/pw/ACtC-3eY8JlZRL8Ohtkfip_eRIV1MJMS7IrSGNsNuflm-uBY1K1nTE-UbJK3lCwBehPHUe2vzNaU-11CEaWKgrqZGb_aqmWeE_5zrM2Y40CwA9_HlaDfA8yGB3XxSVHaMxobEH8MQN8awefblwPDqjTBIVF_=s512-no?authuser=1?.jpg";

    var buttonCss = `float: right;
                     min-width: 24px;
                     min-height: 24px;
                     background-image: url(` + buttonIcon + `);
                     background-repeat: no-repeat;
                     background-color: inherit;
                     background-size: 24px 24px;
                     border: none;`;

    var buttonHtml = "<button id='userBtn' title='Randomize Favorites' style='" + buttonCss + "'></button>";

    document.getElementsByClassName("pagination-results")[0].innerHTML += buttonHtml;
    document.getElementById("userBtn").addEventListener("click", randomizeFavorites);

    var currentUrl = window.location.href;
    var parser = new DOMParser();

    // There are three different page counting elements, so we need to get each one
    var currentPage = document.getElementsByClassName("pagination-selected")[0].innerHTML;
    var textLinks = document.getElementsByClassName("pagination-text");
    var lastText = parseInt(textLinks[textLinks.length - 1].href.toString().replace(/.*page\//g, ""));
    var pageLinks = document.getElementsByClassName("pagination-page");
    var lastPage = parseInt(pageLinks[pageLinks.length - 1].href.toString().replace(/.*page\//g, ""));

    // Default to zero in case no number is found
    if (!lastText) lastText = 0;
    if (!lastPage) lastPage = 0;

    // Compare for the actual last page
    if (lastText > lastPage) lastPage = lastText;
    if (currentPage > lastPage) lastPage = currentPage;
}

function randomizeFavorites() {
    var chapterCounter = 0;
    var log = "";

    var currentTabContent = document.getElementsByClassName("tab-content active")[0];
    var currentGridContent = currentTabContent.getElementsByClassName("grid-content page-100")[0];
    var currentChapters = currentGridContent.getElementsByClassName("grid-block");

    for (var i = 0; i < currentChapters.length; i++) {
        var pageInt = Math.ceil(Math.random() * lastPage);
        var url = currentUrl.replace(/\/favorites.*/g, "/favorites/page/" + pageInt);

        GM.xmlHttpRequest({
            method: "GET",
            url: url,
            onload: function(response) {
                var loopCounter = 0;

                do {
                    var doc = parser.parseFromString(response.responseText, "text/html");
                    var tabContent = doc.getElementsByClassName("tab-content active")[0];
                    var gridContent = tabContent.getElementsByClassName("grid-content page-100")[0];
                    var chapters = gridContent.getElementsByClassName("grid-block");

                    var chapterInt = Math.floor(Math.random() * chapters.length);
                    var chapter = chapters[chapterInt];
                    var chapterId = chapter.getAttribute("id");
                    var chapterThumb = chapter.getElementsByClassName("lazy poster")[0];

                    // The src is empty by default, so we get the thumbnail from the data-src
                    chapterThumb.src = "https:" + chapterThumb.getAttribute("data-src");

                    // To avoid infinite loops that occur when retrieving a page where all chapters have already been added
                    loopCounter++;
                    if (loopCounter > 2) break;
                }
                while (log.indexOf(chapterId) != -1); // Repeat if chapter has already been added

                currentChapters[chapterCounter++].innerHTML = chapter.innerHTML;
                log += chapterId + "\n";
            }
        });
    }
}
