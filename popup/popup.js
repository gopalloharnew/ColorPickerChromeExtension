const btn = document.querySelector(".color-picker-button");
const colorGrid = btn;
const colorValueHex = document.querySelector(".result-span");
const colorValueHsl = document.querySelector(
  ".color-result-hsl span.result-span"
);
const colorValueRgb = document.querySelector(
  ".color-result-rgb span.result-span"
);

function hexToRGB(h) {
  let r = 0,
    g = 0,
    b = 0;

  if (h.length == 4) {
    r = "0x" + h[1] + h[1];
    g = "0x" + h[2] + h[2];
    b = "0x" + h[3] + h[3];
  } else if (h.length == 7) {
    r = "0x" + h[1] + h[2];
    g = "0x" + h[3] + h[4];
    b = "0x" + h[5] + h[6];
  }

  return "rgb(" + +r + "," + +g + "," + +b + ")";
}

function hexToHSL(H) {
  // Convert hex to RGB first
  let r = 0,
    g = 0,
    b = 0;
  if (H.length == 4) {
    r = "0x" + H[1] + H[1];
    g = "0x" + H[2] + H[2];
    b = "0x" + H[3] + H[3];
  } else if (H.length == 7) {
    r = "0x" + H[1] + H[2];
    g = "0x" + H[3] + H[4];
    b = "0x" + H[5] + H[6];
  }
  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  let cMin = Math.min(r, g, b),
    cMax = Math.max(r, g, b),
    delta = cMax - cMin,
    h = 0,
    s = 0,
    l = 0;

  if (delta == 0) h = 0;
  else if (cMax == r) h = ((g - b) / delta) % 6;
  else if (cMax == g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0) h += 360;

  l = (cMax + cMin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return "hsl(" + h + "," + s + "%," + l + "%)";
}

btn.addEventListener("click", async () => {
  chrome.storage.sync.get("color", ({ color }) => {
    console.log("color: ", color);
  });
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      function: pickColor,
    },
    async (injectionResults) => {
      const [data] = injectionResults;
      if (data.result) {
        const color = data.result.sRGBHex;
        console.log(data);
        console.log(data.result);
        colorGrid.style.backgroundColor = color;
        colorValueHex.innerText = color;
        colorValueHsl.innerText = hexToHSL(color);
        colorValueRgb.innerText = hexToRGB(color);
        try {
          await navigator.clipboard.writeText(color);
          document.querySelectorAll(".color-result").forEach((resultDiv) => {
            resultDiv.querySelector(".copy-icon").classList.remove("ok");
          });
          document
            .querySelector(".color-result-hex .copy-icon")
            .classList.add("ok");
        } catch (err) {
          console.error(err);
        }
      }
    }
  );
});

async function pickColor() {
  try {
    // Picker
    const eyeDropper = new EyeDropper();
    return await eyeDropper.open();
  } catch (err) {
    console.error(err);
  }
}

document.querySelectorAll(".color-result").forEach((resultDiv) => {
  resultDiv.addEventListener("click", function () {
    try {
      navigator.clipboard.writeText(
        resultDiv.querySelector(".result-span").innerText
      );
      document.querySelectorAll(".color-result").forEach((resultDiv) => {
        resultDiv.querySelector(".copy-icon").classList.remove("ok");
      });
      resultDiv.querySelector(".copy-icon").classList.add("ok");
    } catch (err) {
      console.error(err);
    }
  });
});
