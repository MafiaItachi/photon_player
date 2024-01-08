function addPlaylist() {
    var playlistLink = document.getElementById('playlistLinkInput').value;
    document.getElementById("playlistLinkInput").value = "";
    if (playlistLink.trim() === '') {
        alert('Please enter a valid YouTube playlist link.');
        return;
    }

    // Extract playlist ID from the link
    var playlistId = getPlaylistIdFromLink(playlistLink);
    if (!playlistId) {
        alert('Invalid YouTube playlist link.');
        return;
    }
    var apiKey = getRandomAPIKey();
    // Fetch playlist details using YouTube Data API
    var playlistDetailsUrl =
        'https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=' +
        playlistId +
        '&key=' +
        apiKey;

    $.getJSON(playlistDetailsUrl, function (response) {
        var playlist = response.items[0];
        var playlistThumbnail = playlist.snippet.thumbnails.medium.url;
        var playlistTitle = playlist.snippet.title;

        // Create HTML elements to display playlist thumbnail and reveal songs
        var playlistContainer = document.createElement('div');
        playlistContainer.classList.add('playlist');
        playlistContainer.setAttribute('data-id', playlistId);

        var playlistThumbnailElement = document.createElement('img');
        playlistThumbnailElement.classList.add('yourplaylist-thumbnail');
        playlistThumbnailElement.src = playlistThumbnail;
        playlistThumbnailElement.alt = playlistTitle;

        playlistThumbnailElement.addEventListener('click', function () {
            revealSongs(playlistId);
        });

        playlistContainer.appendChild(playlistThumbnailElement);

        // Save playlist details in local storage
        var storedPlaylists = JSON.parse(localStorage.getItem('savedPlaylists')) || [];
        storedPlaylists.push({ id: playlistId, title: playlistTitle, thumbnail: playlistThumbnail });
        localStorage.setItem('savedPlaylists', JSON.stringify(storedPlaylists));

        // Append the playlist container to a specific section in your HTML
        var playlistsSection = document.getElementById('addedPlaylists');
        playlistsSection.appendChild(playlistContainer);
    });
}

function getPlaylistIdFromLink(link) {
    // Extract playlist ID from the YouTube link
    var regex = /[?&]list=([^#\&\?]+)/;
    var match = link.match(regex);
    return match && match[1] ? match[1] : null;
}
async function revealSongs(playlistId) {
    // Clear the existing song list
    var songListContainer = document.getElementById('songListContainer');
    songListContainer.innerHTML = '<span style="margin-left: 35%;margin-right: 6px;color: white;font-size: larger;">SONGS</span><button onclick="clearplistsong()" style="margin: 11px;height: 30px;padding: 4px;width: 33px;"><span class="material-symbols-outlined">cancel</span></button>';

    var apiKey = getRandomAPIKey(); // Replace 'YOUR_API_KEY' with your actual YouTube Data API key
    var pageToken = ''; // Initialize page token for pagination

    try {
        while (true) {
            // Fetch playlist items using YouTube Data API with pagination
            var playlistItemsUrl =
                'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=' +
                playlistId +
                '&key=' +
                apiKey +
                '&pageToken=' +
                pageToken;

            const response = await fetch(playlistItemsUrl);
            const data = await response.json();

            var items = data.items;

            if (items.length === 0) {
                // No more songs left
                break;
            }

            var songList = document.createElement('ul');
            songList.classList.add('song-list');

            items.forEach(function (item) {
                var video = item.snippet;
                var videoId = video.resourceId.videoId;
                var videoTitle = video.title;
                var videoThumbnailUrl = video.thumbnails.default.url;

                var listItem = document.createElement('li');
                listItem.classList.add('song-list-item');

                var thumbnail = document.createElement('img');
                thumbnail.classList.add('song-thumbnail');
                thumbnail.src = videoThumbnailUrl;
                thumbnail.alt = videoTitle;

                var title = document.createElement('div');
                title.classList.add('song-title');
                title.textContent = videoTitle;

                listItem.appendChild(thumbnail);
                listItem.appendChild(title);

                // Add click event to play the song
                listItem.addEventListener('click', function () {
                    playVideo(videoId);
                });

                songList.appendChild(listItem);
            });

            // Append fetched songs to the song list container
            songListContainer.appendChild(songList);

            // Check for next page token and update pageToken
            if (data.nextPageToken) {
                pageToken = data.nextPageToken;
            } else {
                // No more pages left
                break;
            }
        }
    } catch (error) {
        console.error('Error fetching playlist items:', error);
        songListContainer.innerHTML = 'Error fetching songs. Please try again later.';
    }
}




function clearplistsong() {
    var songListContainer = document.getElementById('songListContainer');
    if (songListContainer) {
        songListContainer.innerHTML = '';
        // Optionally, you can hide the song list container as well by setting its display to 'none'
        // songListContainer.style.display = 'none';
    }
}
function displaySavedPlaylists() {
    var savedPlaylists = JSON.parse(localStorage.getItem('savedPlaylists')) || [];
    var playlistsSection = document.getElementById('addedPlaylists');
    playlistsSection.innerHTML = ''; // Clear existing content

    savedPlaylists.forEach(function (playlist) {
        var playlistContainer = document.createElement('div');
        playlistContainer.classList.add('playlist');
        playlistContainer.setAttribute('data-id', playlist.id);

        var playlistThumbnailElement = document.createElement('img');
        playlistThumbnailElement.classList.add('yourplaylist-thumbnail');
        playlistThumbnailElement.src = playlist.thumbnail;
        playlistThumbnailElement.alt = playlist.title;

        playlistThumbnailElement.addEventListener('click', function () {
            revealSongs(playlist.id);
        });

        playlistContainer.appendChild(playlistThumbnailElement);

        var playlistInfo = document.createElement('div');
        playlistInfo.classList.add('playlist-info');

        var playlistTitleElement = document.createElement('div');
        playlistTitleElement.classList.add('playlist-title');
        playlistTitleElement.textContent = playlist.title;

        var buttonsDiv = document.createElement('div');
        buttonsDiv.classList.add('playlist-buttons');

        var deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<span class="material-symbols-outlined">cancel</span>';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', function () {
            removePlaylist(playlist.id);
        });

        var shuffleButton = document.createElement('button');
        shuffleButton.innerHTML = '<span class="material-symbols-outlined">play_arrow</span>';
        shuffleButton.classList.add('shuffle-button');
        shuffleButton.addEventListener('click', function () {
            shuffleAndPlaySongs(playlist.id);
        });

        buttonsDiv.appendChild(deleteButton);
        buttonsDiv.appendChild(shuffleButton);

        playlistInfo.appendChild(playlistTitleElement);
        playlistInfo.appendChild(buttonsDiv); // Adding buttons inside playlist-info

        playlistContainer.appendChild(playlistInfo);

        playlistsSection.appendChild(playlistContainer);
    });
}


function removePlaylist(playlistId) {
    var savedPlaylists = JSON.parse(localStorage.getItem('savedPlaylists')) || [];
    var updatedPlaylists = savedPlaylists.filter(function (playlist) {
        return playlist.id !== playlistId;
    });

    localStorage.setItem('savedPlaylists', JSON.stringify(updatedPlaylists));
    displaySavedPlaylists(); // Update the displayed list after removal
}

// Call the function to display saved playlists on page load
displaySavedPlaylists();




var shuffledPlaylist = [];
// Function to shuffle and play songs from a playlist
async function shuffleAndPlaySongs(playlistId) {
    // Set shufflePlaying to true when shuffleAndPlaySongs is called
    repeatMode = 'no-repeat';

    var apiKey = getRandomAPIKey(); // Replace 'YOUR_API_KEY' with your actual YouTube Data API key
    var playlistItemsUrl =
        'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=' +
        playlistId +
        '&key=' +
        apiKey;
    try {
        const response = await fetch(playlistItemsUrl);
        const data = await response.json();

        const items = data.items;
        if (items.length === 0) {
            alert('No songs found in this playlist.');
            return;
        }

        const videoIds = items.map(item => item.snippet.resourceId.videoId);
        
        // Shuffle the video IDs
        const shuffledVideoIds = shuffleArray2(videoIds);

        // Play the shuffled videos sequentially
        await playVideosSequentially(shuffledVideoIds);
    } catch (error) {
        console.error('Error fetching playlist items:', error);
    }
}



// Function to play videos shuffled
async function playVideosShuffled(videoIds) {
    // Shuffle the array of video IDs and play videos in a shuffled order
    const shuffledVideoIds = shuffleArray2(videoIds);

    for (let i = 0; i < shuffledVideoIds.length; i++) {
        await playVideoPromise(shuffledVideoIds[i]);
    }
}


// Function to play a video with a promise
function playVideoPromise(videoId) {
    return new Promise((resolve, reject) => {
        playVideo(videoId);
        player.addEventListener('onStateChange', function onPlayerStateChange(event) {
            if (event.data === YT.PlayerState.ENDED) {
                player.removeEventListener('onStateChange', onPlayerStateChange);
                resolve();
            }
        });
    });
}

// Function to play a video in the YouTube iframe player
function playVideo(videoId) {
    if (player) {
        player.loadVideoById(videoId);
        player.playVideo();
    }
}

// Shuffle function to shuffle an array
function shuffleArray2(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}





// function revealSongs(playlistId) {
//     // Clear the existing song list
//     var songListContainer = document.getElementById('songListContainer');
//     songListContainer.innerHTML = '<span style="margin-left: 35%;margin-right: 6px;color: white;font-size: larger;">SONGS</span><button onclick="clearplistsong()" style="margin: 11px;height: 30px;padding: 4px;width: 33px;"><span class="material-symbols-outlined">cancel</span></button>';

//     // Fetch playlist items using YouTube Data API<button onclick="clearfavsong()" style="margin: 11px;height: 30px;padding: 4px;width: 33px;">…</button>
//     var apiKey = getRandomAPIKey();
//     var playlistItemsUrl =
//         'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=100&playlistId=' +
//         playlistId +
//         '&key=' +
//         apiKey;

//     $.getJSON(playlistItemsUrl, function (response) {
//         var items = response.items;

//         if (items.length === 0) {
//             songListContainer.innerHTML = 'No songs found in this playlist.';
//             return;
//         }

//         var songList = document.createElement('ul');
//         songList.classList.add('song-list');

//         items.forEach(function (item) {
//             var video = item.snippet;
//             var videoId = video.resourceId.videoId;
//             var videoTitle = video.title;
//             var videoThumbnailUrl = video.thumbnails.default.url;

//             var listItem = document.createElement('li');
//             listItem.classList.add('song-list-item');

//             var thumbnail = document.createElement('img');
//             thumbnail.classList.add('song-thumbnail');
//             thumbnail.src = videoThumbnailUrl;
//             thumbnail.alt = videoTitle;

//             var title = document.createElement('div');
//             title.classList.add('song-title');
//             title.textContent = videoTitle;

//             listItem.appendChild(thumbnail);
//             listItem.appendChild(title);

//             // Add click event to play the song
//             listItem.addEventListener('click', function () {
//                 playVideo(videoId);
//             });

//             songList.appendChild(listItem);
//         });

//         // Display the song list
//         songListContainer.appendChild(songList);
//     });
// }