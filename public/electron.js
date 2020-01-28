const electron = require('electron');
const { app, BrowserWindow, Menu } = electron;

const path = require('path');
const os = require('os')
const isDev = require('electron-is-dev');
const api = require('./api/index.js');


let mainWindow;
let db_users;
let userData = app.getPath('userData');
let menu;

function createWindow() {


    mainWindow = new BrowserWindow({ width: 1024, height: 768, backgroundColor: '#F7F7F7', webPreferences: { nodeIntegration: true } });
    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
    if (isDev) {
       //  Open the DevTools.
       if (process.platform === 'darwin') {
         BrowserWindow.addDevToolsExtension(
             path.join(os.homedir(), '/Library/Application Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.17.0_0')
         );
       }
        mainWindow.webContents.openDevTools();
    } else {
        // suppression du menu sur Windows et Linux en prod
        if (process.platform !== 'darwin') {
            Menu.setApplicationMenu(null);
            mainWindow.setFullScreen(true);
        }
    }
    mainWindow.on('closed', () => mainWindow = null);

}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

