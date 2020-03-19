// ==UserScript==
// @name              Intel Maps Link Provider
// @name:zh-cn        Ingress Intel地图链接工具
// @namespace         http://cyblocker.com/
// @version           0.1
// @description       Append Ingress Intel map link to the coordinate information on Wikipedia and Geohack.
// @description:zh-ch 在维基百科及其链接到的Geohack网站上提供Ingress Intel的地图链接
// @author            cyblocker
// @match             https://tools.wmflabs.org/geohack/*
// @match             https://*.wikipedia.org/wiki/*
// @grant             none
// ==/UserScript==

(function () {

    function EnsureDDFormat(input) {
        var pattern = /[NSWE]/i;
        if (pattern.test(input) == false) return input;
        console.debug("input: " + input);
        var parts = input.split(/[^\d\w]+/);
        var dd = parseInt(parts[0], 10) + parts[1] / 60 + parts[2] / (60 * 60);

        if (parts[3] == "S" || parts[3] == "W") {
            dd = dd * -1;
        }
        return dd;
    }

    function getIntelUrl() {
        const intelUrlPrefix = "https://intel.ingress.com/intel?ll=";
        var latitude = EnsureDDFormat(document.getElementsByClassName("latitude")[0].innerText);
        var longitude = EnsureDDFormat(document.getElementsByClassName("longitude")[0].innerText);
        var intelUrl = intelUrlPrefix + latitude + "," + longitude;
        return intelUrl;
    }

    function getWikiLinkItem() {
        var linkItem = document.createElement("a");
        linkItem.setAttribute("href", getIntelUrl());
        linkItem.innerHTML = '<img width="17" title="Ingress Intel Map" src="https://upload.wikimedia.org/wikipedia/commons/6/63/Ingress_Logo.png">';
        return linkItem;
    }

    'use strict';

    const GEOHACK_URL_FORMAT = /tools.wmflabs.org\/geohack\/geohack.php?/i;
    const WIKIPEDIA_URL_FORMAT = /wikipedia.org\/wiki/i;

    if (GEOHACK_URL_FORMAT.test(document.URL)) {
        var mapName = "Map";
        if (/language=zh-yue/.test(document.URL)) {
            mapName = "地圖";
        } else if (/language=ja/.test(document.URL)) {
            mapName = "地図";
        } else if (/language=zh/.test(document.URL)) {
            mapName = "地图";
        }
        // Emsamble the table
        var insertItem = document.createElement("tr");
        var serviceName = document.createElement("th");
        serviceName.innerHTML = '<img width="16" alt="Ingress Logo" src="https://upload.wikimedia.org/wikipedia/commons/6/63/Ingress_Logo.png"> Ingress Intel Map';
        serviceName.setAttribute("scope", "row");
        serviceName.setAttribute("style", "font-weight:normal; text-align:left;");
        insertItem.appendChild(serviceName);
        var mapLink = document.createElement("td");
        mapLink.innerHTML = '<a href="' + getIntelUrl() + '">' + mapName + '</a>';
        insertItem.appendChild(mapLink);
        var emptyTd = document.createElement("td");
        insertItem.appendChild(emptyTd);
        insertItem.appendChild(emptyTd);

        // Find correct location and insert
        var tableNode = document.getElementById("GEOTEMPLATE-GLOBAL").getElementsByTagName("tbody")[0];
        var firstItemNode = tableNode.getElementsByTagName("tr")[1];
        tableNode.insertBefore(insertItem, firstItemNode);
    }

    if (WIKIPEDIA_URL_FORMAT.test(document.URL)) {
        if (GEOHACK_URL_FORMAT.test(document.body.innerHTML) == false) return;
        var earthIcons = document.getElementsByClassName("geo-default");
        for (var i = 0; i < earthIcons.length; i++) {
            var parentNode = earthIcons[i].parentNode.parentNode;
            var nextSibling = earthIcons[i].parentNode;
            parentNode.insertBefore(getWikiLinkItem(), nextSibling);
        }
    }

})();