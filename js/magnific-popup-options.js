$(document).ready(function() {
  // MagnificPopup
  var magnifPopup = function() {
    $('.image-popup').magnificPopup({
      type: 'image',
      removalDelay: 300,
      mainClass: 'mfp-with-zoom',
      gallery:{
        enabled:true
      },
      zoom: {
        enabled: true, // By default it's false, so don't forget to enable it

        duration: 300, // duration of the effect, in milliseconds
        easing: 'ease-in-out', // CSS transition easing function

        // The "opener" function should return the element from which popup will be zoomed in
        // and to which popup will be scaled down
        // By defailt it looks for an image tag:
        opener: function(openerElement) {
        // openerElement is the element on which popup was initialized, in this case its <a> tag
        // you don't need to add "opener" option if this code matches your needs, it's defailt one.
        return openerElement.is('img') ? openerElement : openerElement.find('img');
        }
      }
    });
  };

  var videoPopup = function() {
    $('.video-popup').magnificPopup({
      type: 'inline',
      removalDelay: 300,
      mainClass: 'mfp-with-zoom',
      callbacks: {
        open: function() {
          var video = this.content.find('video').get(0);
          if (!video) return;

          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function(error) {
              console.error('Video galeri gagal diputar.', error);
            });
          }
        },
        close: function() {
          var video = this.content.find('video').get(0);
          if (video) {
            video.pause();
            video.currentTime = 0;
          }
        }
      }
    });
  };
  
  // Call the functions 
  magnifPopup();
  videoPopup();

});