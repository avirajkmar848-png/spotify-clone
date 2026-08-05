
let currentsong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Pad with leading zeros if they are single digits
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${paddedMinutes}:${paddedSeconds}`;
}

async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }


    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""



    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="40" height="40" viewBox="0 0 24 24" style="color: rgb(174, 176, 179);"><path fill="currentColor" d="M8 6.1L19 5v11a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3c.77 0 1.47.29 2 .76V9.04l-9 1V17a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3c.77 0 1.47.29 2 .76zM9 7v2.03l9-.99V6.09zM8 17a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2m10-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2"></path></svg>
                <div class="Info">
                <div> ${song.replaceAll("%20", " ")}</div>
                <div>Song Artist</div>
                </div>
                <div class="playnow">
                  
                <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%2322c55e'/><path fill='%23000' d='M42.4 32.5L23 44.38L22 45V20l1 .62z'/></svg>">
            </div>
           
    </li>`;
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".Info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".Info").firstElementChild.innerHTML.trim())
        })
    })

    return songs;

}
const playMusic = (track, pause = false) => {

    currentsong.src = `/${currFolder}/` + track
    if (!pause) {
        currentsong.play()
        play.src = "Images/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {

    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer");

    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {

        const element = array[index];

        if (element.href.includes("/songs")) {

            let folder = new URL(element.href).pathname.split("/").filter(Boolean).at(-1);

            let res = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            if (!res.ok) continue;

            let response = await res.json();

            cardcontainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <div class="play">
                    <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%2322c55e'/><path fill='%23000' d='M42.4 32.5L23 44.38L22 45V20l1 .62z'/></svg>">
                </div>
                <img src="/songs/${folder}/cover.jpg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`;
        }
    }

    document.querySelectorAll(".card").forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Card clicked:", item.currentTarget.dataset.folder);

            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
        });
    });
}
async function main() {

    await getsongs("songs/Ncs");
    playMusic(songs[0], true)


    displayAlbums()

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "Images/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "Images/play.svg"
        }
    })

    currentsong.addEventListener("timeupdate", () => {
        console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)}/${formatTime(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    previous.addEventListener("click", () => {
        console.log("Previous clicked");

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })


    next.addEventListener("click", () => {
        currentsong.pause();
        console.log("Next clicked");

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(e, e.target, e.target.value)
        currentsong.volume = parseInt(e.target.value) / 100
    })

    document.querySelector(".volume>img").addEventListener("click", e => {
    console.log(e.target);

    if (e.target.src.includes("Images/volume.svg")) {
        e.target.src = e.target.src.replace("Images/volume.svg", "Images/mute.svg");
        currentsong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    } 
    else {
        e.target.src = e.target.src.replace("Images/mute.svg", "Images/volume.svg");
        currentsong.volume = 0.10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
});



}
main()
