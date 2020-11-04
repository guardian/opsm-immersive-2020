// if you want to import a module from shared/js then you can
// just do e.g. import Scatter from "shared/js/scatter.js"

import settings from 'shared/data/settings'
import { Preflight } from 'shared/js/preflight'
// import { Frontline } from 'shared/js/frontline'
import { $, $$, round, numberWithCommas, wait, getDimensions } from 'shared/js/util'

import MainHtml from 'shared/templates/main.html';
import {gsap, Sine} from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger'

import React from "react"
import ReactDOM from 'react-dom';
import SocialBar from 'shared/js/SocialShareIcons';

import Ractive from 'ractive';

import Shaka from 'shaka-player';

// import csv from 'csv-parser';

// import $ from 'webpack-zepto';
// require 'zepto.js';

gsap.registerPlugin(ScrollTrigger);

function scrollwatch(rac) {

	$$('.fix-on-view').forEach((target)=>{
		const vid = target.querySelector('.fix');
		const st = ScrollTrigger.create({
			trigger: target,
			// start: 'top -4rem',
			start: 'top top',
			//   pin: true,
			//   pin: '.fix-on-view .fix',
			//   pinType: 'fixed',
			//   markers: true,
			onEnter: e => {
			//   console.log(e.trigger.className);
			  vid.classList.add('pin');
			},
			  onLeaveBack: e => {
				// console.log('leave back ', e.trigger.className)
				vid.classList.remove('pin');
			  }
		  ,
			  onEnterBack: e => {
				// console.log('ENTER back ', e.trigger.className)
				vid.classList.add('pin');
			  }
			  ,
			  onLeave: e => {
				// console.log('LEAVE ', e.trigger.className)
				vid.classList.remove('pin');
			},
			// scrub: 0.2,
			// animation: gsap.to('.chapter-1 .article-1 ', {backgroundPosition: "65% 50%", ease: Sine.easeInOut, force3D: true})
	
			  
		  });	
	});



	$$('.scroll-play').forEach((target)=>{
		const vid = target;
		const st = ScrollTrigger.create({
			trigger: target,
			start: 'top 50%',
			//   markers: true,
			onEnter: e => {
				vid.play();
			},
			onLeaveBack: e => {
				vid.pause();
			},
			onEnterBack: e => {
				vid.play();
			},
			onLeave: e => {
				vid.pause();
			},
		  });	
	});
	$$('section h2').forEach((target)=>{
		const st = ScrollTrigger.create({
			trigger: target,
			start: 'top 100%',
			scrub: 0.2,
			animation: gsap.from(target, {scale: 1.2})
			// animation: gsap.from(target.querySelectorAll('p'), {alpha: 0, y: 20, stagger: 0.2})
		  });	
	});
	$$('.block-1 p, .outro p').forEach((target)=>{
		const st = ScrollTrigger.create({
			trigger: target,
			start: 'top 100%',
			end: 'bottom 50%',
			scrub: 0.2,
			animation: gsap.from(target, {alpha: 0, y: 200})
		  });	
	});	
	
	// $$('.shaka').forEach((target)=>{
	// 	const vid = rac.get(`videos.${target.id}`);
	// 	const st = ScrollTrigger.create({
	// 		trigger: target,
	// 		start: 'top 50%',
	// 		//   markers: true,
	// 		onEnter: e => {
	// 			rac.set(`videos.${target.id}.playing`, true);
	// 		},
	// 		onLeaveBack: e => {
	// 			rac.set(`videos.${target.id}.playing`, false);
	// 		},
	// 		onEnterBack: e => {
	// 			rac.set(`videos.${target.id}.playing`, true);
	// 		},
	// 		onLeave: e => {
	// 			rac.set(`videos.${target.id}.playing`, false);
	// 		},
	// 	  });	
	// });
	
}


var app = {

	init: (key) => {

		fetch(`https://interactive.guim.co.uk/docsdata/${key}.json?t=${new Date().getTime()}`).then(res => res.json())
			.then((data) => {

				const appSettings = new Preflight(data, key, settings);


				console.log(appSettings);
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
				// console.log(store);
				// window.store = store;
				Ractive.components.btnPlay = Ractive.extend({
					template: '#btnPlay',
					data: {
						playing: false
					},
					oninit: function() {

						this.key = this.get('key');

						this.on('videotoggle', function (e) {


							if (this.get('playing')) {
								this.vidEl.pause();
							} else {
								// this.set('playing', true);
								this.vidEl.play();
							}

		
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
						this.vidEl.addEventListener('play', () => {

							this.set('playing', true);
						});
						this.vidEl.addEventListener('pause', () => {
							this.set('playing', false);
						});
						this.observe('playing', function(nv, ov){
							// if (!this.vidEl) return;
							const activeKey = rac.get('active.key');
							// console.log('observer', nv, activeKey);
							if (nv) {
								// vidEl.play();
								if (activeKey && activeKey != key) {
									// pause any currently playing vids
									// console.log('-------pause');
									$(`#${activeKey}`).pause();
									// rac.set(`videos.${activeKey}.playing`, false);
								}								
								rac.set('active.key', this.key);
							} else {
								if (activeKey && activeKey == this.key) {
								// vidEl.pause();
									// console.log('------set false');
									rac.set('active.key', false);
								}
							}
						});
					},
				});

				Ractive.components.btnCaptions = Ractive.extend({
					template: '#btnCaptions',
					data: {
						active: false,
						disabled: false
					},
					oninit: function() {
						this.key = this.get('key');
						this.on('toggle', function() {
							this.set('active', !this.get('active'));
							if (this.tt) {
								if (this.get('active')) {
									this.tt.mode = 'showing';
								} else {
									this.tt.mode = 'disabled';
								}
							}
						});
					},
					onrender: function () {
						this.tt = $(`#${this.key}`).textTracks;
						
						if (this.tt.length) {
							this.tt = this.tt[0];
						} else {
							this.tt = false;
							this.set('disabled', true);
						}
					}					
				});
				Ractive.components.btnMute = Ractive.extend({
					template: '#btnMute',
					oninit: function() {
						this.key = this.get('key');
						this.observe('muted', function(nv, ov){
							if (this.vidEl) this.vidEl.muted = nv
						});
						this.on('toggle', function() {
							rac.set('active.muted', !rac.get('active.muted'));
						});
					},
					onrender: function () {
						this.vidEl = $(`#${this.key}`);
					}
				});
				Ractive.components.ScrollNextButton = Ractive.extend({});

				const rac = new Ractive({
					target: '#app',
					template: MainHtml,
					data: store,
					'oncomplete': function() {
						gsap.from('#app', {alpha: 0, duration: 2, delay:2});
						gsap.set('#app', {alpha: 0});
						ReactDOM.render(<SocialBar 
							url={this.get('sheets.global[0].shareUrl')}
							title={this.get('sheets.global[0].shareTitle')}
						 />, document.getElementById('social'));
						 setTimeout(scrollwatch, 1500, this);

						// Promise.all(['#hero','#ch1bg','#ch2bg','#ch1outrobg','#ch2outrobg'].map((trg)=>{
						// 	console.log(trg);
						// 	const $trg = $(trg), prom = new Promise(r=> {
						// 		const fn = () => {
						// 			$trg.removeEventListener('canplaythrough', fn);
						// 			console.log('done', $trg.id);
						// 			r();
						// 		}
						// 		$trg.addEventListener('canplaythrough', fn);
						// 	});
						// 	return prom;
						// })).then(()=>{
						// 	console.log('done loading');
						// 	gsap.to('#app', {alpha: 1, duration: 2});
						// 	setTimeout(scrollwatch, 1500, this);
						// 	setupShaka(appSettings.settings);
						// });
							setupShaka(appSettings.settings);
						// const vid = $('#ch1a')
						// const svid = new Shaka.Player(vid);
						// svid.load('http://localhost:8000/assets/video/ch1_intterview1/master_pl.mpd');
						// const vid = $('#hero');
						// vid.addEventListener('progress', () => {
						// 	console.log(vid.buffered, vid.currentTime, vid.duration);
						// });
					}
				});

				function setupShaka(appSettings) {
					$$('video.shaka').forEach(video=>{
						const data = store.videos[video.id];
						console.log(data.key, data.file);

						if (appSettings.app.isApp) { // HLS videos fron embed folder of gdn-cdn

							console.log("Using the app")
					
							//console.log(`Android: ${appSettings.app.isAndroid}`)
					
							if (appSettings.app.Android) {
					
								console.log("Using Android")
					
								initShakaPlayer(video, `${appSettings.videopath}/${data.file}/master_pl.mpd`);
					
							} else {
					
								console.log(`Using iOS: ${appSettings.app.isIos}`)
					
								console.log(`iPhone: ${appSettings.app.isiPhone}`)
					
								console.log(`iPad: ${appSettings.app.isiPad}`)
					
								initHLSPlayer(video,`${appSettings.videopath}/${data.file}/master_pl.m3u8`)
					
							}
					
						} else {
					
							if (appSettings.app.isIos) {
					
								console.log(`Using iOS (not the app): ${appSettings.app.isIos}`)
					
								initHLSPlayer(video,`${appSettings.videopath}/${data.file}/master_pl.m3u8`)
					
							} else {
					
								if (Shaka.Player.isBrowserSupported()) {
					
									console.log("Using the Shaka player")
					
									initShakaPlayer(video, `${appSettings.videopath}/${data.file}/master_pl.mpd`);
					
								} else {  
					
									console.log("Using HLS video")
					
									initHLSPlayer(video, `${appSettings.videopath}/${data.file}/master_pl.m3u8`)
					
								} 
					
							}
					
						}
					});

				}

			})

	}

}

// app.init("1Z0BmZ-kxGMKZc8fXJIhBbVgBwFuw9B7jl1qfG8j39kk")
app.init("1g5nWwUcCiTrrgHPSHOQJd_4EoAxeQLpDbRiYU4n6IEs")
// https://interactive.guim.co.uk/docsdata/1g5nWwUcCiTrrgHPSHOQJd_4EoAxeQLpDbRiYU4n6IEs.json


function initHLSPlayer(video, manifest) {

	console.log("Using HLS video")

	video.setAttribute('src', manifest);

	video.load();

}

function initShakaPlayer(video, manifest) {

	var player = new Shaka.Player(video);

	player.load(manifest).then(function() {


	}).catch(function(error){

		console.log('Error code', error.code, 'object', error);

	});

}
