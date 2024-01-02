// Function to search artist's channel
function searchArtistChannel() {
    var channelName = document.getElementById("searchInput").value;
    var apiKey = 'AIzaSyC_NZ20-1F6OOuFUP8GlD6nVBybrl_IG3o';
    var apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${channelName}&key=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                var channelId = data.items[0].id.channelId;
                var channelName = data.items[0].snippet.channelTitle;
                var channelLink = `https://www.youtube.com/channel/${channelId}`;
                var channelImage = data.items[0].snippet.thumbnails.medium.url;
                displayArtistChannel(channelName, channelId, channelImage);
                loadArtistVideos(channelId);
            } else {
                alert("No channel found for the artist.");
            }
        })
        .catch(error => {
            console.error('Error fetching channel:', error);
        });
}


// Function to load artist's videos from channel
function loadArtistVideos(channelId) {
    var apiKey = 'AIzaSyC_NZ20-1F6OOuFUP8GlD6nVBybrl_IG3o';
    var apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&maxResults=100&key=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                displayArtistVideos(data.items);
            } else {
                alert("No videos found for the artist.");
            }
        })
        .catch(error => {
            console.error('Error fetching videos:', error);
        });
}


function displayArtistChannel(channelName, channelId, channelImage) {
    var artistChannel = document.getElementById("artistChannel");
    artistChannel.innerHTML = "";

    var channelElement = document.createElement("div");
    channelElement.innerHTML = `
                <img src="${channelImage}" alt="Channel Image" style="width: 75px; height: 75px;">
                <p>${channelName}</p>
                <button class="favoriteButton"><i class="fa-solid fa-heart fa-lg"></i></button>
                <button class="play-shuffle-button"><i class="fa-solid fa-random fa-lg"></i></button>
            `;

    artistChannel.appendChild(channelElement);

    var favoriteButton = artistChannel.querySelector(".favoriteButton");
    favoriteButton.addEventListener("click", function () {
        addFavoriteArtist(channelName, channelId, channelImage);
    });
    // Create a Play Shuffle button
    var playShuffleButton = artistChannel.querySelector(".play-shuffle-button");
    playShuffleButton.addEventListener("click", function () {
        playArtistVideosShuffled(channelId);
    });



    // Toggle visibility of artistVideos div
    artistChannel.addEventListener("click", function () {
        var videosDiv = document.getElementById("artistVideos");
        videosDiv.style.display = (videosDiv.style.display === "none") ? "block" : "none";
    });
}

function addFavoriteArtist(channelName, channelId, channelImage) {
    // Create a new div element for the favorite artist
    var favoriteArtistsDiv = document.getElementById("favoriteArtists");
    var artistDiv = document.createElement("div");
    artistDiv.className = "favorite-artist";

    // Create an image element for the channel image
    var channelImg = document.createElement("img");
    channelImg.src = channelImage;
    channelImg.alt = "Channel Image";
    channelImg.style.width = "50px"; // Adjust image size if needed

    // Create a paragraph element for the channel name
    var channelParagraph = document.createElement("p");
    channelParagraph.textContent = channelName;
    // Determine the column for each song


    // Append image and name to the favorite artist div
    artistDiv.appendChild(channelImg);
    artistDiv.appendChild(channelParagraph);

    // Append the favorite artist div to the favorite artists container
    favoriteArtistsDiv.appendChild(artistDiv);

    // Store channel details (name and ID) in localStorage or any storage method you prefer
    // You can store it as an object, array, or any suitable format
    // For example, save it as an array of objects
    var favoriteArtists = JSON.parse(localStorage.getItem("favoriteArtists")) || [];
    favoriteArtists.push({ name: channelName, id: channelId, image: channelImage });
    localStorage.setItem("favoriteArtists", JSON.stringify(favoriteArtists));

    // Add event listener to load the channel's videos when clicked
    artistDiv.addEventListener("click", function () {
        loadFavoriteArtistSongs(channelId);
    });
}

function loadFavoriteArtistSongs(channelId) {
    var apiKey = 'AIzaSyC_NZ20-1F6OOuFUP8GlD6nVBybrl_IG3o'; // Replace with your YouTube API key
    var apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&maxResults=100&key=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                displayFavoriteArtistSongs(data.items);
            } else {
                alert("No videos found for the artist.");
            }
        })
        .catch(error => {
            console.error('Error fetching videos:', error);
        });
}

function playVideoFromId(videoId) {
    // Function to play a video using the YouTube Player API
    if (player) {
        player.loadVideoById(videoId);
        player.playVideo();
    }
}

// Function to display favorite artist's songs
function displayFavoriteArtistSongs(items) {
    var favoriteArtistSongsDiv = document.getElementById("favoriteArtistSongs");
    favoriteArtistSongsDiv.innerHTML = "<span style='margin-left: 35%;margin-right: 6px;color: white;font-size: larger;'>SONGS</span><button onclick='clearfavsong()'style='margin: 11px;height: 30px;padding: 7px;width: 33px;'><i class='fa-solid fa-circle-xmark fa-lg'></i></button>";

    for (var i = 0; i < items.length; i++) {
        var video = items[i];
        var videoId = video.id.videoId;
        var videoTitle = video.snippet.title;

        var videoDiv = document.createElement("div");
        videoDiv.className = "favorite-artist-song";

        var titleElement = document.createElement("p");
        titleElement.textContent = videoTitle;

        var videoThumbnail = document.createElement("img");
        videoThumbnail.src = `https://img.youtube.com/vi/${videoId}/default.jpg`;
        videoThumbnail.alt = "Video Thumbnail";

        videoDiv.appendChild(videoThumbnail);
        videoDiv.appendChild(titleElement);

        // Add click event to play the video when clicked
        videoDiv.addEventListener("click", function (vId) {
            return function () {
                playVideoFromId(vId);
            };
        }(videoId));

        favoriteArtistSongsDiv.appendChild(videoDiv);
    }

    // Show the favorite artist's videos container
    favoriteArtistSongsDiv.style.display = "block";
}

// Call the function to load favorite artists on page load
loadFavoriteArtistsOnLoad();
function loadFavoriteArtistsOnLoad() {
    var favoriteArtists = JSON.parse(localStorage.getItem("favoriteArtists")) || [];
    var favoriteArtistsDiv = document.getElementById("favoriteArtists");
    favoriteArtistsDiv.innerHTML = "";

    for (var i = 0; i < favoriteArtists.length; i++) {
        var artist = favoriteArtists[i];
        var artistDiv = document.createElement("div");
        artistDiv.className = "favorite-artist";

        var channelImg = document.createElement("img");
        channelImg.src = artist.image;
        channelImg.alt = "Channel Image";
        channelImg.style.width = "150px"; // Adjust image size if needed

        var channelParagraph = document.createElement("p");
        channelParagraph.textContent = artist.name;

        var playButton = document.createElement("button");
        playButton.innerHTML = '<i class="fas fa-play"></i>'; // Font Awesome icon for play
        playButton.className = "play-artist-videos";
        playButton.title = "Play All Videos";
        playButton.addEventListener("click", function (id) {
            return function () {
                playFavoriteArtistVideos(id);
            };
        }(artist.id));


        var removeButton = document.createElement("button");
        removeButton.innerHTML = '<i class="fa-solid fa-circle-xmark fa-lg"></i>';
        removeButton.className = "remove-btn";
        // Add event listener to load the channel's videos when clicked
        artistDiv.addEventListener("click", function (artistId) {
            return function () {
                loadFavoriteArtistSongs(artistId);
            };
        }(artist.id));

        // Add click event to remove the artist when clicked
        removeButton.addEventListener("click", function (index) {
            return function () {
                removeFavoriteArtist(index);
            };
        }(i));

        artistDiv.appendChild(channelImg);
        artistDiv.appendChild(channelParagraph);
        artistDiv.appendChild(removeButton);
        artistDiv.appendChild(playButton);

        favoriteArtistsDiv.appendChild(artistDiv);
    }
}

loadFavoriteArtistsOnLoad();


function removeFavoriteArtist(index) {
    var favoriteArtists = JSON.parse(localStorage.getItem("favoriteArtists")) || [];
    favoriteArtists.splice(index, 1);
    localStorage.setItem("favoriteArtists", JSON.stringify(favoriteArtists));
    loadFavoriteArtistsOnLoad();
}







function playArtistVideosShuffled(channelId) {
    var apiKey = 'AIzaSyC_NZ20-1F6OOuFUP8GlD6nVBybrl_IG3o';
    var apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&maxResults=50&key=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                var videos = data.items;
                shuffleArray(videos);
                playShuffledVideos(videos);
            } else {
                alert("No videos found for the artist.");
            }
        })
        .catch(error => {
            console.error('Error fetching videos:', error);
        });
}

function playShuffledVideos(videos) {
    var videoIds = videos.map(video => video.id.videoId);
    var currentIndex = 0;

    function playNextVideo() {
        if (currentIndex < videoIds.length) {
            playVideoFromId(videoIds[currentIndex]);
            currentIndex++;
        } else {
            currentIndex = 0; // Reset index for looping
        }
    }

    // Initial play and continue to next video on video ended
    player.addEventListener('onStateChange', function (event) {
        if (event.data === YT.PlayerState.ENDED) {
            playNextVideo();
        }
    });

    // Start playing the shuffled videos
    playNextVideo();
}












function displayArtistVideos(videos) {
    var artistVideos = document.getElementById("artistVideos");
    artistVideos.innerHTML = "<h1>ARTIST SONGS</h1>";

    videos.forEach(video => {
        var videoTitle = video.snippet.title;
        var videoThumbnail = video.snippet.thumbnails.medium.url;

        var videoElement = document.createElement("div");
        videoElement.innerHTML = `<img src="${videoThumbnail}" alt="${videoTitle}"><p class="artistVideoTitle">${videoTitle}</p>`;

        videoElement.addEventListener('click', function () {
            playVideoOnPlayer(video.id.videoId);
        });

        artistVideos.appendChild(videoElement);
    });
}
// Function to play video on YouTube player
function playVideoOnPlayer(videoId) {
    if (player) {
        player.loadVideoById(videoId);
        player.playVideo();
    }
}


function playArtistVideosShuffled(channelId) {
    var apiKey = 'AIzaSyC_NZ20-1F6OOuFUP8GlD6nVBybrl_IG3o';
    var apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&maxResults=50&key=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                var videos = data.items;
                shuffleArray(videos);
                playShuffledVideos(videos);
            } else {
                alert("No videos found for the artist.");
            }
        })
        .catch(error => {
            console.error('Error fetching videos:', error);
        });
}

function playShuffledVideos(videos) {
    var videoIds = videos.map(video => video.id.videoId);
    var currentIndex = 0;

    function playNextVideo() {
        if (currentIndex < videoIds.length) {
            playVideoFromId(videoIds[currentIndex]);
            currentIndex++;
        } else {
            currentIndex = 0; // Reset index for looping
        }
    }

    // Initial play and continue to next video on video ended
    player.addEventListener('onStateChange', function (event) {
        if (event.data === YT.PlayerState.ENDED) {
            playNextVideo();
        }
    });

    // Start playing the shuffled videos
    playNextVideo();
}





function playFavoriteArtistVideos(artistId) {
    var favoriteArtists = JSON.parse(localStorage.getItem("favoriteArtists")) || [];
    var artist = favoriteArtists.find(artist => artist.id === artistId);

    if (artist) {
        var apiKey = 'AIzaSyC_NZ20-1F6OOuFUP8GlD6nVBybrl_IG3o';
        var apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${artistId}&type=video&key=${apiKey}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.items && data.items.length > 0) {
                    var videoIds = data.items.map(item => item.id.videoId);
                    playVideosSequentially(videoIds);
                } else {
                    alert("No videos found for the artist.");
                }
            })
            .catch(error => {
                console.error('Error fetching videos:', error);
            });
    }
}

function playVideosSequentially(videoIds) {
    var currentVideoIndex = 0;

    function playNextVideo() {
        if (currentVideoIndex < videoIds.length) {
            playVideoFromId(videoIds[currentVideoIndex]);
            currentVideoIndex++;
        }
    }

    playNextVideo(); // Play the first video

    player.addEventListener('onStateChange', function (event) {
        if (event.data === YT.PlayerState.ENDED) {
            playNextVideo(); // Play the next video when the current one ends
        }
    });
}

function removeFavoriteArtist(index) {
    var favoriteArtists = JSON.parse(localStorage.getItem("favoriteArtists")) || [];
    favoriteArtists.splice(index, 1);
    localStorage.setItem("favoriteArtists", JSON.stringify(favoriteArtists));
    loadFavoriteArtistsOnLoad();
}


function clearArtistSearchResults() {
    document.getElementById("artistChannel").innerHTML = "";
    document.getElementById("artistVideos").innerHTML = "";
     document.getElementById("artistSearchInput").value = "";
}


function clearfavsong() {
    document.getElementById("favoriteArtistSongs").innerHTML = "";

}
