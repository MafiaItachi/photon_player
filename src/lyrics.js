
function fetchLyrics(artist, songTitle) {
    var apiUrl = `https://api.lyrics.ovh/v1/${artist}/${songTitle}`;
    console.log(apiUrl); 
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        return response.json();
      })
      .then(data => {
        if (data.lyrics) {
          displayLyrics(data.lyrics);
        } else {
          displayLyrics('Lyrics not found');
        }
      })
      .catch(error => {
        console.error('Error fetching lyrics:', error);
        displayLyrics('Error fetching lyrics');
      });
  }
 
  function displayLyrics(lyrics) { console.log(lyrics); 
    var lyricsContainer = document.getElementById('lyrics-container');
    if (lyricsContainer) {
      // Replace newline characters with <br> tags for line breaks
      var formattedLyrics = lyrics.replace(/\n/g, '<br>');
      lyricsContainer.innerHTML = formattedLyrics; // Update the content of the lyrics container
    }
  }
  function updateVideoTitle2() {
    var videoData = player.getVideoData();
    var videoTitle = videoData.title;
  
    var splitTitle = videoTitle.split(' - ');
    if (splitTitle.length === 2) {
      var artist = splitTitle[0];
      var songTitle = splitTitle[1];
      fetchLyrics(artist, songTitle);
    } else {
      displayLyrics('Invalid title format');
    }
  
    var videoTitleElement = document.querySelector('.video-title2');
    videoTitleElement.textContent = videoTitle;
  }
  function toggleLyrics() {
    var lyricsContainer = document.getElementById('lyrics-container');
    if (lyricsContainer) {
      if (lyricsContainer.style.display === 'none') {
        lyricsContainer.style.display = 'block'; // Show lyrics container
      } else {
        lyricsContainer.style.display = 'none'; // Hide lyrics container
      }
    }
  }
  function togglePlayer() {
    var playerContainer = document.getElementById('player');
    if (playerContainer) {
      if (playerContainer.style.display === 'none') {
        playerContainer.style.display = 'block'; // Show player container
      } else {
        playerContainer.style.display = 'none'; // Hide player container
      }
    }
  }
  