export const copyToClipboard = (text) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for non-secure contexts (HTTP)
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((resolve, reject) => {
      try {
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (successful) resolve();
        else reject(new Error("Copy failed"));
      } catch (err) {
        document.body.removeChild(textArea);
        reject(err);
      }
    });
  }
};
