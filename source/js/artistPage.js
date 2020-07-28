import $ from 'jquery';
const ACTIVE_CLASS = 'is-active';
// const INITIAL_TEMPLATE = 'js-template-quote';

export default class ArtistPage {

	/**
	 * 
	 * @param {function} [setupFn] Function to be called when new page is loaded
	 */
	constructor ( setupFn ) {
		this.artistLinks = document.querySelectorAll( '.js-sjma-artist-link' );
		this.templateContainer = document.querySelector( '#sjma-artist-outlet' );
		this.subPageWrapper = document.querySelector( '#sjma-artist-subpage' );
		this.currentTemplate = null;
		this.setup = setupFn;

		this.artistLinks.forEach( link => {
			link.addEventListener( 'click', this.handleArtistLinkClick.bind( this ) );
		} );

		// If the user arrived on the page with a hash in the URL, attempt to
		// load the appropriate sub-page; clear the hash if none is found
		if ( window.location.hash ) {
			try {
				var hash = window.location.hash,
					linkId = hash.replace( '#', 'js-link-' ),
					templateId = hash.replace( '#', 'js-template-' ),
					link = document.getElementById( linkId );
				this.loadTemplate( templateId );
				link.classList.add( ACTIVE_CLASS );
				link.setAttribute( 'aria-selected', 'true' );
				this.fetchCitation( link.href );
			} catch ( e ) {
				window.history.replaceState(null, null, ' ');
			}
		}

		this.preloadImages();
	}

	preloadImages () {
		// var subPageImages = document.querySelectorAll( 'template' ).map( template => {
		// 	return template.content.querySelectorAll( 'img' );
		// } );
		var subPageTemplates = document.querySelectorAll( 'template' );
		var subPageImages = [];
		
		subPageTemplates.forEach( template => {
			var templateImages = template.content.querySelectorAll( 'img' );
			templateImages.forEach( image => { subPageImages.push( image.src ); } )
		} );

		subPageImages.forEach( image => {
			var preloadLink = document.createElement( 'link' );
			preloadLink.rel = 'preload';
			preloadLink.href = image;
			preloadLink.as = 'image';
			document.head.appendChild(preloadLink);
		} );
	}

	/**
	 * @param {*} event 
	 */
	handleArtistLinkClick ( event ) {
		event.preventDefault();

		var link = event.target,
			href = link.href,
			linkId = link.attributes.id.value,
			templateId = linkId.replace( 'js-link-', 'js-template-' ),
			pageId = linkId.replace( 'js-link-', '' );


		if ( templateId !== this.currentTemplate ) {
			this.artistLinks.forEach( link => { 
				link.classList.remove( ACTIVE_CLASS ) 
				link.setAttribute( 'aria-selected', 'false' );
			} );

			link.classList.toggle( ACTIVE_CLASS );
			link.setAttribute( 'aria-selected', 'true' );

			this.loadTemplate( templateId );
			window.history.replaceState( null, null, '#' + pageId );

			this.fetchCitation( href );

			setTimeout( () => {
				if ( this.setup ) { this.setup(); }
			}, 100 )
		} else {
			this.scrollToSubpage();
		}
	}

	/**
	 * 
	 * @param {*} templateId 
	 */
	loadTemplate ( templateId ) {
		var template = document.getElementById( templateId ),
			clone = template.content.cloneNode( true );

		this.subPageWrapper.classList.add( ACTIVE_CLASS );
		this.templateContainer.innerHTML = '';
		this.templateContainer.appendChild( clone );
		this.currentTemplate = templateId;
		this.scrollToSubpage();
	}

	closeTemplate () {
		this.subPageWrapper.classList.remove( ACTIVE_CLASS );
		this.templateContainer.innerHTML = '';
		this.currentTemplate = null;
		window.history.replaceState(null, null, ' ');
	}

	updateHash ( hash ) {
		console.log( hash );
	}

	scrollToSubpage () {
		// Using jQuery for animated scroll because Safari doesn't support behavior: smooth
		setTimeout( () => {
			var offset = $( '#sjma-artist-subpage' ).offset().top;
			$( 'html, body' ).animate( { scrollTop: ( offset - 48 ) }, 300, 'swing' );
		}, 50 );
	}

	fetchCitation ( href ) {
		$.ajax( {
			method: 'GET',
			url: href
		} ).done( html => {
			var citations =  $( html ).find( '.cite-this' );

			$( '.cite-this' ).each( ( index, citation ) => {
				citation.replaceWith( citations.get( index ) );
			} );
		} )
	}
}