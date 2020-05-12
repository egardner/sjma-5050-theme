const ACTIVE_CLASS = 'is-active';
const INITIAL_TEMPLATE = 'js-template-quote';

export default class ArtistPage {

	/**
	 * 
	 * @param {function} [setupFn] Function to be called when new page is loaded
	 */
	constructor ( setupFn ) {
		this.artistLinks = document.querySelectorAll( '.js-sjma-artist-link' );
		this.templateContainer = document.querySelector( '#sjma-artist-outlet' );
		this.currentTemplate = INITIAL_TEMPLATE;
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
			} catch ( e ) {
				window.history.replaceState(null, null, ' ');
			}
		}
	}

	/**
	 * @param {*} event 
	 */
	handleArtistLinkClick ( event ) {
		event.preventDefault();

		var link = event.target,
			linkId = link.attributes.id.value,
			templateId = linkId.replace( 'js-link-', 'js-template-' ),
			pageId = linkId.replace( 'js-link-', '' );

		this.artistLinks.forEach( link => { link.classList.remove( ACTIVE_CLASS ) } );

		// Determine whether we are loading a new template or closing the
		// existing one
		if ( templateId === this.currentTemplate ) {
			this.loadTemplate( INITIAL_TEMPLATE );
			window.history.replaceState(null, null, ' ');

			setTimeout( () => {
				if ( this.setup ) { this.setup(); }
			}, 100 )

		} else {
			link.classList.toggle( ACTIVE_CLASS );
			this.loadTemplate( templateId );
			window.history.replaceState( null, null, '#' + pageId );

			setTimeout( () => {
				if ( this.setup ) { this.setup(); }
			}, 100 )
		}
	}

	/**
	 * 
	 * @param {*} templateId 
	 */
	loadTemplate ( templateId ) {
		var template = document.getElementById( templateId ),
			clone = template.content.cloneNode( true );

		this.templateContainer.innerHTML = '';
		this.templateContainer.appendChild( clone );
		this.currentTemplate = templateId;

		// setTimeout( () => {
		// 	if ( this.setup ) { this.setup(); }

		// 	document.querySelector( '#sjma-artist-outlet' ).scrollIntoView({ 
		// 		behavior: 'smooth'
		// 	});
		// }, 200 )
	}

	updateHash ( hash ) {
		console.log( hash );
	}
}