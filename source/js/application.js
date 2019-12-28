import $ from 'jquery';

// CSS
import "../css/application.scss";

// Essential functionality

/**
 * toggleMenu
 * @description Show/hide the menu UI by changing CSS classes and Aria status.
 * This function is bound to the global window object so it can be called from
 * templates without additional binding.
 */
window[ 'toggleMenu' ] = () => {
  let menu = document.getElementById('site-menu');
  let menuAriaStatus = menu.getAttribute('aria-expanded');

	menu.classList.toggle(
		'is-expanded',
		!menu.classList.contains('is-expanded')
	);

	if (menuAriaStatus === 'true') {
		$('.side-by-side > .quire-entry__image-wrap > .quire-entry__image').removeClass('menu_open');
		menu.setAttribute('aria-expanded', 'false');
	} else {
    $('.side-by-side > .quire-entry__image-wrap > .quire-entry__image').addClass('menu_open');
    menu.setAttribute('aria-expanded', 'true');
  }
};

/**
 * globalSetup
 * @description Initial setup on first page load.
 */
function globalSetup() {
	let container = document.getElementById("container");
	container.classList.remove("no-js");
}

globalSetup();
