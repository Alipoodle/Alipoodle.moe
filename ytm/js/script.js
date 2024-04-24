document.addEventListener("DOMContentLoaded", function () {
  // Scroll Spy
  (function () {
    const offsetCheck = window.innerHeight / 3;
    var sectionsIds = document.querySelectorAll("header nav a");
    window.addEventListener("scroll", function () {
      sectionsIds.forEach(function (currentValue, currentIndex, listObj) {
        const container = currentValue.getAttribute("href");
        if (container.indexOf("#") !== 0) {
          return;
        }

        const containerOffset = document.querySelector(container).offsetTop;
        const nextContainer = listObj[currentIndex + 1]
          ? listObj[currentIndex + 1].getAttribute("href")
          : null;
        if (nextContainer && nextContainer.indexOf("#") !== 0) {
          return;
        }

        let containerHeight;
        if (nextContainer) {
          containerHeight = document.querySelector(nextContainer).offsetTop;
        } else {
          containerHeight = document.querySelector(container).offsetHeight;
        }

        const containerBottom = containerOffset + containerHeight;

        const scrollPosition = window.pageYOffset;
        if (
          scrollPosition < containerBottom - offsetCheck &&
          scrollPosition >= containerOffset - offsetCheck
        ) {
          for (var j = currentIndex; j >= 0; j--) {
            listObj[j].classList.remove("fill");
          }
          currentValue.classList.add("fill");
        } else {
          currentValue.classList.remove("fill");
        }
      });
    });
  })();

  // Detect platform
  (async function () {
    // check if browser supports it
    if (
      !navigator.userAgentData &&
      !navigator.userAgentData.getHighEntropyValues
    ) {
      // fallback to useragent
    } else {
      const platformInfo = await navigator.userAgentData.getHighEntropyValues([
        "architecture",
        "bitness",
      ]);

      if (platformInfo.platform === "Windows") {
      } else if (platformInfo.platform === "macOS") {
      } else if (platformInfo.platform === "Linux") {
      }
    }
  })();

  (function() {
    const slidesContainer = document.getElementById("slides-container");
    const slide = document.querySelector(".slide");
    const prevButton = document.getElementById("slide-arrow-prev");
    const nextButton = document.getElementById("slide-arrow-next");

    nextButton.addEventListener("click", (event) => {
      const slideWidth = slide.clientWidth;
      slidesContainer.scrollLeft += slideWidth;
    });

    prevButton.addEventListener("click", () => {
      const slideWidth = slide.clientWidth;
      slidesContainer.scrollLeft -= slideWidth;
    });
  })();
});
