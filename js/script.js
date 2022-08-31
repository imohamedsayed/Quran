const landingImgs = [
  "h0.png",
  "h1.jpg",
  "h2.jpg",
  "h3.jpg",
  "h4.jpg",
  "h5.jpg",
];
let next = document.querySelector(".next");
let prev = document.querySelector(".prev");
let imgIndex = 0;
next.onclick = () => {
  imgIndex = (imgIndex + 1) % landingImgs.length;
  let img = landingImgs[imgIndex];

  document.querySelector(
    ".landing"
  ).style.backgroundImage = `url('../imgs/landing/${img}')`;
  activeBullet();
};

prev.onclick = () => {
  if (imgIndex == 0) {
    imgIndex = landingImgs.length - 1;
  } else {
    imgIndex--;
  }
  let img = landingImgs[imgIndex];

  document.querySelector(
    ".landing"
  ).style.backgroundImage = `url('../imgs/landing/${img}')`;
  activeBullet();
};

let backBullets = document.querySelector(".backBullets");
for (let i = 0; i < landingImgs.length; i++) {
  let bullet = document.createElement("span");
  backBullets.appendChild(bullet);
}

function activeBullet() {
  let myBullets = document.querySelectorAll(".backBullets span");
  myBullets.forEach((bol, index) => {
    bol.classList.remove("active");
    if (index == imgIndex) {
      bol.classList.add("active");
    }
  });
}
activeBullet();

// End landing page slider header

// start aside navigations

let landingSection = document.querySelector(".landing"),
  favsSection = document.querySelector(".favs"),
  readersSection = document.querySelector(".readers"),
  hadeethSection = document.querySelector(".ahadeeth"),
  listingSection = document.querySelector(".listen"),
  quranSection = document.querySelector(".quran"),
  listenNow = document.querySelector(".btn");

listenNow.onclick = () => {
  closeAllSections();
  listingSection.style.display = "block";
};

let sections = [
  landingSection,
  favsSection,
  readersSection,
  hadeethSection,
  listingSection,
  quranSection,
];

let listNavs = document.querySelectorAll(".navList li a");

listNavs.forEach((a) => {
  a.onclick = () => {
    closeAllSections();
    //console.log(`.${a.dataset.section}`);
    document.querySelector(`.${a.dataset.section}`).style.display = "block";
  };
});

function closeAllSections() {
  for (let i = 0; i < sections.length; i++) {
    sections[i].style.display = "none";
  }
}

// Quran palyer
let quraanAudio = document.querySelector(".listen .quraanAudio"),
  surahs = document.querySelector(".listen .surahs"),
  ayah = document.querySelector(".listen .text"),
  nextAya = document.querySelector(".listen .next-ayah"),
  prevAya = document.querySelector(".listen .prev-ayah");
play = document.querySelector(".listen .play-ayah");
let favsSurahs = document.querySelector(".favs .surahs");
var favorites;
if (localStorage.favs != null) {
  favorites = JSON.parse(localStorage.favs);
} else {
  favorites = [];
}

let surahsData;

function getQuran() {
  fetch("https://quran-endpoint.vercel.app/quran")
    .then((Response) => Response.json())
    .then((data) => {
      surahsData = data;
      for (let surah in data.data) {
        surahs.innerHTML += `
        <div class='surah' dir='rtl' data-index=${parseInt(surah) + 1}>
          <p>${data.data[surah].asma.ar.long}</p>
          <p>${data.data[surah].asma.en.long}</p>
          <div class='fav' data-id=${parseInt(
            surah
          )}><i class="fa-solid fa-heart"></i></div>
        </div>
        `;
        getFavSurahs(surah);
      }
      let allSurahs = document.querySelectorAll(".listen .surahs .surah");
      allSurahs.forEach((s, index) => {
        s.addEventListener("click", () => {
          playQuran(index);
        });
      });

      let fs = document.querySelectorAll(".favs .surahs .surah");
      fs.forEach((s) => {
        s.addEventListener("click", () => {
          playQuran(parseInt(s.dataset.index) - 1);
        });
      });
      // handle fav and remove fav
      var hearts = document.querySelectorAll(".surah .fav");
      hearts.forEach((heart) => {
        heart.addEventListener("click", () => {
          heart.style.color = "red";

          if (!favorites.includes(heart.dataset.id)) {
            favorites.push(heart.dataset.id);
            localStorage.favs = JSON.stringify(favorites);
            getFavSurahs(heart.dataset.id);
          }
        });

        checkHeart();
      });

      function checkHeart() {
        hearts.forEach((heart, index) => {
          if (favorites.includes(String(index))) {
            heart.style.color = "red";
          } else {
            heart.style.color = "black";
          }
        });
      }
    });
}
getQuran();

// get favorites surahs

function getFavSurahs(sIndex) {
  if (favorites.includes(sIndex)) {
    favsSurahs.innerHTML += `
          <div class='surah' dir='rtl' data-index=${parseInt(sIndex) + 1}>
            <p>${surahsData.data[sIndex].asma.ar.long}</p>
            <p>${surahsData.data[sIndex].asma.en.long}</p>

            <div class='remove-fav' onclick='removeFav(this)' data-id=${parseInt(
              sIndex
            )}><i class="fa-solid fa-xmark"></i></div>
          </div>
        `;
  } else {
    return;
  }
}

function removeFav(item) {
  item.parentElement.remove();
  favorites.splice(favorites.indexOf(item.dataset.id), 1);
  localStorage.favs = JSON.stringify(favorites);
  var hearts = document.querySelectorAll(".surah .fav");
  hearts.forEach((heart, index) => {
    if (favorites.includes(String(index))) {
      heart.style.color = "red";
    } else {
      heart.style.color = "black";
    }
  });
}

function playQuran(surahIndex) {
  let ayaAudios;
  let ayahsText;
  fetch(`https://quran-endpoint.vercel.app/quran/${surahIndex + 1}`)
    .then((response) => response.json())
    .then((data) => {
      let verses = data.data.ayahs;

      ayaAudios = [];
      ayahsText = [];
      verses.forEach((verse) => {
        ayaAudios.push(verse.audio.url);
        ayahsText.push(verse.text.ar);
      });
      let audioIndex = 0;
      changeAyah(audioIndex);
      quraanAudio.addEventListener("ended", () => {
        audioIndex++;
        if (audioIndex < ayaAudios.length) {
          changeAyah(audioIndex);
        } else {
          audioIndex = 0;
          changeAyah(audioIndex);
          quraanAudio.pause();
          isPlaying = true;
          togglePlaying();
        }
      });

      // next and prev buttons

      nextAya.onclick = () => {
        if (audioIndex < ayaAudios.length - 1) {
          audioIndex++;
          changeAyah(audioIndex);
        }
      };
      prevAya.onclick = () => {
        if (audioIndex > 0) {
          audioIndex--;
          changeAyah(audioIndex);
        }
      };

      // play/pause button
      let isPlaying = false;
      togglePlaying();
      function togglePlaying() {
        if (isPlaying) {
          quraanAudio.pause();
          play.innerHTML = '<i class="fa-solid fa-play">';
          isPlaying = false;
        } else {
          quraanAudio.play();
          play.innerHTML = '<i class="fa-solid fa-pause">';
          isPlaying = true;
        }
      }
      play.addEventListener("click", togglePlaying);

      function changeAyah(index) {
        quraanAudio.src = ayaAudios[index];
        ayah.innerHTML = ayahsText[index];
      }
    });
}

// favorites surahs playing

// Quraan Section

let quranSurahsContainer = document.querySelector(".quran .row");
getSurahs();
function getSurahs() {
  fetch("https://api.alquran.cloud/v1/meta")
    .then((response) => response.json())
    .then((data) => {
      let quranSurahs = data.data.surahs.references;
      for (let i = 0; i < quranSurahs.length; i++) {
        quranSurahsContainer.innerHTML += `
        <div class="surah-box" data-sIndex =${i}>
            <p>${quranSurahs[i].name}</p>
            <p>${quranSurahs[i].englishName}</p>
        </div>
        `;
      }
      let surahBoxes = document.querySelectorAll(".surah-box");
      let popup = document.querySelector(".surah-popup");
      let closePopup = document.querySelector(".surah-popup .close");
      let ayatContainer = document.querySelector(".surah-popup .ayat");
      closePopup.onclick = () => {
        popup.classList.remove("open");
      };
      surahBoxes.forEach((sBox, index) => {
        sBox.onclick = () => {
          fetch(`https://api.alquran.cloud/v1/surah/${index + 1}`)
            .then((res) => res.json())
            .then((data) => {
              let ayahs = data.data.ayahs;
              let p = "";
              ayatContainer.innerHTML = "";
              for (let i = 0; i < ayahs.length; i++) {
                p += `<p> ${ayahs[i].text}(${i + 1})</p>`;
                if (i == 0) {
                  p += "<br>";
                }
              }
              ayatContainer.innerHTML = p;
              popup.classList.add("open");
            });
        };
      });
    });
}

// aside toggle

let asideRight = document.querySelector(".sliderAside"),
  asideToggler = document.querySelector(".asideToggler");

asideToggler.addEventListener("click", () => {
  asideRight.classList.toggle("open");
  if (asideRight.classList.contains("open")) {
    document.querySelector(".overlay").style.display = "block";
  } else {
    document.querySelector(".overlay").style.display = "none";
  }
});
document.querySelector(".overlay").onclick = () => {
  if (asideRight.classList.remove("open")) {
    asideRight.classList.remove("open");
  }

  document.querySelector(".overlay").style.display = "none";
};
