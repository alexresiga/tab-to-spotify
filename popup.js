const CLIENT_ID = '5d9bc4f5c43c41548b24eb1161ebb589';
const CLIENT_SECRET = 'b1c310e06b124c44b56141a9d5a24d39';
let ACCESS_TOKEN = '';

$(document).ready(async function () {
    ACCESS_TOKEN = await getAccessToken();
    currentlyPlaying();
    setInterval(currentlyPlaying, 3000);
    getLatest();
});

function getLatest() {
    $.getJSON('http://tananana.ro/live/meta.php', async function (data) {
        $('div#main').empty();
        const currentTrack = await searchTrack(data.current);
        const currentArtist = await searchArtist(data.current);
        const current = createTrackElement(1, data.current, currentTrack, currentArtist, true);
        $('div#main').append(current);
        let latestTracks = [];
        let latestArtists = [];
        data.latest.forEach(e => {
            latestTracks.push(searchTrack(e));
            latestArtists.push(searchArtist(e));
        });
        let tracksPromise = Promise.all(latestTracks);
        let artistsPromise = Promise.all(latestArtists);
        const [tracks, artists] = await Promise.all([tracksPromise, artistsPromise]);
        for (let i = 0; i < data.latest.length; ++i) {
            const elem = createTrackElement(i + 2, data.latest[i], tracks[i], artists[i], false);
            $('div#main').append(elem);
        }
    });
}

function createTrackElement(index, track, spotifyTrack, spotifyArtist, isCurrent) {
    const card = document.createElement('div');
    card.className = 'card';
    const digit = document.createElement('div');
    digit.className = 'digit';
    const digitText = document.createTextNode(index);
    digit.appendChild(digitText);
    card.appendChild(digit);
    const body = document.createElement('div');
    body.className = 'body';
    const title = document.createElement('div');
    title.className = 'title';
    const spotifyAnchor = document.createElement('a');
    const trackURL = getSpotifyURL(spotifyTrack);
    if (trackURL) {
        spotifyAnchor.setAttribute('href', trackURL);
        spotifyAnchor.setAttribute('target', '_blank');
    } else {
        spotifyAnchor.style.textDecoration = "none";
    }
    const titleText = document.createTextNode(track.split(' - ')[1]);
    spotifyAnchor.appendChild(titleText);
    title.appendChild(spotifyAnchor);
    if (isCurrent) {
        digit.id = 'first';
        const tanananaAnchor = document.createElement('a');
        tanananaAnchor.setAttribute('href', "http://tananana.ro");
        tanananaAnchor.setAttribute('title', "go to TANANANA website");
        tanananaAnchor.setAttribute('target', '_blank');
        const currentlyPlayingSpan = document.createElement('span');
        currentlyPlayingSpan.id = 'currently-playing';
        const volumeIcon = document.createElement('i');
        volumeIcon.classList.add('fa');
        volumeIcon.classList.add('fa-volume-up');
        volumeIcon.setAttribute('aria-hidden', 'true');
        currentlyPlayingSpan.appendChild(volumeIcon);
        tanananaAnchor.append(currentlyPlayingSpan);
        title.appendChild(tanananaAnchor);
    }
    body.appendChild(title);
    const artist = document.createElement('div');
    artist.className = 'artist';
    const spotifyArtistAnchor = document.createElement('a');
    const artistURL = getArtistURL(spotifyTrack, spotifyArtist);
    if (artistURL) {
        spotifyArtistAnchor.setAttribute('href', artistURL);
        spotifyArtistAnchor.setAttribute('target', '_blank');
    } else {
        spotifyArtistAnchor.style.textDecoration = "none";
    }
    const artistText = document.createTextNode(track.split(' - ')[0]);
    spotifyArtistAnchor.appendChild(artistText);
    artist.appendChild(spotifyArtistAnchor);
    body.appendChild(artist);
    card.appendChild(body);
    return card;
}

function getSpotifyURL(track) {
    if (track !== "") {
        return track.tracks.items[0]?.external_urls.spotify ? track.tracks.items[0]?.external_urls.spotify : '';
    }
}

function getArtistURL(track, artist) {
    if (track !== "" && artist !== "") {
        return track.tracks.items[0]?.artists[0]?.external_urls.spotify ? track.tracks.items[0]?.artists[0]?.external_urls.spotify :
            artist.artists.items[0]?.external_urls.spotify ? artist.artists.items[0]?.external_urls.spotify : '';
    }
}

function sanitizeTitle(title) {
    // can be improved for 're vs are etc
    return title
        .replace(/F(ea)?T.*/gmi, "")
        .replace(/\(.*\)/gmi, "")
        .split(' - ')
        .join(' ');
}

function searchTrack(title) {
    const encodedTitle = encodeURIComponent(sanitizeTitle((title)));
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

function searchArtist(title) {
    const artist = title.split(' - ')[0];
    return $.ajax({
        url: "https://api.spotify.com/v1/search?q=" + artist + "&type=artist",
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

function currentlyPlaying() {
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