document.getElementById("enterBtn").addEventListener("click", () => {
  const logo = document.getElementById("logo");
  const reveal = document.getElementById("reveal");
  document.getElementById("enterBtn").style.opacity = "0";


  // Step 1: Zoom into the circle
  logo.style.transform = "scale(17) translateX(-10%)";
  
  // Step 2: After zoom, expand circular reveal
  setTimeout(() => {
    reveal.style.transition = "width 1.2s ease-out, height 1.2s ease-out";
    reveal.style.width = "300vmax";
    reveal.style.height = "300vmax";
  }, 800);

  // Step 3: After reveal, navigate
  setTimeout(() => {
    window.location.href = "main.html";
  }, 1500);
});
