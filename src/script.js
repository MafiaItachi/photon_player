

// ... (previous code)

   // Function to shuffle an array randomly
   function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Event listener for the Shuffle button
const shuffleButton = document.getElementById('shuffle-button2');
shuffleButton.addEventListener('click', () => {
    shuffleArray(playlistVideoIds); // Shuffle the playlist
    currentIndex = -1; // Reset the current index
    playNextSong(); // Play the first shuffled song
});


// ... (previous code)

// Replace with your YouTube API Key
const apiKey = 'AIzaSyB8I395JE6CdPKh2mULCPIss6i3rz5m7UY';

// Create an array to store multiple artist playlist IDs
const artistPlaylists = [
    { name: 'Talor Swift', playlistId: 'RDCLAK5uy_k1272v-yXtLJm7gmMiAxjOl-vh5aEC11A' },
    { name: 'Selena', playlistId: 'RDCLAK5uy_mvsCHKeFgZxCoFoMA2CClIVPvhFaJCfV8' },
    { name: 'Ariana', playlistId: 'RDCLAK5uy_m6_xW9k1AulRRrn2tpl9gU_Lp3v110LpA' },
    { name: 'Ed sheeran', playlistId: 'RDCLAK5uy_lL718gGQZgQf4jkKYjVbOXHABQCFAYuj0' },
    { name: 'Linking Park', playlistId: 'RDCLAK5uy_loGaNxpVmNaawt9htfXXYRYfm-D8xmHLY' },
    { name: 'Olivia Rodrigo', playlistId: 'RDCLAK5uy_mQTn6lqC0RbdmtrhBfbeLJRUzBIkzkm_M' },
    { name: 'Ritviz', playlistId: 'RDCLAK5uy_knmHvX39raQ7qEvKH5yJFsEy5ADmvoelc' },
    { name: 'Arijit', playlistId: 'RDCLAK5uy_kGLDDW42tws3jDBNB3m8eRcn3iDWMlwd8' },
    // Add more artists and playlist IDs as needed
];
// ... (previous code)

// Function to load the playlist thumbnail for a given artist
function loadPlaylistThumbnail(artist, callback) {
    fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${artist.playlistId}&key=${apiKey}`)
        .then((response) => response.json())
        .then((data) => {
            // Get the playlist thumbnail URL
            const thumbnailUrl = data.items[0].snippet.thumbnails.medium.url;
            artist.thumbnailUrl = thumbnailUrl;
            callback();
        })
        .catch((error) => console.error('Error loading playlist thumbnail:', error));
}

// Load playlist thumbnails and then populate the artist list
function loadArtistList() {
    const artistList = document.getElementById('artist-list');

    function createArtistListItem(artist) {
        const artistItem = document.createElement('li');
        artistItem.innerHTML = `<img src="${artist.thumbnailUrl}" alt="${artist.name}"> ${artist.name}`;
        artistItem.addEventListener('click', () => selectArtist(artist));
        artistList.appendChild(artistItem);
    }

   
    artistPlaylists.forEach((artist) => {
        loadPlaylistThumbnail(artist, () => {
            createArtistListItem(artist);
            loadedCount++;

            // If all playlist thumbnails are loaded, select the first artist
            if (loadedCount === artistPlaylists.length) {
                selectArtist(artistPlaylists[0]);
            }
        });
    });
}

// ... (continue with the previous code for selecting artists and loading playlists)

// Load the artist list with playlist thumbnails when the page loads
loadArtistList();

// Load artists and songs from the selected artist's playlist
function loadPlaylist(playlistId) {
    playlistVideoIds.length = 0; // Clear the playlist
    currentIndex = -1; // Reset the current index

    const playlistContainer = document.getElementById('playlist2');
    playlistContainer.innerHTML = '';

    // Fetch the playlist details to get the playlist thumbnail
    fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.items.length > 0) {
                const playlist = data.items[0];
                const playlistTitle = playlist.snippet.title;
                const playlistThumbnailUrl = playlist.snippet.thumbnails.medium.url;

                // Display the playlist thumbnail
                const playlistThumbnail = document.createElement('img');
                playlistThumbnail.src = playlistThumbnailUrl;
                playlistThumbnail.alt = playlistTitle;
                const playlistThumbnailDiv = document.createElement('div');
                playlistThumbnailDiv.appendChild(playlistThumbnail);
                playlistContainer.appendChild(playlistThumbnailDiv);
            }
        })
        .catch((error) => console.error('Error loading playlist details:', error));

    // Fetch the playlist videos
    fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`)
        .then((response) => response.json())
        .then((data) => {
            data.items.forEach((item) => {
                const title = item.snippet.title;
                const videoId = item.snippet.resourceId.videoId;
                const thumbnailUrl = item.snippet.thumbnails.default.url; // Get the thumbnail URL

                // Add the song to the playlist with thumbnail
                const song = document.createElement('li');
                song.innerHTML = `<img src="${thumbnailUrl}" alt="${title}"> ${title}`;
                song.addEventListener('click', () => playSong(videoId));
                playlistContainer.appendChild(song);

                playlistVideoIds.push(videoId); // Store the video ID in the playlist
            });
        })
        .catch((error) => console.error('Error loading playlist:', error));
}

// Play a song by its video ID
function playSong(videoId) {
    if (player) {
        player.loadVideoById(videoId);
    }
}

// Maintain a queue of video IDs to play one by one
const videoQueue = [];



// Array to store the video IDs of the playlist
const playlistVideoIds = [];

// Initialize the current index to -1 (no song playing)
let currentIndex = -1;

function onPlayerStateChange2(event) {
    if (event.data === YT.PlayerState.ENDED) {
        playNextSong();
    }
}

// Play the next song in the playlist
function playNextSong() {
    if (currentIndex < playlistVideoIds.length - 1) {
        currentIndex++;
        const nextVideoId = playlistVideoIds[currentIndex];
        playSong(nextVideoId);
    }
}

// Function to reveal an artist's playlist when their thumbnail is clicked
function selectArtist(artist) {
loadPlaylist(artist.playlistId);
const playlistContainer = document.getElementById('playlist2');
playlistContainer.style.display = 'block'; // Reveal the playlist  === 'block' ? 'none' : 'block';
}