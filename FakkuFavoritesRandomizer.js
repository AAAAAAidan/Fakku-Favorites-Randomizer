// ==UserScript==
// @name         FAKKU! Favorites Randomizer
// @namespace    https://fakku.net/
// @version      0.1
// @description  Favorites randomizer
// @match        https://www.fakku.net/users/*/favorites*
// @grant        GM.xmlHttpRequest
// ==/UserScript==

var currentUrl = window.location.href;
var counter = 0;
var log = "";

var currentPage = document.getElementsByClassName("pagination-selected")[0].innerHTML;
var pageLinks = document.getElementsByClassName("pagination-page");
var lastPage = pageLinks[pageLinks.length - 1].href.toString().replace(/.*page\//g, "");

if (currentPage > lastPage) lastPage = currentPage;

var currentTabContent = document.getElementsByClassName("tab-content active")[0];
var currentGridContent = currentTabContent.getElementsByClassName("grid-content page-100")[0];
var currentChapters = currentGridContent.getElementsByClassName("grid-block");

//console.log("Last page: " + lastPage);

for (var i = 0; i < currentChapters.length; i++)
{
    var pageInt = Math.ceil(Math.random() * lastPage);
    var url = currentUrl.replace(/\/favorites.*/g, "/favorites/page/" + pageInt);

    //console.log("Fetch page " + pageInt);

    GM.xmlHttpRequest({
        method: "GET",
        url: url,
        onload: function(response)
        {
            do
            {
                //console.log("Working on #" + counter);

                var parser = new DOMParser();
                var doc = parser.parseFromString(response.responseText, "text/html");

                var tabContent = doc.getElementsByClassName("tab-content active")[0];
                var gridContent = tabContent.getElementsByClassName("grid-content page-100")[0];
                var chapters = gridContent.getElementsByClassName("grid-block");

                var chapterInt = Math.floor(Math.random() * chapters.length);
                var chapter = chapters[chapterInt];
                var chapterId = chapter.getAttribute("id");
                var chapterThumb = chapter.getElementsByClassName("lazy poster")[0];
                chapterThumb.src = "https:" + chapterThumb.getAttribute("data-src");

                //console.log(chapterInt);
            }
            while (log.indexOf(chapterId) != -1);

            currentChapters[counter++].innerHTML = chapter.innerHTML;
            log += chapterId + "\n";
            //console.log(chapterId);
        }
    });
}
