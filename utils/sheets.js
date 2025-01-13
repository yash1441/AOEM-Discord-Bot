const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
    keyFile: "cred.json", // Make sure to upload the cred.json file //
    scopes: "https://www.googleapis.com/auth/spreadsheets",
});

async function authorize() {
    const client = await auth.getClient();

    const sheets = google.sheets({
        version: "v4",
        auth: client,
    });

    return sheets;
}

async function getSpreadsheet(sheetId, range, filterColumn = null) {
    const sheets = await authorize();
    const result = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: range,
    });

    let values = result.data.values;

    if (filterColumn !== null) {
        const columnIndex = filterColumn.charCodeAt(0) - "A".charCodeAt(0);
        values = values.filter(
            (row) => row[columnIndex] !== undefined && row[columnIndex] !== ""
        );
    }

    return values;
}

async function appendRow(sheetId, range, values) {
    const sheets = await authorize();
    const result = await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: range,
        valueInputOption: "USER_ENTERED",
        resource: {
            values,
        },
    });

    return result;
}

async function findOrAppend(sheetId, range, toFind, values) {
    const sheets = await authorize();
    const result = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: range,
    });

    if (!result.data.values || result.data.values.length === 0) {
        return [null, await appendRow(sheetId, range, values)];
    }

    const foundRows = result.data.values.filter((row) => row.includes(toFind));

    if (foundRows.length) return [foundRows, null];
    else return [null, await appendRow(sheetId, range, values)];
}

async function updateRow(sheetId, range, values) {
    const sheets = await authorize();
    const result = await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: range,
        valueInputOption: "USER_ENTERED",
        resource: {
            values,
        },
    });

    return result;
}

async function findRow(sheetId, range, toFind) {
    const sheets = await authorize();
    const result = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: range,
    });

    if (!result.data.values || result.data.values.length === 0) {
        return null;
    }

    const rowIndex = result.data.values.findIndex((row) =>
        row.includes(toFind)
    );
    if (rowIndex === -1) {
        return null;
    }

    const startRow = rowIndex + 2; // Assuming the range starts from row 2
    const endRow = startRow;
    const foundRange = `${range.split("!")[0]}!${startRow}:${endRow}`;

    return foundRange;
}

module.exports = {
    getSpreadsheet,
    appendRow,
    findOrAppend,
    updateRow,
    findRow,
};
