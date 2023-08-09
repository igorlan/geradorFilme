let currentOpenModal = null;
let optionMovie = 'normal';

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        if (currentOpenModal === "detailsModal") {
            closeDetailsModal();
        } else if (currentOpenModal === "filmeModal") {
            closeModal();
        }
    }
});

async function getMovies() {
    const randomPage = Math.floor(Math.random() * (500 - 1 + 1)) + 1;

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMDg3MjU1NTZmZmM4NzE3YzVkZGNlZGU5YTlmNzc0OSIsInN1YiI6IjY0ZDJkZTk2YmYzMWYyMDFjZTY2NzdmZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ._idTsTHBFWo_SmOzGtzD86966z4ELuWUMWVc9BqnH44'
        }
    };

    try {
        const [normalMovies, brMovies] = await Promise.all([
            optionMovie === "normal"
                ? fetch(`https://api.themoviedb.org/3/movie/popular?language=pt-BR&page=${randomPage}`, options)
                    .then(response => response.json())
                : fetch(`https://api.themoviedb.org/3/discover/movie?include_adult=true&include_video=false&language=en-US&page=${randomPage}&sort_by=popularity.desc&with_genres=27&with_origin_country=US`, options)
                    .then(response => response.json()),
            fetch(`https://api.themoviedb.org/3/discover/movie?include_adult=true&include_video=false&language=en-US&page=${randomPage}&sort_by=popularity.desc&with_genres=27&with_origin_country=BR`, options)
                .then(response => response.json())
        ]);
        const combinedResults = [...normalMovies.results, ...brMovies.results];
        return combinedResults;
    } catch (error) {
        alert(error);
    }
}

async function getMoreInfo(info) {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMDg3MjU1NTZmZmM4NzE3YzVkZGNlZGU5YTlmNzc0OSIsInN1YiI6IjY0ZDJkZTk2YmYzMWYyMDFjZTY2NzdmZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ._idTsTHBFWo_SmOzGtzD86966z4ELuWUMWVc9BqnH44'
        }
    };
    try {
        const data = await fetch(`https://api.themoviedb.org/3/movie/${info}?language=pt-BR`, options)
            .then(response => response.json())
        return data
    } catch (error) {
        alert(error)
    }
}

async function verTrailer(e) {
    const button = e.currentTarget;
    const movie_id = button.dataset.id;
    button.classList.add('loading');
    button.disabled = true;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMDg3MjU1NTZmZmM4NzE3YzVkZGNlZGU5YTlmNzc0OSIsInN1YiI6IjY0ZDJkZTk2YmYzMWYyMDFjZTY2NzdmZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ._idTsTHBFWo_SmOzGtzD86966z4ELuWUMWVc9BqnH44'
        }
    };

    try {
        const data = await fetch(`https://api.themoviedb.org/3/movie/${movie_id}/videos?language=en-US`, options)
            .then(response => response.json())
        const { results } = data
        const youtubeVideo = results.find(video => video.type === "Trailer")
        window.open(`https://youtube.com/watch?v=${youtubeVideo.key}`, 'blank')
    } catch (error) {
        alert(error)
    } finally {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

function creteMovieLayout({
    videoid,
    id,
    title,
    stars,
    image,
    time,
    year
}) {
    return `
    <div class="movie">
    <div class="title">
        <span class="title-text">${title}</span>
        <div><img src="./assets/Star.png" alt="">
            <p>${stars}</p>
        </div>
        <div class="tooltip">${title}</div>
    </div>

        <div class="poster">
            <img src="https://image.tmdb.org/t/p/w500${image}" alt="Imagem de ${title}">
        </div>

        <div class="info">
            <div class="duration">
                <img src="./assets/Clock.png" alt="">
                    <span>${time}</span>
            </div>

            <div class="year">
                <img src="./assets/CalendarBlank.png" alt="">
                    <span>${year}</span>
            </div>
        </div>

        <div class="actions">

        <button onclick="verTrailer(event)" data-id="${id}">
                <span>Trailer</span>
        </button>

        <button onclick="openModal(event)" data-id="${videoid}">
            <img src="./assets/Play.png" alt="">
        </button>
        </div>
    </div>
    `
}

function selectVideos(results) {
    const random = () =>
        Math.floor(Math.random() * results.length)

    let selectVideos = new Set()

    while (selectVideos.size < 3) {
        selectVideos.add(results[random()].id)
    }

    return [...selectVideos]
}

function minutesToHourMinutesAndSeconds(minutes) {
    const date = new Date(null)
    date.setMinutes(minutes)
    return date.toISOString().slice(11, 19)
}

async function start() {
    const startButton = document.getElementById('button-start');
    const normalModeButton = document.getElementById('normalModeButton');
    const terrorModeButton = document.getElementById('terrorModeButton');

    // Adicionar classe 'loading' e desabilitar botões
    normalModeButton.classList.add('loading');
    terrorModeButton.classList.add('loading');
    normalModeButton.disabled = true;
    terrorModeButton.disabled = true;
    startButton.classList.add('loading');
    startButton.disabled = true;

    try {
        const results = await getMovies();
        console.log(await getMovies())
        const best3 = selectVideos(results).map(async movie => {
            const [info] = await Promise.all([
                getMoreInfo(movie),
            ]);

            const props = {
                id: info.id,
                videoid: info.imdb_id,
                title: info.title,
                stars: Number(info.vote_average).toFixed(1),
                image: info.poster_path,
                time: minutesToHourMinutesAndSeconds(info.runtime),
                year: info.release_date.slice(0, 4)
            };

            const detailsInfo = {
                ...info,
                ...props
            };

            return { props, detailsInfo };
        });

        const output = await Promise.all(best3);
        document.querySelector('.movies').innerHTML = output.map(({ props }) => creteMovieLayout(props)).join('');

        const movieElements = document.querySelectorAll('.movie');
        movieElements.forEach((movieElement, index) => {
            const poster = movieElement.querySelector('.poster img');

            poster.addEventListener('click', () => openDetailsModal(output[index].detailsInfo));
        });

        const normalModeButton = document.getElementById('normalModeButton');
        const terrorModeButton = document.getElementById('terrorModeButton');
        if (optionMovie === 'normal') {
            normalModeButton.style.display = 'none';
            terrorModeButton.style.display = 'block';
        } else {
            normalModeButton.style.display = 'block';
            terrorModeButton.style.display = 'none';
        }

    } catch (error) {
        console.error(error);
        alert('Erro ao carregar os filmes. Por favor, tente novamente.');
    } finally {
        startButton.classList.remove('loading');
        startButton.disabled = false;
        normalModeButton.classList.remove('loading');
        terrorModeButton.classList.remove('loading');
        normalModeButton.disabled = false;
        terrorModeButton.disabled = false;
    }
}

function openDetailsModal(info) {
    closeCurrentOpenModal();
    const modal = document.getElementById("detailsModal");
    const movieDetails = modal.querySelector(".movie-details");
    const genresList = info.genres.map(genre => `<li>${genre.name}</li>`).join("");
    const companiesList = info.production_companies
        .map(company => {
            if (company.logo_path) {
                return `
        <div class="production-company">
          <img src="https://image.tmdb.org/t/p/w500${company.logo_path}" alt="${company.name} Logo">
        </div>
      `;
            }
            return "";
        })
        .join("");

    movieDetails.innerHTML = `
    <span class="close" onclick="closeDetailsModal()">&times;</span>
    <img class="backdrop" src="https://image.tmdb.org/t/p/w500${info.backdrop_path}"/>
        <div class="container-modal">
            <div class="title">
            <span class="title-text">${info.title}</span>
            <div>
                <img src="./assets/Star.png" alt="">
                    <p>${info.stars}</p>
            </div>
            <div class="tooltip">${info.title}</div>
            </div>        
            <div class="info">
                <div class="duration">
                    <img src="./assets/Clock.png" alt="">
                        <span>${info.time}</span>
                </div>
                <div class="year">
                    <img src="./assets/CalendarBlank.png" alt="">
                        <span>${info.year}</span>
                </div>
            </div>
            <div style="margin-top: 7vh">
            <p>${info.overview}</p>
                <div class="genres">
                    ${genresList}
                </div>

                <div class="producters">
                    ${companiesList}
                </div>
            </div>
        </div>

        <div class="actions">
            <button onclick="verTrailer(event)" data-id="${info.id}">
                    <span>Trailer</span>
            </button>

            <button onclick="openModal(event)" data-id="${info.videoid}">
                <img src="./assets/Play.png" alt="">
            </button>
        </div>
    `;

    modal.classList.add("show");
    currentOpenModal = "detailsModal";
}

function closeDetailsModal() {
    const modal = document.getElementById("detailsModal");
    modal.classList.remove("show");
    currentOpenModal = null;
}

function toggleMovieMode(mode) {
    optionMovie = mode;

    if (optionMovie === 'terror') {
        optionMovie = 'terror';
        document.body.classList.add('terror-mode');
    } else {
        optionMovie = 'normal';
        document.body.classList.remove('terror-mode');
    }
    start();
}

function openModal(e) {
    closeCurrentOpenModal();
    const movie_id = e.currentTarget ? e.currentTarget.dataset.id : e
    const modal = document.getElementById("filmeModal");
    const iframe = document.getElementById("trailerIframe");
    iframe.src = `https://embed.warezcdn.net/filme/${movie_id}`;
    modal.classList.add("show");
    currentOpenModal = "filmeModal";
}

function closeModal() {
    const modal = document.getElementById("filmeModal");
    const iframe = document.getElementById("trailerIframe");
    iframe.src = "";
    modal.classList.remove("show");
    currentOpenModal = null;
}

function closeCurrentOpenModal() {
    if (currentOpenModal === "detailsModal") {
        closeDetailsModal();
    } else if (currentOpenModal === "filmeModal") {
        closeModal();
    }
}
start()