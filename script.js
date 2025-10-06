document.getElementById("enterBtn").addEventListener("click", () => {
  const logo = document.getElementById("logo");
  const reveal = document.getElementById("reveal");
  document.getElementById("enterBtn").style.opacity = "0";


  // Dynamically set transform origin to match the circle (211x, 211y)
  const rect = logo.getBoundingClientRect();
  const originX = (208 / logo.naturalWidth) * rect.width;
  const originY = (211 / logo.naturalHeight) * rect.height;
  logo.style.transformOrigin = `${originX}px ${originY}px`;
  // Step 1: Zoom into the circle
  logo.style.transform = "scale(10)";// translateX(0%)";

  
// Step 2: After zoom, expand circular reveal
setTimeout(() => {
  // Align reveal center to circle position on screen
  const rectReveal = logo.getBoundingClientRect();
  const circleScreenX = rectReveal.left + (208 / logo.naturalWidth) * rectReveal.width;
  const circleScreenY = rectReveal.top + (211 / logo.naturalHeight) * rectReveal.height;
  reveal.style.left = `${circleScreenX}px`;
  reveal.style.top = `${circleScreenY}px`;
  reveal.style.transform = "translate(-50%, -50%)";

  reveal.style.transition = "width 1.2s ease-out, height 1.2s ease-out";
  reveal.style.width = "300vmax";
  reveal.style.height = "300vmax";
}, 800);

  // Step 3: After reveal, navigate
  setTimeout(() => {
    window.location.href = "main.html";
  }, 1500);
});
