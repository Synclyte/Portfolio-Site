const contactLink = document.getElementById("contact-link");
const dropdownMenu = document.getElementById("contact-dropdown");

const gridWrapper = document.querySelector(".language-container");
const leftScroll = document.getElementById("left-scroll");
const rightScroll = document.getElementById("right-scroll");
const headerBox = document.getElementById("header-box");
const projectCards = document.querySelectorAll(".project-article");
const jsEnable = document.querySelectorAll(".js-enabled");

const players = new Map();

const fps = 60;
const mspf = 1000 / fps;

jsEnable.forEach((e) => {
    e.style.display = "grid";
})

let player = null;
// youtube handling
let ytApiReady = false;
window.onYouTubeIframeAPIReady = (() => { ytApiReady = true; });

var tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
var scriptTag = document.getElementsByTagName("script")[0];
scriptTag.parentNode.insertBefore(tag, scriptTag);

dropdownActive = false;

function getScrollAmount() {
    return 100 + window.innerWidth / 5
}

function scrollToProject(index) {
    const affectedCard = projectCards[index];
    const cardInfo = affectedCard.querySelector(".info");
    setInterval(() => {
        affectedCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
    
    cardInfo.classList.add("highlight-background");
    setInterval(() => {
        cardInfo.classList.remove("highlight-background");
    }, 1500);
}

function clickProject(index) {
    projectCards[index].click();
}

function activateDropdown() {
    const linkRect = contactLink.getBoundingClientRect();

    dropdownMenu.classList.remove("dropdown-recall");
    dropdownMenu.style.top = `${linkRect.bottom + 12}px`;
    dropdownMenu.style.left = `${linkRect.left + linkRect.width / 2}px`;
    dropdownMenu.classList.add("dropdown-animation");
}

function removeDropdown() {
    dropdownMenu.classList.remove("dropdown-animation");
    dropdownMenu.classList.add("dropdown-recall");
}

function isColliding(bounds, position) {
    return (
        position[0] >= bounds.left && position[0] <= bounds.right &&
        position[1] >= bounds.top && position[1] <= bounds.bottom
    );
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

document.addEventListener("scroll", function () {
    const parallaxElements = document.querySelectorAll(".project-parallax");

    parallaxElements.forEach(parallax => {
        const rect = parallax.getBoundingClientRect();
        const speed = 0.3;
        const offset = (rect.top - window.innerHeight / 2) * speed - rect.height * 0.8;

        parallax.style.setProperty("--parallax-offset", `${offset}px`);
    });
});


window.addEventListener("DOMContentLoaded", function () {
    const rotationCap = 2.5;

    projectCards.forEach(card => {
        let rect = card.getBoundingClientRect();
        let active = false;
        let then = performance.now();

        window.addEventListener("scroll", () => { rect = card.getBoundingClientRect(); });
        window.addEventListener("resize", () => { rect = card.getBoundingClientRect(); });

        function loadVideo() {
            const vId = card.getAttribute("data-video");
            const vContainer = card.querySelector(".project-video");

            if (vId && vContainer && !vContainer.dataset.loaded) {
                const playerDivId = `player-${vId}`;
                vContainer.innerHTML = `<div id="${playerDivId}"></div>`;
                
                if (ytApiReady) {
                    new YT.Player(playerDivId, {
                        height: '100%',
                        width: '100%',
                        videoId: vId,
                        playerVars: { 'autoplay': 1, 'rel': 0 }
                    });
                    vContainer.dataset.loaded = "true";

                    return true;
                }
            }
            return false;
        }

        card.addEventListener("mousemove", (e) => {
            if (active) return;

            if (performance.now() - then > mspf) {
                then = performance.now();
                applyLanguageTilt(e, card, rect, 1, rotationCap);
            };
        })

        card.addEventListener("mouseleave", () => {
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
        })

        card.addEventListener("click", (e) => {
            if (e.target.closest('a')) {
                return;
            }

            active = !active;
            if (active) {
                if (loadVideo()) {
                    console.log("loaded video id: " + card.getAttribute("data-video"));
                } else {
                    console.log("failed to load video")
                }
            }
            else {
                const vContainer = card.querySelector(".project-video");
                if (vContainer != null) {
                    vContainer.innerHTML = "";
                    delete vContainer.dataset.loaded;
                }
            }

            card.style.setProperty("--rx", "0deg");
            card.style.setProperty("--ry", "0deg");
            card.classList.toggle("active-state");

            setTimeout(() => {
                card.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

            setTimeout(() => {
                rect = card.getBoundingClientRect();
            }, 500);
        })
    })

    function applyLanguageTilt(e, card, rect, scalar, rotationCap) {
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const degX = (y - 0.5) * -rotationCap * 2 / scalar; 
        const degY = (x - 0.5) * rotationCap * 2 / scalar;
        const degMag = Math.sqrt(degX ** 2 + degY ** 2);
        const degMult = degMag > rotationCap ? rotationCap / degMag : 1;

        card.style.setProperty('--rx', `${degX * degMult}deg`);
        card.style.setProperty('--ry', `${degY * degMult}deg`);
    }

    const languageGrid = document.querySelector(".language-grid");
    const languageCards = document.querySelectorAll(".language-article");
    const scalar = 8;
    const cap = 30;
    let then = performance.now();

    class CardPair {
        constructor(card) {
            this.card = card;
            this.dims = card.getBoundingClientRect();
            this.active = false;

            window.addEventListener("scroll", () => { this.recalculateDims(); });
            window.addEventListener("resize", () => { this.recalculateDims(); });
        }

        recalculateDims() { this.dims = this.card.getBoundingClientRect(); }
    }

    const cardPairs = languageCards.values().map(card => new CardPair(card)).toArray();

    languageGrid.addEventListener("mousemove", (e) => {
        let now = performance.now();
        if (now - then > mspf) {
            cardPairs.forEach(cardPair => {
                if (!cardPair.active) applyLanguageTilt(e, cardPair.card, cardPair.dims, scalar, cap);
            });
            then = now;
        }      
    });

    languageGrid.addEventListener("mouseleave", () => {
        languageCards.forEach(card => {
            card.style.setProperty("--rx", "0deg");
            card.style.setProperty("--ry", "0deg");
        });
    });

    cardPairs.forEach(cardPair => {
        let card = cardPair.card;
        card.addEventListener("click", (e) => {
            if (e.target.closest('a')) {
                return;
            }

            card.style.setProperty("--rx", "0deg");
            card.style.setProperty("--ry", "0deg");
            card.classList.toggle("active-state");
            cardPair.active = !cardPair.active;
            cardPairs.forEach(pair => {
                pair.recalculateDims();
            })
        });
    });
});