$(document).ready(function () {
    currentyPlaying();
    setInterval(currentyPlaying, 3000);
    getLatest();
});

function getLatest() {
    $.getJSON('http://tananana.ro/live/meta.php', function (data) {
        console.log(data.latest);
        $('div#main').text('');
        $('div#main').append('<div class="card">' + data.current.split(' - ')[1] +'<span id="currently-playing"><i class="fa fa-volume-up" aria-hidden="true"></i></span><br><span>'+ data.current.split(' - ')[0] +'<span></div><br>');
        data.latest.forEach(e => {
            $('div#main').append('<div class="card">' + e.split(' - ')[1] +'<div>'+ e.split(' - ')[0] +'</div></div><br>');
        });
    });

    setTimeout(getLatest, 240000); // statiscally chosen 4 minutes 
}

function currentyPlaying() {
    const a = $('span#currently-playing');
    a.html('<i class="fa fa-volume-down" aria-hidden="true"></i>');
    setTimeout(function () {
        a.html('<i class="fa fa-volume-up" aria-hidden="true"></i>');
    }, 1500);
}

$('#spotify').click(function() {
    console.log("btn");
})