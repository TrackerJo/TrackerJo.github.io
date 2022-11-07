/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */
//FROM https://developers.google.com/sheets/api/quickstart/js
// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID = '121005583930-rg8vb71qq25rfevvmi3krh3lr0o3clau.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCI-AEx3ZdOx9W03_iKRMcJCRJl4AB-Qd0';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = ["https://sheets.googleapis.com/$discovery/rest?version=v4",'https://people.googleapis.com/$discovery/rest?version=v1'];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo/profile https://www.googleapis.com/auth/userinfo.email';

let tokenClient;
let gapiInited = false;
let gisInited = false;
let gLoggedIn = false;
const store = document.getElementById('store');

document.getElementById('login-google').style.visibility = 'hidden';
document.getElementById('enter-store').style.visibility = 'hidden';
document.getElementById('school-info').style.visibility = 'hidden';
document.getElementById('cart').style.visibility = 'hidden';
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
        discoveryDocs: DISCOVERY_DOC,
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
        document.getElementById('google-signin').remove()
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
const reviewOrderBtn = document.getElementById('review-order')
const submitOrderBtn = document.getElementById('submit-order')
const bucksCountlbl = document.getElementById('bucks-count')
const accountInfoBtn = document.getElementById('accountInfo')
const items = document.querySelectorAll('.item')
const storeSheetID = "1G_CxHb0M-ZenzjliF0oGT2n9hGV99ZiByaJsFCd3Qq0"
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
let maxRaffles
let maxSnacks
let maxSchool
let itemPrices
let rafflesBought = 0
let snacksBought = 0
let schoolBought = 0
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

accountInfoBtn.addEventListener('click', () => {
    alert("Email: tigerbuckstore@gmail.com\nPassword: tigerStore!23")
})

function checkIfCompletedLogin(){
    if(validName && gLoggedIn){
        document.getElementById('enter-store').style.visibility = 'visible';
    } else{
        document.getElementById('enter-store').style.visibility = 'hidden';
    }
   
    
}
//domcontetnloaded
document.addEventListener('DOMContentLoaded', () => {
     //Increase login div opacity slowly start at 0 end at 1
        let loginDiv = document.getElementById('login')
        let loginDivOpacity = 0
        let loginDivInterval = setInterval(() => {
            loginDiv.style.opacity = loginDivOpacity
            loginDivOpacity += 0.05
            if(loginDivOpacity >= 1){
                clearInterval(loginDivInterval)
            }
        }
        , 50)
})


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

async function getIntValue(spreadsheetId, sheetName, range){
    try{
    response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: sheetName + "!" + range,
        });
        const result = response.result;
        console.log(result)
        const output = result.values[0]
        console.log(output)
        return parseInt(output);
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
    studentName = peopleAPI()
    studentGrade = gradeInput.value
    halftimeFacilitator = halftimeInput.value
    order.orderName = studentName
    order.orderHalftime = halftimeFacilitator
    let flattenedData = await getValueRow(storeSheetID, bankSheetName, "A1:K78", 1);
    if(!flattenedData.includes(studentName)){
        alert("Please make sure you entered your name correctly and try again!")
        return;
    }
    studentRow = flattenedData.indexOf(studentName) + 1;
    
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
    if(numOfTigerBucks == undefined){
        alert("Please make sure you entered the correct grade and try again!")
        return;
    }
    
    bucksCountlbl.textContent = `${numOfTigerBucks} Tiger Bucks`
    maxRaffles = await getIntValue(storeSheetID, pricesSheetName, "F2")
    maxSnacks = await getIntValue(storeSheetID, pricesSheetName, "F3")
    maxSchool = await getIntValue(storeSheetID, pricesSheetName, "F4")
    numOfOrders = await getIntValue(storeSheetID, ordersSheetName, "H1")
    itemPrices = await getValueKeyPair(storeSheetID, pricesSheetName, "A2:B", 0, 1);
    console.log(itemPrices)
    const login = document.getElementById('login');
    //fade out login startin at 1 end at 0
    let loginDivInterval = setInterval(() => {
        if (login.style.opacity > 0) {
            login.style.opacity -= 0.05;
        } else {
            clearInterval(loginDivInterval);
            login.style.display = "none";
            login.remove()
            store.style.opacity = 0;
            store.style.visibility = 'visible';
            //fade in store startin at 0 end at 1
            let storeDivOpacity = 0
            let storeDivInterval = setInterval(() => {
                store.style.opacity = storeDivOpacity
                storeDivOpacity += 0.05
                if(storeDivOpacity >= 1){
                    clearInterval(storeDivInterval)
                }
            }
            , 50)
        }
    }, 50);

    

    
    
    alert("Welcome " + studentName + " to the Tiger Store! You are in " + studentGrade + "th grade and have " + numOfTigerBucks + " tiger bucks" )
})

async function peopleAPI(){
    let pName;

       
   // pName = gapi.client.people.people.get({
   //     'resourceName': 'people/me',
    //    'requestMask': 'names'
    //    });
    
    response = await gapi.client.people.people.get({
        'resourceName': 'people/me',
      'requestMask.includeField': 'person.names'
      });
      const connections = response.result.names[0].givenName;
     // if (!connections || connections.length == 0) {
        //document.getElementById('content').innerText = 'No connections found.';
       // console.log("NO CONNECTION FOUND")
       // return;
      //}
      // Flatten to string to display
     /* const output = connections.reduce(
          (str, person) => {
            if (!person.names || person.names.length === 0) {
              return `${str}Missing display name\n`;
            }
            return `${str}${person.names[0].displayName}\n`;
          },
          'Connections:\n');
    */
    console.log(connections)
    return connections;
}

items.forEach((item) => {
  
    item.addEventListener('click', () => {
        let itemType = item.dataset.type;
        console.log(snacksBought)
        if(itemType == "school"){
            if(schoolBought >= maxSchool){
                alert("You have bought the max number of school items!")
                return
            }
            schoolBought++
        } else if(itemType == "snack"){
            if(snacksBought >= maxSnacks){
                alert("You have bought the max number of snacks!")
                return
            }
           snacksBought++
        } else if(itemType == "raffle"){
            if(rafflesBought >= maxRaffles){
                alert("You have bought the max number of raffle tickets!")
                return
            }
            rafflesBought++
        }
        let itemPrice = itemPrices[item.id]
        if(parseInt(itemPrice) > parseInt(numOfTigerBucks)){
            alert("You only have " + numOfTigerBucks + " tiger bucks and you need " + itemPrice + " tiger bucks") 
            return
        }
        numOfTigerBucks -= itemPrice
        numOfItemsBought++
        order["orderItem" + numOfItemsBought] = item.id
        bucksCountlbl.textContent = `${numOfTigerBucks} Tiger Bucks`
        alert("You bought " + item.id + " for " + itemPrice + " tiger bucks!")

    })
})

reviewOrderBtn.addEventListener('click', () => {
    document.getElementById('store').remove()
    document.getElementById('cart').style.visibility = 'visible';
    loadShopCart()
})


submitOrderBtn.addEventListener('click', async () => {
    alert(`Order Summary: \n Name: ${order.orderName} \n Halftime Facilitator: ${order.orderHalftime} \n Item #1: ${order.orderItem1} \n Item #2: ${order.orderItem2} \n Item #3: ${order.orderItem3}`)
    numOfOrders++;
    await updateValues(storeSheetID, ordersSheetName, "A" + (numOfOrders + 1), [[order.orderName, order.orderHalftime, order.orderItem1, order.orderItem2, order.orderItem3]])
    await updateValues(storeSheetID, ordersSheetName, "H1" , [[numOfOrders]])
    await updateValues(storeSheetID, bankSheetName, gradeColumn + studentRow, [[numOfTigerBucks]])
    location.reload()

})


function loadShopCart(){
    const table = document.getElementById('shop-cart')
    if(order.orderItem1 != ""){
        let newEntry = document.createElement('tr')
        let orderItemName = document.createElement('td')
        orderItemName.textContent = order.orderItem1
        let orderItemCost = document.createElement('td')
        orderItemCost.textContent = itemPrices[order.orderItem1]
        table.appendChild(newEntry)
        newEntry.appendChild(orderItemName)
        newEntry.appendChild(orderItemCost)
    } 
    if(order.orderItem2 != ""){
        let newEntry = document.createElement('tr')
        let orderItemName = document.createElement('td')
        orderItemName.textContent = order.orderItem2
        let orderItemCost = document.createElement('td')
        orderItemCost.textContent = itemPrices[order.orderItem2]
        table.appendChild(newEntry)
        newEntry.appendChild(orderItemName)
        newEntry.appendChild(orderItemCost)
    }
    if(order.orderItem3 != ""){
        let newEntry = document.createElement('tr')
        let orderItemName = document.createElement('td')
        orderItemName.textContent = order.orderItem3
        let orderItemCost = document.createElement('td')
        orderItemCost.textContent = itemPrices[order.orderItem3]
        table.appendChild(newEntry)
        newEntry.appendChild(orderItemName)
        newEntry.appendChild(orderItemCost)
    }
}