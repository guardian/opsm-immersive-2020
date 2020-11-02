// if you want to import a module from shared/js then you can
// just do e.g. import Scatter from "shared/js/scatter.js"

import settings from 'shared/data/settings'
import { Preflight } from 'shared/js/preflight'
import { Frontline } from 'shared/js/frontline'
import { $, $$, round, numberWithCommas, wait, getDimensions } from 'shared/js/util'

import MainHtml from 'shared/templates/main.html';
import {gsap, Sine} from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger'

import React from "react"
import ReactDOM from 'react-dom';
import ShareBar from '../../../../shared/js/SocialShareIcons';

import Ractive from 'ractive';

import Shaka from 'shaka-player';

// import csv from 'csv-parser';

// import $ from 'webpack-zepto';
// require 'zepto.js';

gsap.registerPlugin(ScrollTrigger);

function setup() {

	gsap.from('#app', {alpha: 0, duration: 2});
	// const st = ScrollTrigger.create({
	// 	trigger: '.chapter-1 .article-1',
	// 	start: 'top 80%',
	// 	//   pin: true,
	// 	//   pinType: 'fixed',
	// 	//   markers: true,
	// 	onEnter: e => {
	// 	  console.log(e.trigger.className);
	// 	},
	// 	  onLeaveBack: e => {
	// 		console.log('leave back ', e.trigger.className)
	// 	  }
	//   ,
	// 	  onEnterBack: e => {
	// 		console.log('ENTER back ', e.trigger.className)
	// 	  }
	// 	  ,
	// 	  onLeave: e => {
	// 		console.log('LEAVE ', e.trigger.className)
		  
	// 	},
	// 	scrub: 0.2,
	// 	// animation: gsap.to('.chapter-1 .article-1 ', {backgroundPosition: "65% 50%", ease: Sine.easeInOut, force3D: true})

		  
	//   });
	
	  $$('.scroll-play-video').forEach(i => {
		  let vid = i.querySelector('video');
		//   vid.remove();
		//   vid = document.createElement('video');
		//   i.append(vid);
		//   vid.s
		  console.log('>>',i, vid);
		//   vid.src = '<%= path %>/video/loop1.mp4';
		const svid = new Shaka.Player(vid);
		svid.load('http://localhost:8000/assets/video/dash/loop.mpd');
		// svid.load('<%= path %>/video/dash/loop.mpd').then(() => {
			
		// });
		  
		vid.addEventListener('loadeddata', e => {
			console.log('state', vid.readyState);
			if (vid.readyState >= 2) {
				ScrollTrigger.create({
					trigger: i,
					start: 'top top',
					//   pin: true,
					//   pinType: 'fixed',
					  markers: true,
					onEnter: e => {
						// const vid = i.querySelector('video');
						// console.log('play', vid, vid.readyState);
					//   svid.play();
					vid.play();
					},
					  onLeaveBack: e => {
						vid.pause();
					  }
				  ,
					  onEnterBack: e => {
						vid.play();
					  }
					  ,
					  onLeave: e => {
						vid.pause();
					  
					},
					  
				  });				  
			}
		});

	  });
	//   const target = '.scroll-play-video';	
}

var app = {

	init: (key) => {

		fetch(`https://interactive.guim.co.uk/docsdata/${key}.json?t=${new Date().getTime()}`).then(res => res.json())
			.then((data) => {

				console.log(data);
				const videos = Object.assign(data.sheets.video);
				// const videos = 
				videos.forEach(i=>{
					videos[i.key] = i;
					videos[i.key].playing = false;
				});
				const store = Object.assign({}, data, {videos: videos}, {
					active: { 
						playing: false,
						muted: false,
						key: false
					} 
				} );
				console.log(store);
				window.store = store;
				Ractive.components.btnPlay = Ractive.extend({
					template: '#btnPlay',
					data: {
						playing: false
					},
					oninit: function() {
						// console.log('com init');
						// this.on('click', function (e, key) {
						// 		console.log(key);
		
						// });
						this.key = this.get('key');

						this.on('videotoggle', function (e) {
								console.log(this.get('key'));
								// console.log(rac.get('sheets.chapter1[0].heading'));
								// rac.set('active.playing',  true);
								const key = this.key; //this.get('key');
								const vid = rac.get(`videos.${key}`);
								// console.log(vid, this.vidEl);
								const activeKey = rac.get('active.key');
								if (activeKey && activeKey != key) {
									// pause any currently playing vids
									$(`#${activeKey}`).pause();
									rac.set(`videos.${activeKey}.playing`, false);
								}
								
								const vidEl = this.vidEl; //$(`#${key}`);
								if (vid.playing) {
									vidEl.pause();
									rac.set('active.key', false);
								} else {
									vidEl.play();
									rac.set('active.key', key);
								}
								vid.playing = !vid.playing;
								rac.set(`videos.${key}`, vid);
								// this.set('playing', vid.playing);

		
						});
					},
					onrender: function () {
						this.vidEl = $(`#${this.key}`);
						// console.log(this.key, this.vidEl);
						this.vidEl.addEventListener('ended', () => {
							rac.set(`videos.${this.key}.playing`, false);
							rac.set(`active.key`, false);
							// this.set('playing', false);
						});
					}
				});

				Ractive.components.btnCaptions = Ractive.extend({
					template: '#btnCaptions',
				});
				Ractive.components.btnMute = Ractive.extend({
					template: '#btnMute',
					oninit: function() {
						this.key = this.get('key');
						this.observe('muted', function(nv, ov){
							console.log('muted observer', this.get('muted'));
							this.vidEl = $(`#${this.key}`);
							if (nv === true) {
							}
							this.vidEl.muted = nv
						});
						this.on('toggle', function() {
							console.log(rac.get('active.muted'))
							rac.set('active.muted', !rac.get('active.muted'));
						});
					}
				});
				// Ractive.components.btnPlay.on({
				// 	videotoggle: function (e, key) {
						
				// 			console.log(key);

				// 	}
				// });
				// $('#app').innerHTML = MainHtml;
				const rac = new Ractive({
					target: '#app',
					template: MainHtml,
					data: store,
					'onrender': () => {
						// setup();
					}
					// 'videotoggle': function (e, key) {
					// 	console.log(key);
					// }
				});
				rac.on({
					videotoggle: function (e, key) {
						
							console.log(key);

					}
					, "bntPlay.videotoggle": function (e, key) {
						
							console.log(key);

					}
				});


				window.rac = rac;

				// var wrangle = new Preflight(data.sheets.videos, key, settings)

				// wrangle.process().then( (application) => {

				// 	new Frontline(application)

				// })
				 
			})

	}

}

// app.init("1Z0BmZ-kxGMKZc8fXJIhBbVgBwFuw9B7jl1qfG8j39kk")
app.init("1g5nWwUcCiTrrgHPSHOQJd_4EoAxeQLpDbRiYU4n6IEs")
// https://interactive.guim.co.uk/docsdata/1g5nWwUcCiTrrgHPSHOQJd_4EoAxeQLpDbRiYU4n6IEs.json

function Footer() {
	return (
		<h1>Hello footer</h1>
	);
}
ReactDOM.render(<ShareBar/>, document.getElementById('footer'));