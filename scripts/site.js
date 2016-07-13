Y.use('node', 'squarespace-gallery-ng', function(Y) {

  window.Site = Singleton.create({

    ready: function() {
      this.slideshow = null;

      Y.on('domready', this.initialize, this);
    },

    initialize: function() {
      this.setupNavigation();

      if (Y.one('body').hasClass('collection-type-gallery')) {
        this.setupGallery();
      } else if (Y.one('body').hasClass('collection-type-blog')) {
        this.setupBlog();
      }

    },

    setupNavigation: function() {

      // MAKE SURE SUBNAV MARGIN-TOP NOT > 0 ////////////////////////////

      if (Y.one('.subnav')) {
        var subnavMarginTop = parseInt(Y.one('.subnav').getStyle('marginTop'),10);
        if (subnavMarginTop > 0) {
          Y.all('.subnav').setStyle('marginTop', 0);
        }
      }

      // Mobile Nav /////////////////////////////////////////////////////
      if (Y.one('#mobileMenuLink a')) {
        Y.one('#mobileMenuLink a').on('click', function(e){
          Y.one('#mobileNav').toggleClass('menu-open');
        });

        var mobileNav = Y.one('#mobileNav');
        mobileNav && mobileNav.delegate('click', function(e) { 
          e.currentTarget.ancestor('.folder').toggleClass('folder-open');        
        }, '.folder > a');
      }

      // Break Nav if too long for nav and logo
      this.navBreaker();

      this.vertAlignCanvas();

      Y.one(window).on('resize', function () {
        this.vertAlignCanvas();
        this.navBreaker();
      }, this);
    },

    // Nav Breaker -- if site width is too short, drop the nav under the title
    navBreaker: function() {
      var body = Y.one('body');
      if(Y.one('body.header-navigation-split')) {
        body.setAttribute('data-nav','header-navigation-split');
      }
      if (Y.one('body[data-nav="header-navigation-split"]')){
        if (parseInt(Y.one('#header').getComputedStyle('width'),10) < (Y.one('#logo').get('offsetWidth') + Y.one('#topNav').get('offsetWidth'))) {
          body.replaceClass('header-navigation-split', 'header-navigation-normal');
        } else {
          Y.one('.header-navigation-normal') && body.replaceClass('header-navigation-normal', 'header-navigation-split');
        }
      }
    },

    // GALLERY PAGES ///////////////////////////////////////////////////
    setupGallery: function() {

      this.refreshGallery();

      Y.one(window).on('windowresize', function(){
        this.refreshGallery();
      }, this);

      if (Y.Squarespace.Management) {
        Y.Squarespace.Management.on('tweak', function(f){
          if (f.getName() == 'gallery-auto-play') {
            Y.Squarespace.GalleryManager._galleries[0].set('autoplay', Y.Squarespace.Template.getTweakValue('gallery-auto-play') + '' === 'true');
          }
          this.vertAlignCanvas();
        }, this);
      }

      Y.Global.on('tweak:reset', function(){
        Y.later(1000, this, function() {
          this.slideshow.refresh();
        });
      }, this);
      
      Y.Global.on('tweak:close', function(){
        Y.all('.slide img[data-src]' ).each(function(img) {
          ImageLoader.load(img);
        });
      });

    },

    refreshGallery: function() {

      if (parseInt(Y.one('body').getComputedStyle('width'),10) <= 800) {

        Y.one('#slideshowWrapper').addClass('mobile-gallery')
          .all('img[data-src]' ).each(function(img) {
            ImageLoader.load(img.removeAttribute('data-load'));
        });
        
        Y.all('.sqs-video-wrapper').each(function(videoWrapper) {
          videoWrapper.plug(Y.Squarespace.VideoLoader);
        });

      } else if (Y.one('#slideshow .slide') && !this.slideshow) {

        // To improve performance
        Y.Squarespace.GalleryManager._queueThrottle = 5;

        this.slideshow = new Y.Squarespace.Gallery2({
          container: Y.one('#slideshow'),
          elements: {
            next: '.gallery-next',
            previous: '.gallery-prev'
            // currentIndex: '.nav .currentIndex',
            // totalSlides: '.nav .totalSlides'
          },
          loop: true,
          autoplay: Y.Squarespace.Template.getTweakValue('gallery-auto-play') + '' === 'true',
          design: 'strip',
          designOptions: {
            autoHeight: false,
            speed: 0.6
          },
          lazyLoad: true,
          refreshOnResize: true,
          refreshOnOrientationChange: true,
          historyHash: true
        });

      }

    },

    // BLOG PAGES ///////////////////////////////////////////////////
    setupBlog: function() {
      var sidebarEl = Y.one('#sidebarWrapper');
       Y.one('#page').setStyle('minHeight', sidebarEl.get('offsetHeight'));
    },

    // center page if able to
    vertAlignCanvas: function() {

      if (Modernizr.flexbox) {
        return false;
      }

      var windowHeight = Y.one('body').get('winHeight');
      var canvasHeight = Y.one('#canvas').get('offsetHeight');

      if (windowHeight > canvasHeight) {
        Y.one('#canvasWrapper').setStyles({
          height: '100%',
          position: 'relative',
          visibility: 'visible'
        });
        Y.one('#canvas').setStyles({
          marginTop: -(canvasHeight / 2),
          top: '50%',
          position: 'relative'
        });
      } else {
        Y.one('#canvasWrapper').setStyles({
          height: 'auto',
          position: 'relative',
          visibility: 'visible'
        });
        Y.one('#canvas').setStyles({
          marginTop: 0,
          top: 0,
          position: 'relative'
        });
      }

    }

  });

});