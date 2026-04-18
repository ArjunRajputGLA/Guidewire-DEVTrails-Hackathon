const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, '../public/favicon.ico')
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    // In production, just load your hosted Vercel website directly!
    // This makes the app lightweight, fast to build, and completely avoids Next.js standalone build issues.
    mainWindow.loadURL('https://gig-shield-gules.vercel.app/');
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

