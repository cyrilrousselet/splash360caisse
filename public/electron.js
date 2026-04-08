const electron = require('electron');
const { app, BrowserWindow, Menu } = electron;
// const log = require('electron-log');
const log = require('./utils/logger');

const path = require('path');
const os = require('os')
const isDev = require('electron-is-dev');
require('./api/index.js');
const server = require('./api/server.js');
const sse = require('./api/sseApi.js');
const peripheral = require('./api/peripheralApi.js');
// const kds = require('./api/kitchenDisplayServer.js');
// const packageJson = require('../package.json');
    


let mainWindow;
// let db_users;
// let userData = app.getPath('userData');
// let menu;


function createWindow() {

  log.info('createWindow()');


    mainWindow = new BrowserWindow({ width: 1024, height: 768, backgroundColor: '#F7F7F7', webPreferences: { nodeIntegration: true } });
    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
    if (isDev) {
       //  Open the DevTools.
      if (process.platform === 'darwin') {
        try {
          BrowserWindow.addDevToolsExtension(
              path.join(os.homedir(), '/Library/Application Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/3.0.19_0')
          );
        } catch(e) {
          log.warn('pbm devtool darwin');
          log.error(e);
        }
      } else if (process.platform === 'win32') {
        try {
          BrowserWindow.addDevToolsExtension(
          path.join(os.homedir(), '\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\lmhkpmbekcpmknklioeibfkpmmfibljd\\3.0.19_0')
          );
        } catch(e) {
          log.warn('pbm devtool win');
          log.error(e);
        }
      }
        mainWindow.webContents.openDevTools();
        // mainWindow.webContents.on("devtools-opened", () => { mainWindow.webContents.closeDevTools(); });
    } else {
        // suppression du menu sur Windows et Linux en prod
        if (process.platform !== 'darwin') {
            Menu.setApplicationMenu(null);
            mainWindow.setFullScreen(true);
        }

        // mainWindow.webContents.on("devtools-opened", () => { mainWindow.webContents.closeDevTools(); }); // Pour empecher l'ouverture du devtools ?

    }
    mainWindow.on('closed', () => mainWindow = null);

    server.init(mainWindow.webContents);
    sse.init(mainWindow.webContents);
    peripheral.init(mainWindow.webContents);
    // kds.init(mainWindow.webContents);

}


const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
    app.quit()
} else {

    app.on('before-quit', () => {
      mainWindow.webContents.executeJavaScript('localStorage.removeItem("user");', true);
    })

    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // Someone tried to run a second instance, we should focus our window.
      if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore()
          mainWindow.focus()
      }
    });

    app.on('ready', createWindow);

    app.on('window-all-closed', () => {
      // localStorage.removeItem('user');

      mainWindow.webContents.executeJavaScript('localStorage.removeItem("user");', true);

      if (process.platform !== 'darwin') {
          mainWindow.webContents.send('jet',{code:'40', description:'extinction'})
          app.quit();
      }
    });

    app.on('activate', () => {
        if (mainWindow === null) {
            createWindow();
        }
    });

} 