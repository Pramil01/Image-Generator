const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const dotenv = require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const isMac = process.platform === "darwin";

let mainWindow;
const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Create Main window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Image Generator",
    width: 500,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
}

// Create About Window
function CreateAboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: "About The Application",
    width: 300,
    height: 300,
  });
  aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}

//App is ready
app.whenReady().then(() => {
  createMainWindow();

  //Implement menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  //Remove mainWindow from memory on close
  mainWindow.on("closed", () => (mainWindow = null));

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

//Generate Image
async function generateImg(prompt) {
  try {
    const response = await openai.createImage({
      prompt,
      n: 1,
      size: "512x512",
    });

    const imgUrl = response.data.data[0].url;

    return imgUrl;
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
    return "Image Could not be generated";
  }
}

//Menu template
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: CreateAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    label: "File",
    submenu: [
      {
        label: "Quit",
        click: () => app.quit(),
        accelerator: "CmdOrCtrl+w",
      },
    ],
  },
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [
            {
              label: "About",
              click: CreateAboutWindow,
            },
          ],
        },
      ]
    : []),
];

//Respond to image:generate
ipcMain.on("image:generate", (event, options) => {
  generateImg(options.prompt)
    .then((res) => {
      //Send url to renderer
      mainWindow.webContents.send("image:generated", res);
    })
    .catch((err) => console.log(err));
});

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});
