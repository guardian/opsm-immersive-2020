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



	$$('.scroll-play,.shaka').forEach((target)=>{
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
						// console.log('com init');
						// this.on('click', function (e, key) {
						// 		console.log(key);
		
						// });
						this.key = this.get('key');

						this.on('videotoggle', function (e) {
							// console.log(this.get('key'));
							// console.log(rac.get('sheets.chapter1[0].heading'));
							// rac.set('active.playing',  true);
							// const key = this.key; //this.get('key');
							// const vid = rac.get(`videos.${key}`);
							// console.log(vid, this.vidEl);
							// const activeKey = rac.get('active.key');
							// if (activeKey && activeKey != key) {
							// 	// pause any currently playing vids
							// 	$(`#${activeKey}`).pause();
							// 	rac.set(`videos.${activeKey}.playing`, false);
							// }

							// const vidEl = this.vidEl; //$(`#${key}`);
							// if (vid.playing) {
							// 	vidEl.pause();
							// 	rac.set('active.key', false);
							// } else {
							// 	vidEl.play();
							// 	rac.set('active.key', key);
							// }
							// vid.playing = !vid.playing;
							// rac.set(`videos.${key}`, vid);
							// this.set('playing', vid.playing);

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
							// this.checkActive();
							// console.log('play', this.key)
							// rac.set(`videos.${this.key}.playing`, true);
							// rac.set(`active.key`, this.key);
							this.set('playing', true);
						});
						this.vidEl.addEventListener('pause', () => {
							// this.checkActive();
							// console.log('pause', this.key)
							// rac.set(`videos.${this.key}.playing`, false);
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
					// checkActive: function() {
					// 	const activeKey = rac.get('active.key');
					// 	// console.log('active', activeKey);
					// 	if (activeKey && activeKey != this.key) {
					// 		// pause any currently playing vids
					// 		$(`#${activeKey}`).pause();
					// 		rac.set(`videos.${activeKey}.playing`, false);
					// 		// rac.set(`active.key`, false);
					// 	}
					// }
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
						// gsap.set('#app', {alpha: 0});
						ReactDOM.render(<SocialBar 
							url={this.get('sheets.global[0].shareUrl')}
							title={this.get('sheets.global[0].shareTitle')}
						 />, document.getElementById('social'));
						 setTimeout(scrollwatch, 1500, this);
						// window.addEventListener('load', function() {
						// 	console.log('WINDOW on')
						// });
						// Promise.all(['#hero','#ch1bg','#ch2bg','#ch1outrobg','#ch2outrobg'].map((trg)=>{
						// 	const $trg = $(trg), prom = new Promise(r=> {
						// 		const fn = () => {
						// 			$trg.removeEventListener(fn);
						// 			r();
						// 		}
						// 		$trg.addEventListener('canplaythrough', fn);
						// 	});
						// 	return prom;
						// })).then(()=>{
						// 	console.log('done loading');
						// 	gsap.to('#app', {alpha: 1, duration: 2});

						// });
						// const vid = $('#ch1a')
						// const svid = new Shaka.Player(vid);
						// svid.load('http://localhost:8000/assets/video/ch1_intterview1/master_pl.mpd');
						setupShaka(appSettings.settings);
					}
				});

				function setupShaka(appSettings) {
					$$('video.shaka').forEach(video=>{
						const data = store.videos[video.id];
						console.log(data.key, data.file);

						// const video = $('#ch1a');
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
				// rac.on({
				// 	videotoggle: function (e, key) {
						
				// 			console.log(key);

				// 	}
				// 	, "bntPlay.videotoggle": function (e, key) {
						
				// 			console.log(key);

				// 	}
				// });


				// window.rac = rac;
				 
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
// console.log(ShareBar);
// ReactDOM.render(<SocialBar />, document.getElementById('footer'));
// ReactDOM.render(<Footer/>, document.getElementById('footer'));


function setPlayer(video, manifest) {

	var self = this

	var folder = (appSettings.portrait && manifest.hasSubtitles) ? 'squared' : 'standard' ;

	console.log(`${appSettings.videopath}/${folder}/hls/${manifest.src.trim()}/index.m3u8`)

	if (appSettings.app.isApp) { // HLS videos fron embed folder of gdn-cdn

		console.log("Using the app")

		//console.log(`Android: ${appSettings.app.isAndroid}`)

		if (appSettings.app.Android) {

			console.log("Using Android")

			this.initShakaPlayer(video, `${appSettings.videopath}/${folder}/dash/${manifest.src.trim()}-manifest.mpd`);

		} else {

			console.log(`Using iOS: ${appSettings.app.isIos}`)

			console.log(`iPhone: ${appSettings.app.isiPhone}`)

			console.log(`iPad: ${appSettings.app.isiPad}`)

			this.initHLSPlayer(video, manifest, folder)

		}

	} else {

		if (appSettings.app.isIos) {

			console.log(`Using iOS (not the app): ${appSettings.app.isIos}`)

			this.initHLSPlayer(video, manifest, folder)

		} else {

			if (Shaka.Player.isBrowserSupported()) {

				console.log("Using the Shaka player")

				this.initShakaPlayer(video, `${appSettings.videopath}/${folder}/dash/${manifest.src.trim()}-manifest.mpd`);

			} else {  

				console.log("Using HLS video")

				this.initHLSPlayer(video, manifest, folder)

			} 

		}

	}

}

function initHLSPlayer(video, manifest, folder) {

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
