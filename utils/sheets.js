const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
	keyFile: "cred.json", // Make sure to upload the cred.json file //
	scopes: "https://www.googleapis.com/auth/spreadsheets"
});

async function authorize() {
    const client = await auth.getClient();

    const sheets = google.sheets({
        version: "v4",
        auth: client
    });

    return sheets;
}

async function getSpreadsheet(sheetId, range) {
    const sheets = await authorize();
    const result = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: range
    });

    return result.data.values;
}

async function appendRow(sheetId, range, values) {
    const sheets = await authorize();
    const result = await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: range,
        valueInputOption: "USER_ENTERED",
        resource: {
            values
        }
    });

    return result;
}

module.exports = { getSpreadsheet, appendRow }