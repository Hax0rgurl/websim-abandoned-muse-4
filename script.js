import { UI, initParticles } from "./config.js";

/* Section Loader */
async function loadSections() {
  const sections = ['home', 'books', 'video', 'gallery', 'music', 'blog', 'about', 'contact', 'footer'];
  const container = document.getElementById('content-container');
  
  for (const section of sections) {
    try {
      const response = await fetch(`sections/${section}.html`);
      const html = await response.text();
      
      if (section === 'home') {
        container.insertAdjacentHTML('afterbegin', html);
      } else if (section === 'footer') {
        container.insertAdjacentHTML('beforeend', html);
      } else {
        const main = container.querySelector('.main') || (() => {
          const mainEl = document.createElement('main');
          mainEl.className = 'main';
          container.appendChild(mainEl);
          return mainEl;
        })();
        main.insertAdjacentHTML('beforeend', html);
      }
    } catch (error) {
      console.error(`Error loading ${section}:`, error);
    }
  }
  
  // Reinitialize Flickr embeds
  const script = document.createElement('script');
  script.src = '//embedr.flickr.com/assets/client-code.js';
  script.async = true;
  document.body.appendChild(script);
}

/* Navigation */
class NavigationPage {
  constructor() {
    this.currentId = null;
    this.currentTab = null;
    this.tabContainerHeight = UI.tabContainerHeight;
    this.lastScroll = 0;
    this.navTabs = document.querySelectorAll(".nav-tab");
    this.navContainer = document.querySelector(".nav-container");
    this.nav = document.querySelector(".nav");
    this.navTabSlider = document.querySelector(".nav-tab-slider");
    this.init();
  }
  init() {
    this.navTabs.forEach((tab) => tab.addEventListener("click", (e) => this.onTabClick(e, tab)));
    window.addEventListener("scroll", () => this.onScroll());
    window.addEventListener("resize", () => this.onResize());
  }
  onTabClick(event, element) {
    event.preventDefault();
    const targetId = element.getAttribute("href");
    const targetElement = document.querySelector(targetId);
    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - UI.headerHeight;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  }
  onScroll() {
    this.checkHeaderPosition();
    this.findCurrentTabSelector();
    this.lastScroll = window.pageYOffset;
  }
  onResize() {
    if (this.currentId) this.setSliderCss();
  }
  checkHeaderPosition() {
    const headerHeight = UI.headerHeight;
    if (window.pageYOffset > headerHeight) this.navContainer.classList.add("nav-container--scrolled");
    else this.navContainer.classList.remove("nav-container--scrolled");
    const offset = this.nav?.offsetTop + this.nav?.offsetHeight - this.tabContainerHeight - headerHeight;
    if (window.pageYOffset > this.lastScroll && window.pageYOffset > offset) {
      this.navContainer.classList.add("nav-container--move-up");
      this.navContainer.classList.remove("nav-container--top-first");
      this.navContainer.classList.add("nav-container--top-second");
    } else if (window.pageYOffset < this.lastScroll && window.pageYOffset > offset) {
      this.navContainer.classList.remove("nav-container--move-up");
      this.navContainer.classList.remove("nav-container--top-second");
      this.navContainer.classList.add("nav-container--top-first");
    } else {
      this.navContainer.classList.remove("nav-container--move-up", "nav-container--top-first", "nav-container--top-second");
    }
  }
  findCurrentTabSelector() {
    let newCurrentId = null, newCurrentTab = null;
    this.navTabs.forEach((tab) => {
      const id = tab.getAttribute("href");
      const section = document.querySelector(id);
      if (!section) return;
      const offsetTop = section.offsetTop - this.tabContainerHeight;
      const offsetBottom = section.offsetTop + section.offsetHeight - this.tabContainerHeight;
      if (window.pageYOffset > offsetTop && window.pageYOffset < offsetBottom) {
        newCurrentId = id; newCurrentTab = tab;
      }
    });
    if (this.currentId !== newCurrentId || this.currentId === null) {
      this.currentId = newCurrentId; this.currentTab = newCurrentTab; this.setSliderCss();
    }
  }
  setSliderCss() {
    if (!this.currentTab) return;
    const { offsetWidth: width, offsetLeft: left } = this.currentTab;
    this.navTabSlider.style.width = `${width}px`;
    this.navTabSlider.style.left = `${left}px`;
  }
}

/* Lazy loading for blog images */
function setupLazyImages() {
  const images = document.querySelectorAll("img[data-src]");
  if (!("IntersectionObserver" in window)) {
    images.forEach((img) => { img.src = img.dataset.src; img.removeAttribute("data-src"); });
    return;
  }
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
        observer.unobserve(img);
      }
    });
  }, { threshold: 0, rootMargin: "0px 0px 50px 0px" });
  images.forEach((img) => imageObserver.observe(img));
}

/* CCTV timestamps */
function setupTimestamps() {
  const updateTimestamps = () => {
    const now = new Date();
    document.querySelectorAll(".cctv-timestamp").forEach((el) => {
      el.textContent = now.toLocaleString("en-US", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
      });
    });
  };
  updateTimestamps();
  setInterval(updateTimestamps, 1000);
}

/* Boot */
document.addEventListener("DOMContentLoaded", async () => {
  await loadSections();
  initParticles();
  new NavigationPage();
  setupLazyImages();
  setupTimestamps();
});