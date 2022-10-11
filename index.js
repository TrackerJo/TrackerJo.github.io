/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */
//FROM https://developers.google.com/sheets/api/quickstart/js
// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID = '121005583930-rg8vb71qq25rfevvmi3krh3lr0o3clau.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCI-AEx3ZdOx9W03_iKRMcJCRJl4AB-Qd0';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

let tokenClient;
let gapiInited = false;
let gisInited = false;
let gLoggedIn = false;
const store = document.getElementById('store');

document.getElementById('login-google').style.visibility = 'hidden';
document.getElementById('enter-store').style.visibility = 'hidden';
document.getElementById('school-info').style.visibility = 'hidden';
store.style.visibility = 'hidden';

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
    gapi.load('client', intializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function intializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    });
    gisInited = true;
    maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('login-google').style.visibility = 'visible';
        
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
        throw (resp);
        }
        gLoggedIn = true;
        let label = document.createElement('label');
        label.textContent = "Successfully logged into Google!"
        label.id="logged-in"
        document.getElementById('login-google').remove()
        document.getElementById('school-info').style.visibility = 'visible';
        
    };
    
    if (gapi.client.getToken() === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        tokenClient.requestAccessToken({prompt: 'consent'});
        
    } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({prompt: ''});
    }
}

const loginGoogleBtn = document.getElementById('login-google');
const gradeInput = document.getElementById('grade');
const nameInput = document.getElementById('name');
const enterBtn = document.getElementById('enter-store');
const halftimeInput = document.getElementById('halftime');
const submitOrderBtn = document.getElementById('submit-order')
const bucksCountlbl = document.getElementById('bucks-count')
const items = document.querySelectorAll('.item')
const storeSheetID = "1FzgpF7zWxAEZqDGVi-ynbrXbktBhPUmNN8b04nzSJlE"
const pricesSheetName = "Shop Prices"
const bankSheetName = "Bank"
const ordersSheetName = "Orders"
let validName = false
let gradeColumn
let studentName
let studentGrade
let halftimeFacilitator
let numOfTigerBucks
let studentRow
let maxChips
let maxSnacks
let maxSchool
let itemPrices
let order = {
    orderName: "",
    orderHalftime: "",
    orderItem1: "",
    orderItem2: "",
    orderItem3: ""
}
let numOfItemsBought = 0
let numOfOrders
loginGoogleBtn.addEventListener('click', () => {
    handleAuthClick()
});

function checkIfCompletedLogin(){
    if(validName && gLoggedIn){
        document.getElementById('enter-store').style.visibility = 'visible';
    } else{
        document.getElementById('enter-store').style.visibility = 'hidden';
    }
   
    
}


nameInput.addEventListener('change', () => {
    if(nameInput.value != ""){
        
        validName = true
    } else{
        validName = false
    }
    checkIfCompletedLogin()
        
});

async function getValue(spreadsheetId, sheetName, range){
    try{
    response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: sheetName + "!" + range,
        });
        const result = response.result;
        console.log(result)
        const output = result.values[0]
        console.log(output)
        return output;
    } catch(err){
        console.error("Error when trying to get cells: " + err.message)
        
    }
}

async function getValueRow(spreadsheetId, sheetName, range, primaryKey){
    const data = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: sheetName + "!" + range,
      });
      
      //here you will get that array of arrays
      const allData = data.result.values; 
      
      //Now you have to find an index in the subarray of Primary Key (such as 
      //email or anything like that
      
      const flattenedData = allData.map((someArray) => {
        return someArray[primaryKey]; //My primary key is on the index 2 in the email 
        Array
    });

      return flattenedData;
}


async function getValueKeyPair(spreadsheetId, sheetName, range, key, value){
    const data = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: sheetName + "!" + range,
      });
      
      //here you will get that array of arrays
      const allData = data.result.values; 
      
      //Now you have to find an index in the subarray of Primary Key (such as 
      //email or anything like that
      
      const keyArray = allData.map((someArray) => {
        return someArray[key]; //My primary key is on the index 2 in the email 
        Array
    });
    const valueArray = allData.map((someArray) => {
        return someArray[value]; //My primary key is on the index 2 in the email 
        Array
    });
    let keyValueArray = []
   keyArray.forEach((v, i) => {
    keyValueArray[v] = valueArray[i]
   })

      return keyValueArray;
}

//FROM https://developers.google.com/sheets/api/guides/values
function updateValues(spreadsheetId, sheetName, range, _values, callback) {
    let values = [
        [
        // Cell values ...
        ],
        // Additional rows ...
    ];
    values = _values;
    const body = {
        values: values,
    };
    try {
        gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: sheetName + "!" + range,
        valueInputOption: "USER_ENTERED",
        resource: body,
        }).then((response) => {
        const result = response.result;
        console.log(`${result.updatedCells} cells updated.`);
        if (callback) callback(response);
        });
    } catch (err) {
        //document.getElementById('content').innerText = err.message;
        console.error("Error when trying to update cells: " + err.message);
        return;
    }
}


enterBtn.addEventListener('click', async () => {
    studentName = nameInput.value
    studentGrade = gradeInput.value
    halftimeFacilitator = halftimeInput.value
    order.orderName = studentName
    order.orderHalftime = halftimeFacilitator
    let flattenedData = await getValueRow(storeSheetID, bankSheetName, "A1:K78", 1);
    studentRow = flattenedData.indexOf("Nate") + 1;
    
    if(studentGrade == 6)
    {
        gradeColumn = "K"
    } else if(studentGrade == 7){
        gradeColumn = "G"
    } else
    {
        gradeColumn = "C"
    }
    numOfTigerBucks = await getValue(storeSheetID, bankSheetName, gradeColumn + studentRow)
    bucksCountlbl.textContent = `${numOfTigerBucks} Tiger Bucks`
    maxChips = await getValue(storeSheetID, pricesSheetName, "F2")
    maxSnacks = await getValue(storeSheetID, pricesSheetName, "F3")
    maxSchool = await getValue(storeSheetID, pricesSheetName, "F4")
    numOfOrders = await getValue(storeSheetID, ordersSheetName, "H1")
    itemPrices = await getValueKeyPair(storeSheetID, pricesSheetName, "A2:B21", 0, 1);
    console.log(itemPrices)
    const login = document.getElementById('login');
    login.remove()

    store.style.visibility = 'visible';

    alert("Welcome " + studentName + " to the Tiger Store! You are in " + studentGrade + "th grade and have " + numOfTigerBucks + " tiger bucks" )
})

items.forEach((item) => {
    item.addEventListener('click', () => {
        let itemPrice = itemPrices[item.id]
        if(parseInt(itemPrice) > parseInt(numOfTigerBucks)){
            alert("You only have " + numOfTigerBucks + " tiger bucks and you need " + itemPrice + " tiger bucks") 
            return
        }
        numOfTigerBucks -= itemPrice
        numOfItemsBought++
        if(numOfItemsBought == 1){
            order.orderItem1 = item.id
        } else if(numOfItemsBought == 2){
            order.orderItem2 = item.id
        } else{
            order.orderItem3 = item.id
        }
        bucksCountlbl.textContent = `${numOfTigerBucks} Tiger Bucks`
        alert("You bought " + item.id + " for " + itemPrice + " tiger bucks!")

    })
})

submitOrderBtn.addEventListener('click', async () => {
    alert(`Order Summary: \n Name: ${order.orderName} \n Halftime Facilitator: ${order.orderHalftime} \n Item #1: ${order.orderItem1} \n Item #2: ${order.orderItem2} \n Item #3: ${order.orderItem3}`)
    numOfOrders++;
    await updateValues(storeSheetID, ordersSheetName, "A" + (numOfOrders + 1), [[order.orderName, order.orderHalftime, order.orderItem1, order.orderItem2, order.orderItem3]])
    await updateValues(storeSheetID, ordersSheetName, "H1" , [[numOfOrders]])
    await updateValues(storeSheetID, bankSheetName, gradeColumn + studentRow, [[numOfTigerBucks]])
    location.reload()

})