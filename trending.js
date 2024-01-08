       // Define the trending playlist ID
       var trendingPlaylistId = 'PL_yIBWagYVjwYmv3PlwYk0b4vmaaHX6aL&si=pBTl8JDauLHHsRIV';

       // Function to load trending songs from the playlist
       // Function to load trending songs from the playlist
       // Function to load trending songs from the playlist
function loadTrendingSongs() {
   var trendingSongLists = document.querySelectorAll('.trending-song-list.column');
   var apiKey = getRandomAPIKey();
   // Fetch the playlist items using the YouTube Data API
   var playlistItemsUrl =
       'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=30&playlistId=' +
       trendingPlaylistId +
       '&key=' +
       apiKey;

   $.getJSON(playlistItemsUrl, function (response) {
       var items = response.items;

       items.forEach(function (item, index) {
           var video = item.snippet;
           var videoId = video.resourceId.videoId;
           var videoTitle = video.title;
           var videoThumbnailUrl = video.thumbnails.default.url;

           // Determine the column for each song
           var column = trendingSongLists[index % 3];

           // Create a list item for each trending song with the video thumbnail
           var listItem = document.createElement('li');
           listItem.innerHTML = `
               <img src="${videoThumbnailUrl}" alt="${videoTitle} Thumbnail">
               <div class="song-title">${videoTitle}</div>
           `;

           // Add a click event listener to play the video
           listItem.addEventListener('click', function () {
                       playVideo(videoId);
                   });

           column.appendChild(listItem);
       });
   });
}

// Call the function to load trending songs
loadTrendingSongs();
