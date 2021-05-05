// Shared utility functions

"use strict";

/*
 * Convert a date into the format of "Month day, Year".
 * @param {String} inputDate - A string of date.
 * @return The string in the format of "Month day, Year".
 */
// eslint-disable-next-line
const convertDate = function (inputDate) {
    const dateObject = new Date(inputDate);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return `${months[dateObject.getMonth()]} ${dateObject.getDate()}, ${dateObject.getFullYear()}`;
};
