const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let mainWindow, addWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('closed', () => app.quit())
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);
};

const createNewWindow = () => {
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: "Add new Todo",
    webPreferences: {
      nodeIntegration: true
    }
  })
  addWindow.loadFile(path.join(__dirname, 'add.html'));
  addWindow.on('closed', () => addWindow = null)
}

const menuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: "New Todo",
        accelerator: process.platform === 'darwin' ? 'Command+N' : 'Ctrl+N',
        click() {
          createNewWindow();
        }
      },
      {
        label: 'Clear Todo',
        accelerator: process.platform === 'darwin' ? 'Command + L' : 'Ctrl + L',
        click() {
          mainWindow.webContents.send('todo:clear');
        }
      },
      {
        label: "Quit",
        accelerator: process.platform === 'darwin' ? 'Command + Q' : 'Ctrl+Q',
        click() {
          app.quit();
        }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  menuTemplate.unshift({});
}

if (process.env.NODE_ENV !== 'production') {
  menuTemplate.push({
    label: "View",
    submenu: [
      { role: 'reload' },
      {
        label: 'Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Command+Alt+I' : 'Ctrl+Shift+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      }]
  })
}

ipcMain.on('todo:add', (event, todo) => {
  mainWindow.webContents.send('todo:add', todo);
  addWindow.close();
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
