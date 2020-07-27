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
        // $('div#main').append('<div class="card"><a target="_blank" ' + url + '">' + data.current.split(' - ')[1] + '</a><span id="currently-playing"><i class="fa fa-volume-up" aria-hidden="true"></i></span><br><span>' + data.current.split(' - ')[0] + '<span></div><br>');
        let latest = [];
        data.latest.forEach(e => {
            latest.push(searchTrack(e));
        });
        Promise.all(latest).then(async (values) => {
            console.log(values);
            for (let i = 0; i < data.latest.length; ++i) {
                const elem = await createTrackElement(data.latest[i], false);
                $('div#main').append(elem);
                // $('div#main').append('<div class="card"><a target="_blank" ' + url + '">' + data.latest[i].split(' - ')[1] + '</a><div>' + data.latest[i].split(' - ')[0] + '</div></div>');
            }
        });
    });
}

async function createTrackElement(raw, isCurrent) {
    const track = await searchTrack(raw);
    const trackDiv = document.createElement('div');
    trackDiv.className = "card";
    const spotifyAnchor = document.createElement('a');
    if (getSpotifyURL(track)) {
        spotifyAnchor.setAttribute('href', getSpotifyURL(track));
    }
    const title = document.createTextNode(raw.split(' - ')[1]);
    spotifyAnchor.appendChild(title);
    trackDiv.appendChild(spotifyAnchor);
    if (isCurrent) {
        const currentyPlayingSpan = document.createElement('span');
        currentyPlayingSpan.id = "currently-playing";
        const volumeIcon = document.createElement('i');
        volumeIcon.classList.add('fa');
        volumeIcon.classList.add('fa-volume-up');
        volumeIcon.setAttribute('aria-hidden', "true");
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
    console.log(title);
    const encodedTitle = encodeURIComponent(title.split(' FT. ')[0].split(' - ').join(' ')); // can be improved for 're vs are etc
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
    a.html('<i class="fa fa-volume-down" aria-hidden="true"></i>');
    setTimeout(function () {
        a.html('<i class="fa fa-volume-up" aria-hidden="true"></i>');
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