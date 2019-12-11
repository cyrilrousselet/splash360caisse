const electron = require('electron');
const { app, BrowserWindow } = electron;

const path = require('path');
const os = require('os')
const isDev = require('electron-is-dev');
const api = require('./api/index.js');


let mainWindow;
let db_users;
let userData = app.getPath('userData');

function createWindow() {
    mainWindow = new BrowserWindow({ width: 1024, height: 768, backgroundColor: '#F7F7F7', webPreferences: { nodeIntegration: true } });
    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
//    if (isDev) {
       //  Open the DevTools.
         BrowserWindow.addDevToolsExtension(
             path.join(os.homedir(), '/Library/Application Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.17.0_0')
         );
        mainWindow.webContents.openDevTools();
//    }
    mainWindow.on('closed', () => mainWindow = null);

    // mainWindow.once('ready-to-show', () => {
    //     electron.protocol.interceptFileProtocol('file', (request, callback) => {
    //         const filePath = request.url.replace('file://', '');
    //         const url = request.url.includes('static/media/') ? path.normalize(`${__dirname}/${filePath}`) : filePath;
    
    //         callback({ path: url });
    //     }, err => {
    //         if (err) console.error('Failed to register protocol');
    //     });
    // });

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

