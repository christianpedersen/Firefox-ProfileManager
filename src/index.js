const { app, BrowserWindow, screen } = require('electron');
const path = require('path');
require('../app.js')
require('./preload.js');

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow = null

function main() {
  const displayIndex = 1;
  const display = screen.getAllDisplays()[displayIndex];
  mainWindow = new BrowserWindow({
    x: display.bounds.x + (display.bounds.width - 1024) / 2,
    y: display.bounds.y + (display.bounds.height - 785) / 2,
    width: 1024,
    height: 785,
    autoHideMenuBar: true,
    useContentSize: true,
    resizable: false,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: 'resources/icon/firefox_logo.png'
  })
  mainWindow.loadURL(`http://localhost:3033/`)
  mainWindow.focus();
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
    console.log('Running in development mode');
  } else {
    console.log('Running in production mode');
  }
  mainWindow.on('close', event => {
    mainWindow = null
  })
}

if (process.platform == 'darwin') {
  const nativeImage = require('electron').nativeImage
  const image = nativeImage.createFromPath('resources/icon/firefox_logo.png')
  app.dock.setIcon(image);
}

app.on('ready', main)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // if (BrowserWindow.getAllWindows().length === 0) {
  // createWindow();
  // }
});