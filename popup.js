const CLIENT_ID = '5d9bc4f5c43c41548b24eb1161ebb589';
const CLIENT_SECRET = 'b1c310e06b124c44b56141a9d5a24d39';
let ACCESS_TOKEN = '';

$(document).ready(async function () {
    ACCESS_TOKEN = await getAccessToken();
    currentyPlaying();
    setInterval(currentyPlaying, 3000);
    getLatest();
});

function getLatest() {
    $.getJSON('http://tananana.ro/live/meta.php', async function (data) {
        $('div#main').empty();
        const current = await createTrackElement(data.current, true);
        $('div#main').append(current);
        let latest = [];
        data.latest.forEach(e => {
            latest.push(searchTrack(e));
        });
        Promise.all(latest).then(async () => {
            for (let i = 0; i < data.latest.length; ++i) {
                const elem = await createTrackElement(data.latest[i], false);
                $('div#main').append(elem);
            }
        });
    });
}

async function createTrackElement(raw, isCurrent) {
    const track = await searchTrack(raw);
    const trackDiv = document.createElement('div');
    trackDiv.className = 'card';
    const spotifyAnchor = document.createElement('a');
    if (getSpotifyURL(track)) {
        spotifyAnchor.setAttribute('href', getSpotifyURL(track));
        spotifyAnchor.setAttribute('target', '_blank');
    }
    const title = document.createTextNode(raw.split(' - ')[1]);
    spotifyAnchor.appendChild(title);
    trackDiv.appendChild(spotifyAnchor);
    if (isCurrent) {
        const currentyPlayingSpan = document.createElement('span');
        currentyPlayingSpan.id = 'currently-playing';
        const volumeIcon = document.createElement('i');
        volumeIcon.classList.add('fa');
        volumeIcon.classList.add('fa-volume-up');
        volumeIcon.setAttribute('aria-hidden', 'true');
        currentyPlayingSpan.appendChild(volumeIcon);
        trackDiv.appendChild(currentyPlayingSpan);
    }
    const breakLine = document.createElement('br');
    trackDiv.appendChild(breakLine);
    const artistSpan = document.createElement('span');
    const artist = document.createTextNode(raw.split(' - ')[0]);
    artistSpan.appendChild(artist);
    trackDiv.appendChild(artistSpan);
    return trackDiv;
}

function getSpotifyURL(track) {
    return track.tracks.items[0]?.external_urls.spotify ? track.tracks.items[0]?.external_urls.spotify : '';
}

function searchTrack(title) {
    const encodedTitle = encodeURIComponent(title.replace(/FT.*/,"").split(' - ').join(' ')); // can be improved for 're vs are etc
    console.log(encodedTitle);
    return $.ajax({
        url: "https://api.spotify.com/v1/search?q=" + encodedTitle + "&type=track",
        type: "GET",
        contentType: "application/x-www-form-urlencoded",
        headers: {
            "Authorization": "Bearer " + ACCESS_TOKEN.access_token
        },
        data: {
            "grant_type": "client_credentials",
        }
    });
}

function currentyPlaying() {
    const a = $('span#currently-playing');
    const volumeIconDown = document.createElement('i');
    volumeIconDown.classList.add('fa');
    volumeIconDown.classList.add('fa-volume-down');
    volumeIconDown.setAttribute('aria-hidden', "true");
    a.html(volumeIconDown);
    setTimeout(function () {
        const volumeIconUp = document.createElement('i');
        volumeIconUp.classList.add('fa');
        volumeIconUp.classList.add('fa-volume-up');
        volumeIconUp.setAttribute('aria-hidden', "true");
        a.html(volumeIconUp);
    }, 1500);
}

function getAccessToken() {
    return $.ajax({
        url: "https://accounts.spotify.com/api/token",
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        headers: {
            "Authorization": "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET)
        },
        data: {
            "grant_type": "client_credentials",
        }
    });
}