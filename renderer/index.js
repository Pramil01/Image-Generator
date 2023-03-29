const form = document.getElementById("img-form");
const text = document.getElementById("text");
const error = document.getElementById("error");
const image = document.getElementById("image");
const imgContainer = document.getElementById("imgContainer");
const downButton = document.getElementById("downloadButton");
const loader = document.getElementById("loader");

function generateImage(e) {
  e.preventDefault();
  topFunction();
  imgContainer.style.display = "none";
  error.style.display = "none";
  document.body.style.overflow = "hidden";
  if (!text.value) {
    alertError("Enter text first");
    return;
  }
  ipcRenderer.send("image:generate", {
    prompt: text.value,
  });
  text.value = "";
  loader.style.display = "block";
}

ipcRenderer.on("image:generated", (imgUrl) => {
  loader.style.display = "none";
  if (imgUrl.startsWith("Image")) {
    error.style.display = "block";
    return;
  }
  document.body.style.overflowY = "scroll";
  image.src = imgUrl;
  downButton.href = imgUrl;
  imgContainer.style.display = "grid";
});

function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: "green",
      color: "white",
      textAlign: "center",
    },
  });
}

function alertError(message) {
  Toastify.toast({
    position: "top-center",
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: "red",
      color: "white",
      textAlign: "center",
    },
  });
}

function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

form.addEventListener("submit", generateImage);
