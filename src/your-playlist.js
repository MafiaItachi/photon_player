function addPlaylist() {
  var playlistLink = document.getElementById('playlistLinkInput').value;
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
      playlistThumbnailElement.classList.add('playlist-thumbnail');
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

function revealSongs(playlistId) {
  // Clear the existing song list
  var songListContainer = document.getElementById('songListContainer');
  songListContainer.innerHTML = '';

  // Fetch playlist items using YouTube Data API
  var apiKey = 'AIzaSyCm3Ezp_uPaNeMjOTXMYVM0FmQ015auYeA';
  var playlistItemsUrl =
      'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=' +
      playlistId +
      '&key=' +
      apiKey;

  $.getJSON(playlistItemsUrl, function (response) {
      var items = response.items;

      if (items.length === 0) {
          songListContainer.innerHTML = 'No songs found in this playlist.';
          return;
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

      // Display the song list
      songListContainer.appendChild(songList);
  });
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
      playlistThumbnailElement.classList.add('playlist-thumbnail');
      playlistThumbnailElement.src = playlist.thumbnail;
      playlistThumbnailElement.alt = playlist.title;

      playlistThumbnailElement.addEventListener('click', function () {
          revealSongs(playlist.id);
      });

      var playlistTitleElement = document.createElement('div');
      playlistTitleElement.classList.add('playlist-title');
      playlistTitleElement.textContent = playlist.title;

      var deleteButton = document.createElement('button');
      deleteButton.innerHTML = '<i class="fa-solid fa-trash fa-xl">';
      deleteButton.classList.add('delete-button');
      deleteButton.addEventListener('click', function () {
          removePlaylist(playlist.id);
      });

      var shuffleButton = document.createElement('button');
      shuffleButton.innerHTML = '<i class="fa-solid fa-random fa-xl"></i>';
      shuffleButton.classList.add('shuffle-button');
      shuffleButton.addEventListener('click', function () {
          shuffleAndPlay(playlist.id);
      });


      playlistContainer.appendChild(playlistThumbnailElement);
      playlistContainer.appendChild(playlistTitleElement);
      playlistContainer.appendChild(deleteButton);

      playlistContainer.appendChild(shuffleButton);

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

function shuffleAndPlay(playlistId) {
  var savedPlaylists = JSON.parse(localStorage.getItem('savedPlaylists')) || [];
  var selectedPlaylist = savedPlaylists.find(function (playlist) {
      return playlist.id === playlistId;
  });

  if (selectedPlaylist) {
      // Implement shuffling of playlist songs here
      var shuffledSongs = shuffleArray(selectedPlaylist.songs); // Replace 'selectedPlaylist.songs' with your playlist songs array

      // Display a message or perform an action for shuffled songs (e.g., play them)
      console.log('Shuffled songs:', shuffledSongs);
      // Here you can implement logic to play the shuffled songs one by one
  }
}

// Function to shuffle an array (Fisher-Yates shuffle algorithm)
function shuffleArray(array) {
  var currentIndex = array.length;
  var temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // Swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
  }

  return array;
}

