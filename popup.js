const CLIENT_ID = '5d9bc4f5c43c41548b24eb1161ebb589';
const CLIENT_SECRET = 'b1c310e06b124c44b56141a9d5a24d39';
let ACCESS_TOKEN = '';

$(document).ready(async function () {
    // getGuerrilla();
    $('#tananana-tab').css('display', 'block');
    ACCESS_TOKEN = await getAccessToken();
    currentyPlaying();
    setInterval(currentyPlaying, 3000);
    getLatest();
});

function getLatest() {
    $.getJSON('http://tananana.ro/live/meta.php', async function (data) {
        $('div#tananana-tab').empty();
        const current_track = await searchTrack(data.current);
        const current = createTrackElement(1, data.current, current_track, true);
        $('div#tananana-tab').append(current);
        let latest = [];
        data.latest.forEach(e => {
            latest.push(searchTrack(e));
        });
        Promise.all(latest).then((values) => {
            for (let i = 0; i < data.latest.length; ++i) {
                const elem = createTrackElement(i + 2, data.latest[i], values[i], false);
                $('div#tananana-tab').append(elem);
            }
        });
    });
}

function createTrackElement(index, track, spotifyTrack, isCurrent) {
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
    if (getSpotifyURL(spotifyTrack)) {
        spotifyAnchor.setAttribute('href', getSpotifyURL(spotifyTrack));
        spotifyAnchor.setAttribute('target', '_blank');
    } else {
        spotifyAnchor.style.textDecoration = "none";
    }
    const titleText = document.createTextNode(track.split(' - ')[1]);
    spotifyAnchor.appendChild(titleText);
    title.appendChild(spotifyAnchor);
    if (isCurrent) {
        digit.id = 'first';
        const currentyPlayingSpan = document.createElement('span');
        currentyPlayingSpan.id = 'currently-playing';
        const volumeIcon = document.createElement('i');
        volumeIcon.classList.add('fa');
        volumeIcon.classList.add('fa-volume-up');
        volumeIcon.setAttribute('aria-hidden', 'true');
        currentyPlayingSpan.appendChild(volumeIcon);
        title.appendChild(currentyPlayingSpan);
    }
    body.appendChild(title);
    const artist = document.createElement('div');
    artist.className = 'artist';
    const artistText = document.createTextNode(track.split(' - ')[0]);
    artist.appendChild(artistText);
    body.appendChild(artist);
    card.appendChild(body);
    return card;
}

function getSpotifyURL(track) {
    return track.tracks.items[0]?.external_urls.spotify ? track.tracks.items[0]?.external_urls.spotify : '';
}

function searchTrack(title) {
    const encodedTitle = encodeURIComponent(title.replace(/F(ea)?T.*/gmi, "").split(' - ').join(' ')); // can be improved for 're vs are etc
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

$(document).ready(function () {
    $('.tablinks').click(function () {
        console.log($(this));
        // Declare all variables
        var i, tabcontent, tablinks;

        // Get all elements with class="tabcontent" and hide them
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        // Get all elements with class="tablinks" and remove the class "active"
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }

        // Show the current tab, and add an "active" class to the button that opened the tab
        console.log('#' + $(this).attr('id')+ '-tab');
        $('#' + $(this).attr('id') + '-tab').css("display", "block");
        $(this).addClass("active");
    });
});

function getGuerrilla() {
    $.ajax({
        url: "http://www.guerrillaradio.ro/player/data/id3.txt",
        dataType: "text",
        type: "GET",
        succcess: function(data) {
            console.log(data);
        },
        error: function(err) {
            console.log(err);
        }
    });
}

