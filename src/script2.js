




var shuffledPlaylist = []; // Define an array to store the shuffled playlist
        var currentVideoIndex = 0; // Initialize the index of the currently playing video

function shuffleAndPlay2(playlistType) {
    var playlistUrl =
        'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=10&playlistId=' +
        playlistIds[playlistType] +
        '&key=' +
        apiKey;

    $.getJSON(playlistUrl, function (response) {
        var items = response.items;
        shuffledPlaylist = shuffleArray(items); // Shuffle the playlist
        var videoIds = shuffledPlaylist.map(function (item) {
            return item.snippet.resourceId.videoId;
        });

        if (player) {
            player.loadPlaylist(videoIds); // Load the shuffled playlist
            player.setLoop(true);
            player.playVideo();

            // Update the controls with the first video in the shuffled playlist
            var firstVideoId = shuffledPlaylist[0].snippet.resourceId.videoId;
            var firstVideoTitle = shuffledPlaylist[0].snippet.title;

            updateMiniPlayer(firstVideoId, firstVideoTitle);
        }
    });
}

// Listen for the "onStateChange" event to track when a video ends
if (player) {
    player.addEventListener('onStateChange', function (event) {
        if (event.data === YT.PlayerState.ENDED) {
            // Video ended, play the next video in the shuffled playlist
            currentVideoIndex = (currentVideoIndex + 1) % shuffledPlaylist.length;
            var nextVideoId = shuffledPlaylist[currentVideoIndex].snippet.resourceId.videoId;
            var nextVideoTitle = shuffledPlaylist[currentVideoIndex].snippet.title;

            player.loadVideoById(nextVideoId);
            updateMiniPlayer(nextVideoId, nextVideoTitle);
        }
    });
}





function shuffleArray(array) {
    var currentIndex = array.length,
        temporaryValue,
        randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}




function playVideo(videoId) {
    if (player) {
        player.loadVideoById(videoId);
        player.playVideo();

        // Fetch video title using YouTube API
        var url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;

        $.ajax({
            url: url,
            success: function (response) {
                var videoTitle = response.items[0].snippet.title;
                updateMiniPlayer(videoId, videoTitle);
            },
            error: function (xhr) {
                console.log(xhr);
            }
        });
    }
}
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        startProgressInterval();

        // Get the video title and videoId
        var videoTitle = player.getVideoData().title;
        var videoId = player.getVideoData().video_id;

        // Update the video title and thumbnail in your controls
        updateVideoTitleAndThumbnail(videoTitle, videoId);
    } else {
        isPlaying = false;
        stopProgressInterval();
    }

    if (event.data === YT.PlayerState.ENDED) {
        handleVideoEnd();
    }
}

function updateVideoTitleAndThumbnail(title, videoId) {
    // Find the video title and thumbnail elements in your controls
    var videoTitleElement = document.querySelector('.video-title');
    var videoThumbnailElement = document.querySelector('.video-thumbnail');

    // Split the title into words
    var words = title.split(' ');

    // If the title has more than 6 words, truncate it
    if (words.length > 6) {
        title = words.slice(0, 6).join(' ') + '...';
    }

    // Set the new video title and thumbnail
    videoTitleElement.textContent = title;
    videoThumbnailElement.src = "https://img.youtube.com/vi/" + videoId + "/default.jpg";
}

function updateMiniPlayer(videoId, videoTitle) {
    var miniThumbnail = document.querySelector('.video-thumbnail');
    var miniTitle = document.querySelector('.video-title');

    // Split the video title into words and limit to 5 words
    var words = videoTitle.split(' ').slice(0, 5);
    var truncatedTitle = words.join(' ');

    miniThumbnail.src = `https://img.youtube.com/vi/${videoId}/default.jpg`;
    miniTitle.textContent = truncatedTitle;
}





function togglePlayPause() {
    if (isPlaying) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}

function updatePlayPauseButton() {
    var button = $('#play-pause');

    button.html(isPlaying ? '<i class="fa-solid fa-pause fa-xl"></i>' : '<i class="fa-solid fa-play fa-xl"></i>');
}

function startProgressInterval() {
    progressInterval = setInterval(updateProgressBar, 1000);
}

function stopProgressInterval() {
    clearInterval(progressInterval);
}

function addToPlaylistFromVideo() {
    // Get the currently playing video's videoId
    var videoId = player.getVideoData().video_id;

    // Get the video title
    var videoTitle = player.getVideoData().title;

    // Get the existing playlist from local storage
    var storedPlaylist = localStorage.getItem("playlist");
    var playlistItems = storedPlaylist ? JSON.parse(storedPlaylist) : [];

    // Add the new video to the playlist
    playlistItems.push({
        videoId: videoId,
        videoTitle: videoTitle
    });

    // Update the playlist in local storage
    localStorage.setItem("playlist", JSON.stringify(playlistItems));

    // Display the updated playlist
    displayPlaylist();
}


function seek(event) {
    var seekBar = $('#seek-bar');
    var offsetX = event.pageX - seekBar.offset().left;
    var barWidth = seekBar.outerWidth();
    var seekTime = (offsetX / barWidth) * player.getDuration();

    player.seekTo(seekTime, true);
}

function setVolume(event) {
    var volumeBar = $('#volume-bar');
    var offsetX = event.pageX - volumeBar.offset().left;
    var barWidth = volumeBar.outerWidth();
    var volumeLevel = offsetX / barWidth;

    player.setVolume(volumeLevel * 100);
    $('#volume-level').css('width', offsetX + 'px');
}

function toggleRepeatMode() {
    const repeatToggle = document.getElementById('repeat-toggle');
    if (repeatMode === 'no-repeat') {
        repeatMode = 'repeat-all';
        repeatToggle.innerHTML = '<i class="fa-solid fa-repeat fa-lg"></i>';
    } else if (repeatMode === 'repeat-all') {
        repeatMode = 'repeat-one';
        repeatToggle.innerHTML = '<i class="fa-solid fa-redo fa-lg"></i>';
    } else {
        repeatMode = 'no-repeat';
        repeatToggle.innerHTML = '<i class="fa-solid fa-times-circle fa-lg"></i>';
    }
}

function setInitialRepeatModeIcon() {
    const repeatToggle = document.getElementById('repeat-toggle');
    if (repeatMode === 'no-repeat') {
        repeatToggle.innerHTML = '<i class="fa-solid fa-times-circle fa-lg"></i>';
    } else if (repeatMode === 'repeat-all') {
        repeatToggle.innerHTML = '<i class="fa-solid fa-repeat fa-lg"></i>';
    } else {
        repeatToggle.innerHTML = '<i class="fa-solid fa-redo fa-lg"></i>';
    }
}

var apiKeys = ['AIzaSyB8I395JE6CdPKh2mULCPIss6i3rz5m7UY', 'AIzaSyCm3Ezp_uPaNeMjOTXMYVM0FmQ015auYeA',]; // Array of API keys
var currentApiKeyIndex = 0; // Index of the current API key being used





function addToPlaylist(videoId, videoTitle) {
    var playlist = localStorage.getItem("playlist");
    playlistItems = playlist ? JSON.parse(playlist) : [];

    playlistItems.push({
        videoId: videoId,
        videoTitle: videoTitle
    });

    localStorage.setItem("playlist", JSON.stringify(playlistItems));

    displayPlaylist();
}
function playVideos(videoId) {
    if (player) {
        currentVideoIndex = playlistItems.findIndex(item => item.videoId === videoId);
        player.loadVideoById(videoId);
        player.playVideo();

        // Display video title and thumbnail
        var currentVideo = playlistItems.find(function (item) {
            return item.videoId === videoId;
        });

        if (currentVideo) {
            var videoTitleElement = document.querySelector(".video-title");
            var videoThumbnailElement = document.querySelector(".video-thumbnail");

            var videoTitle = currentVideo.videoTitle;
            var truncatedTitle = videoTitle.split(' ').splice(0, 5).join(' ');

            videoTitleElement.textContent = truncatedTitle;
            videoThumbnailElement.src = "https://img.youtube.com/vi/" + videoId + "/default.jpg";
        }
    }
}
// Initialize Hammer.js on the controls section
var controlsElement = document.getElementById('controls');
var controlsHammer = new Hammer(controlsElement);

// Detect swipe gestures
controlsHammer.on('swipeleft', function () {
    playNextTrack();
});

controlsHammer.on('swiperight', function () {
    playPreviousTrack();
});

// Function to play the next track
function playNextTrack() {
    currentVideoIndex++;
    if (currentVideoIndex >= playlistItems.length) {
        currentVideoIndex = 0;
    }
    playVideo(playlistItems[currentVideoIndex].videoId);
}

// Function to play the previous track
function playPreviousTrack() {
    currentVideoIndex--;
    if (currentVideoIndex < 0) {
        currentVideoIndex = playlistItems.length - 1;
    }
    playVideo(playlistItems[currentVideoIndex].videoId);
}

// Initialize Hammer.js on the controls section
var controlsElement = document.getElementById('controls');
var controlsHammer = new Hammer(controlsElement);

// Detect swipe up and swipe down gestures
controlsHammer.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
controlsHammer.on('swipeup swipedown', function (event) {
    event.preventDefault();
});

controlsHammer.on('swipeup', function () {
    showMiniPlayer();
});

controlsHammer.on('swipedown', function () {
    hideMiniPlayer();
});

// Function to show the mini player
// Function to show the mini player
function showMiniPlayer() {
    var miniPlayer = document.getElementById('mini-player');
    miniPlayer.style.transform = 'translateY(0)';
}


// Function to hide the mini player
function hideMiniPlayer() {
    var miniPlayer = document.getElementById('mini-player');
    miniPlayer.style.transform = 'translateY(100%)';
}


function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        startProgressInterval();
        // Get the video title and videoId
        var videoTitle = player.getVideoData().title;
        var videoId = player.getVideoData().video_id;

        // Update the video title and thumbnail in your controls
        updateVideoTitleAndThumbnail(videoTitle, videoId);
    } else {
        isPlaying = false;
        stopProgressInterval();
    }

    if (event.data === YT.PlayerState.ENDED) {
        handleVideoEnd();
    }
    updateVideoTitle2();
    updatePlayPauseButton();
}
function updateVideoTitle2() {
    var videoTitle = player.getVideoData().title;
    var videoTitleElement = document.querySelector('.video-title2');
    videoTitleElement.textContent = videoTitle;
}
function updateVideoTitleAndThumbnail(title, videoId) {
    // Find the video title and thumbnail elements in your controls
    var videoTitleElement = document.querySelector('.video-title');
    var videoThumbnailElement = document.querySelector('.video-thumbnail');

    // Split the title into words
    var words = title.split(' ');

    // If the title has more than 6 words, truncate it
    if (words.length > 6) {
        title = words.slice(0, 6).join(' ') + '...';
    }

    // Set the new video title and thumbnail
    videoTitleElement.textContent = title;
    videoThumbnailElement.src = "https://img.youtube.com/vi/" + videoId + "/default.jpg";
}

// Load the YouTube IFrame Player API asynchronously
// Load the YouTube IFrame Player API asynchronously
var tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

