"use strict";

/* global globalOptions, inverted_wordles */

// Bind necessary events
inverted_wordles.initPage = function (response) {
    inverted_wordles.bindNetlifyEvents(globalOptions);
    response.json().then(wordles => {
        inverted_wordles.listWordles(wordles, globalOptions.selectors.wordlesArea);
        inverted_wordles.bindInputFieldEvents();
        inverted_wordles.bindDeleteEvents();
    });
};

inverted_wordles.initWordles = function () {
    fetch("/api/fetch_wordles").then(
        response => inverted_wordles.initPage(response),
        error => inverted_wordles.reportStatus("Error at listing all wordles: " + error, document.querySelector(globalOptions.selectors.status), true)
    );
};
