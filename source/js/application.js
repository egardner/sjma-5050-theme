/**
 * @fileOverview
 * @name application.js
 * @description This file serves as the entry point for Webpack, the JS library
 * responsible for building all CSS and JS assets for the theme.
 */

// Stylesheets
import "intersection-observer";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import "../css/application.scss";
import "leaflet/dist/leaflet.css";
import quicklink from "quicklink";
// import 'littlefoot/dist/littlefoot.css'

// JS Libraries (add them to package.json with `npm install [library]`)
import $ from "jquery";
import littlefoot from 'littlefoot' 

// Modules (feel free to define your own and import here)
import { toggleFullscreen } from "./helper";
import Search from "./search";
import Navigation from "./navigation";
import Popup from "./popup";
import DeepZoom from "./deepzoom";
import ArtistPage from "./artistPage";

// array of leaflet instances
const mapArr = [];

const footnoteOptions = {
    buttonTemplate: `
    <button
        aria-controls="fncontent:<% id %>"
        aria-expanded="false"
        aria-label="Footnote <% number %>"
        class="littlefoot-footnote__button"
        id="<% reference %>"
        rel="footnote"
        title="See Footnote <% number %>"
    />
    <% number %>
    </button>
    `
};

/**
 * toggleMenu
 * @description Show/hide the menu UI by changing CSS classes and Aria status.
 * This function is bound to the global window object so it can be called from
 * templates without additional binding.
 */
window[ "toggleMenu" ] = () => {
    let menu = document.getElementById( "site-menu" );
    let menuAriaStatus = menu.getAttribute( "aria-expanded" );

    menu.classList.toggle( "is-expanded", !menu.classList.contains( "is-expanded" ) );

    if ( menuAriaStatus === "true" ) {
        $( ".side-by-side > .quire-entry__image-wrap > .quire-entry__image" ).removeClass( "menu_open" );
        menu.setAttribute( "aria-expanded", "false" );
    } else {
        $( ".side-by-side > .quire-entry__image-wrap > .quire-entry__image" ).addClass( "menu_open" );
        menu.setAttribute( "aria-expanded", "true" );
    }
};

/**
 * toggleSearch
 * @description Show/hide the search UI by changing CSS classes and Aria status.
 * This function is bound to the global window object so it can be called from
 * templates without additinoal binding.
 */
window[ "toggleSearch" ] = () => {
    let searchControls = document.getElementById( "js-search" );
    let searchInput = document.getElementById( "js-search-input" );
    let searchAriaStatus = searchControls.getAttribute( "aria-expanded" );

    searchControls.classList.toggle(
        "is-active",
        !searchControls.classList.contains( "is-active" )
    );

    if ( searchAriaStatus === "true" ) {
        searchControls.setAttribute( "aria-expanded", "false" );
    } else {
        searchInput.focus();
        searchControls.setAttribute( "aria-expanded", "true" );
    }
};

/**
 * search
 * @description makes a search query using Lunr
 */
window[ "search" ] = () => {
    let searchInput = document.getElementById( "js-search-input" );
    let searchQuery = searchInput.value;
    let searchInstance = window[ "QUIRE_SEARCH" ];
    let resultsContainer = document.getElementById( "js-search-results-list" );
    let resultsTemplate = document.getElementById( "js-search-results-template" );

    if (searchQuery.length >= 3) {
        let searchResults = searchInstance.search( searchQuery );
        displayResults( searchResults );
    }

    function clearResults() {
        resultsContainer.innerText = "";
    }

    function displayResults( results ) {
        clearResults();

        results.forEach( result => {
            let clone = document.importNode(resultsTemplate.content, true);
            let item = clone.querySelector(".js-search-results-item");
            let title = clone.querySelector(".js-search-results-item-title");
            let type = clone.querySelector(".js-search-results-item-type");
            let length = clone.querySelector(".js-search-results-item-length");

            item.href = result.url;
            title.textContent = result.title;
            type.textContent = result.type;
            length.textContent = result.length;

            resultsContainer.appendChild(clone);
        });
    }
};

/**
 * globalSetup
 * @description Initial setup on first page load.
 */
function globalSetup() {
    let container = document.getElementById("container");
    container.classList.remove("no-js");
    var classNames = [];
    if (navigator.userAgent.match(/(iPad|iPhone|iPod)/i))
        classNames.push("device-ios");

    if (navigator.userAgent.match(/android/i)) classNames.push("device-android");

    if (classNames.length) classNames.push("on-device");

    loadSearchData();
}

/**
 * loadSearchData
 * @description Load full-text index data from the specified URL
 * and pass it to the search module.
 */
function loadSearchData() {
    // Grab search data
    let dataURL = $("#js-search").data("search-index");
    $.get(dataURL, {
        cache: true
    }).done(data => {
        data = typeof data === "string" ? JSON.parse(data) : data;
        window["QUIRE_SEARCH"] = new Search(data);
    });
}

/**
 * navigation
 * @description Turn on ability to use arrow keys
 * to get next adn previous pages
 */
let navigation;

function navigationSetup() {
    if (!navigation) {
        navigation = new Navigation();
    }
}

/**
 * @description
 * Set up modal for media
 */
function popupSetup( figureModal ) {
    toggleFullscreen(
        mapArr,
        document.getElementById("toggleFullscreen"),
        document.querySelector(".mfp-wrap")
    );
    if ( figureModal ) {
        Popup( ".q-figure__wrapper", mapArr );
    } else {
        mapSetup( ".quire-map" );
        deepZoomSetup( ".quire-deepzoom", mapArr );
    }
}

/**
 * @description
 * Render Map if Popup @false
 */
function mapSetup(ele) {
    return [...document.querySelectorAll(ele)].forEach(v => {
        let id = v.getAttribute("id");
        new Map(id);
    });
}

/**
 * @description
 * Render deepzoom or iiif if Popup @false
 */
function deepZoomSetup(ele, mapArr) {
    return [...document.querySelectorAll(ele)].forEach(v => {
        let id = v.getAttribute("id");
        new DeepZoom(id, mapArr);
    });
}

/**
 * @description
 * Adding GoogleChromeLabs quicklinks https://github.com/GoogleChromeLabs/quicklink
 * For faster subsequent page-loads by prefetching in-viewport links during idle time
 */
function quickLinksSetup() {
    let links = [...document.getElementsByTagName("a")];
    links = links.filter(a => {
        return a.hostname === window.location.hostname;
    });
    quicklink({
        urls: links,
        timeout: 4000,
        ignores: [
            /tel:/g,
            /mailto:/g,
            /#(.+)/,
            uri => uri.includes("tel:"),
            uri => uri.includes("mailto:"),
            uri => uri.includes("#"),
            uri => uri.includes(".zip"),
            uri => uri.includes(".epub"),
            uri => uri.includes(".pdf"),
            uri => uri.includes(".mobi")
        ]
    });
}

/**
 * @description
 * Set the date for the cite this partial
 * https://github.com/gettypubs/quire/issues/153
 * Quire books include a "Cite this Page" feature with page-level citations formatted in both Chicago and MLA style.
 * For MLA, the citations need to include a date the page was accessed by the reader.
 *
 */
function setDate() {
    let $date = $(".cite-current-date");
    let options = {
        year: "numeric",
        month: "short",
        day: "numeric"
    };
    let today = new Date();
    let formattedDate =
        today.toLocaleDateString("en-US", options).indexOf("May") !== -1
            ? today.toLocaleDateString("en-US", options)
            : [
                today.toLocaleDateString("en-US", options).slice(0, 3),
                ". ",
                today.toLocaleDateString("en-US", options).slice(4)
            ].join("");
    $date.empty();
    $date.text(formattedDate);
}

/**
 * @description
 * find expandable class and look for aria-expanded
 * https://github.com/gettypubs/quire/issues/152
 * Cite button where users can select, tied to two config settings:
 * citationPopupStyle - text for text only | icon for text and icon
 * citationPopupLinkText which is whatever text you it to say
 */
function toggleCite() {
    let expandables = document.querySelectorAll(".expandable [aria-expanded]");

    console.log( expandables );

    for (let i = 0; i < expandables.length; i++) {
        expandables[i].addEventListener("click", event => {
            // Allow these links to bubble up
            event.stopPropagation();
            let expanded = event.target.getAttribute("aria-expanded");
            if (expanded === "false") {
                event.target.setAttribute("aria-expanded", "true");
            } else {
                event.target.setAttribute("aria-expanded", "false");
            }
            let content = event.target.parentNode.querySelector(
                ".quire-citation__content"
            );
            if (content) {
                content.getAttribute("hidden");
                if (typeof content.getAttribute("hidden") === "string") {
                    content.removeAttribute("hidden");
                } else {
                    content.setAttribute("hidden", "hidden");
                }
            }
        });
    }
    document.addEventListener("click", event => {
        let content = event.target.parentNode;
        if (!content) return;
        if (
            content.classList.contains("quire-citation") ||
            content.classList.contains("quire-citation__content")
        ) {
            // do nothing
        } else {
            // find all Buttons/Cites
            let citeButtons = document.querySelectorAll(".quire-citation__button");
            let citesContents = document.querySelectorAll(".quire-citation__content");
            // hide all buttons
            if (!citesContents) return;
            for (let i = 0; i < citesContents.length; i++) {
                if (!citeButtons[i]) return;
                citeButtons[i].setAttribute("aria-expanded", "false");
                citesContents[i].setAttribute("hidden", "hidden");
            }
        }
    });
}

function artistPageSetup() {
    if (document.querySelector('.js-sjma-artist')) {

        // Pass in the functions that need to be re-run on each sub-page change
        new ArtistPage( function () {
            popupSetup( true );
            littlefoot( footnoteOptions );
        } );
    }
}

/**
 * pageSetup
 * @description This function is called after each smoothState reload.
 * Initialize any jquery plugins or set up page UI elements here.
 */
function pageSetup() {
    setDate();
    quickLinksSetup();
    navigationSetup();
    popupSetup( true );
    toggleCite();
    artistPageSetup();
    littlefoot( footnoteOptions );
}


// Start
// -----------------------------------------------------------------------------
//
// Run immediately
globalSetup();

// Run when document is ready
$(document).ready(() => {
    pageSetup();
});
