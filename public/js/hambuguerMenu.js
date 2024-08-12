document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    const hamburger = document.querySelector(".hamburger");
    const mainNav = document.querySelector("#main-nav");

    if (hamburger && mainNav) {
      hamburger.addEventListener("click", function () {
        mainNav.classList.toggle("active");
      });
    } else {
      console.error('Elementos do menu não encontrados.');
    }
  }, 100);
});
