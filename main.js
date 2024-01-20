// main.js


// Modules to control application life and create native browser window
const { app, BrowserWindow, dialog } = require('electron')
let { ipcMain } = require("electron")
const Store = require('electron-store');
const packageInfo = require("./package.json")
const axios = require('axios')


// Normal variable setup
const flightawareHost = 'https://aeroapi.flightaware.com/aeroapi'

const store = new Store();

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: "vmsScheduler",
    width: 800,
    height: 600,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        nodeIntegrationInSubFrames: true, //for subContent nodeIntegration Enable
        webviewTag: true //for webView
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('pages/index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

const createFirstLaunchWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: "vmsScheduler",
    width: 460,
    height: 350,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        nodeIntegrationInSubFrames: true, //for subContent nodeIntegration Enable
        webviewTag: true //for webView
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('pages/firstLaunch.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  //Place this code in your electron app's initialisation
if (store.get("isFirstLaunch") == false)  {
  //Show main window
  createWindow()
} else {
  //Show startup window and wait until the "OK" button is clicked
  createFirstLaunchWindow()
}

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      if (store.get("isFirstLaunch") == false)  {
        //Show main window
        createWindow()
      } else {
        //Show startup window and wait until the "OK" button is clicked
        createFirstLaunchWindow()
      }
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Alert dialog
/**
 *
 *
 * @param {string} type none, info, error, question or warning
 * @param {Array} buttons The name of each button
 * @param {string} title the title of the alert
 * @param {string} message the message of the alert
 */
function alert(type, buttons, title, message) {
  const options = {
    type: type,
    buttons: buttons,
    title: title,
    message: title,
    detail: message,
  };

  dialog.showMessageBox(null, options, (response, checkboxChecked) => {
    console.log(response);
    console.log(checkboxChecked);
  });
}

// IPC Renderers
ipcMain.on("initStore", async (event, icao, api) => {
  // Log that data received
  console.log(`[Data Settings] Received data to store: ${icao} | ${api}`)

  // Store the data
  store.set("vaICAO", icao)
  store.set("vaFlightawareAPI", api)

  // set variables for the try statement
  let response;
  let err;

  // Try to make a request with the api key.
  try{
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: flightawareHost + '/airports',
      headers: { 
        'x-apikey': store.get('vaFlightawareAPI'), 
        'Content-Type': 'application/json'
      }
    };
    response = await axios.request(config)
  } catch (e) {
    response = false;
    err = e;
  }
  if(response == false){
    alert('error', ["Continue"], "Error", `The flightaware api key is invalid. The app must restart to fix the error.\n${err}`)
    app.relaunch()
    app.exit()
    return
  };

  // Set initial settings to finished so next launch init page don't show
  store.set("isFirstLaunch", false)
  alert('info', ["Continue"], "Initial Settings Complete!", "Application will now restart!")
  app.relaunch()
  app.exit()
  return false
})