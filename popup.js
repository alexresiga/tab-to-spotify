const CLIENT_ID = '5d9bc4f5c43c41548b24eb1161ebb589';
const CLIENT_SECRET = 'b1c310e06b124c44b56141a9d5a24d39';
let ACCESS_TOKEN = '';

$(document).ready(async function () {
    ACCESS_TOKEN = await getAccessToken();
    currentyPlaying();
    setInterval(currentyPlaying, 3000);
    getLatest();
    // setInterval(getLatest, 9000); // refresh issues
});

function getLatest() {
    console.log('latest');
    $.getJSON('http://tananana.ro/live/meta.php', async function (data) {
        $('div#main').empty();
        const track = await searchTrack(data.current);
        const track_url = track.tracks.items[0]?.external_urls.spotify;
        const url = track_url ? track_url : '#';
        $('div#main').append('<div class="card"><a target="_blank" href="' + url + '">' + data.current.split(' - ')[1] + '</a><span id="currently-playing"><i class="fa fa-volume-up" aria-hidden="true"></i></span><br><span>' + data.current.split(' - ')[0] + '<span></div><br>');
        let latest = [];
        data.latest.forEach(e => {
            latest.push(searchTrack(e));
        });
        Promise.all(latest).then((values) => {
            console.log(values);
            for (let i = 0; i < data.latest.length; ++i) {
                const latestTrack = values[i];
                const track_url = latestTrack.tracks.items[0]?.external_urls.spotify;
                const url = track_url ? track_url : '#';
                $('div#main').append('<div class="card"><a target="_blank" href="' + url + '">' + data.latest[i].split(' - ')[1] + '</a><div>' + data.latest[i].split(' - ')[0] + '</div></div><br>');
            }
        });
    });
}

function searchTrack(title) {
    const encodedTitle = encodeURIComponent(title.split(' - ').join(' '));
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