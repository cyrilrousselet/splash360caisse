const electron = require('electron');
const { app, BrowserWindow, Menu } = electron;
const log = require('electron-log');

const path = require('path');
const os = require('os')
const isDev = require('electron-is-dev');
const api = require('./api/index.js');
const server = require('./api/server.js');
const sse = require('./api/sseApi.js');
// const kds = require('./api/kitchenDisplayServer.js');
//const Sentry = require('@sentry/electron');
// const packageJson = require('../package.json');
    
    // Sentry.init({
    //   release: "splash360caisse@" + packageJson.version,
    //   dsn: 'https://44cf9ec6a90c43e4a7027cc997b83919@o511169.ingest.sentry.io/5607891',
    // });

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
        try {
          BrowserWindow.addDevToolsExtension(
              path.join(os.homedir(), '/Library/Application Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.17.1_0')
          );
        } catch(e) {
          log.info('pbm devtool darwin', e.message);
        }
      } else if (process.platform === 'win32') {
        try {
          BrowserWindow.addDevToolsExtension(
          path.join(os.homedir(), '\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\lmhkpmbekcpmknklioeibfkpmmfibljd\\2.17.1_0')
          );
        } catch(e) {
          log.info('pbm devtool win', e.message);
        }
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

    server.init(mainWindow.webContents);
    sse.init(mainWindow.webContents);
    // kds.init(mainWindow.webContents);

}


const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
    app.quit()
} else {

    // app.on('before-quit', () => {
    //     localStorage.removeItem('user');
    // })

    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // Someone tried to run a second instance, we should focus our window.
      if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore()
          mainWindow.focus()
      }
    });

    app.on('ready', createWindow);

    app.on('window-all-closed', () => {
      //  localStorage.removeItem('user');
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', () => {
        if (mainWindow === null) {
            createWindow();
        }
    });

} 