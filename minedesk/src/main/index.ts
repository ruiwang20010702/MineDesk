import { app, shell, BrowserWindow, globalShortcut, Tray, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { setupIpcHandlers } from './ipc'
import { databaseService } from './services/DatabaseService'
import log from 'electron-log'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: 'hiddenInset',
    // Enable macOS vibrancy for beautiful blur effect
    ...(process.platform === 'darwin'
      ? {
          vibrancy: 'under-window',
          visualEffectState: 'active',
          transparent: true,
          frame: false
        }
      : {
          transparent: false,
          frame: true
        })
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Hide window instead of closing
  let isQuitting = false
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  app.on('before-quit', () => {
    isQuitting = true
  })
}

function createTray(): void {
  tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show MineDesk',
      click: () => {
        mainWindow?.show()
      }
    },
    {
      label: 'Hide MineDesk',
      click: () => {
        mainWindow?.hide()
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      }
    }
  ])
  tray.setToolTip('MineDesk')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow?.show()
    }
  })
}

function registerGlobalShortcuts(): void {
  // Register global shortcut: Cmd+Space / Ctrl+Space
  const shortcut = process.platform === 'darwin' ? 'Command+Space' : 'Control+Space'
  
  globalShortcut.register(shortcut, () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow?.show()
      mainWindow?.focus()
    }
  })

  console.log(`✅ Global shortcut registered: ${shortcut}`)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.minedesk.app')

  // Initialize database
  try {
    databaseService.initialize()
    log.info('✅ Database initialized')
  } catch (error) {
    log.error('❌ Failed to initialize database:', error)
  }

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  createTray()
  registerGlobalShortcuts()
  setupIpcHandlers()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Unregister all shortcuts when app is about to quit
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  
  // Close database connection
  try {
    databaseService.close()
    log.info('✅ Database connection closed')
  } catch (error) {
    log.error('❌ Failed to close database:', error)
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

