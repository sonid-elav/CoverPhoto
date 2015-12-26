(function(w) {
	
	var Vue = w.Vue,
		Class = w.Class,
		Request = w.Request,
		Drag = w.Drag;

		// Dependencies
		if(!Vue) throw new Error('Vue is missing!');
		if(!Class) throw new Error('mooTools is missing!');
		if(!Drag) throw new Error('mooTools more is missing!');


		// Private Section

		function vueReadyHook() {
			var vue = this;
			var rootEl = vue.$el;
			var coverImgEl = rootEl.getElement('img.cover-photo');
			var coverRelative = rootEl.getElement('.cover-photo-relative');
			var coverButtons = rootEl.getElement('.cover-photo-buttons');
			var coverDrag;
			
			// Root Element Calculations
			var height = this.coverHeight,
				width = rootEl.getSize().x;

			rootEl.setStyles({
				'height': height,
				'position': 'relative'
			});

			coverRelative
				.setStyle('height', rootEl.getSize().y)
				.setStyle('width', width);

			// On Window Resize
			w.addEvent('resize', function(e) {
				coverRelative.setStyle('width', rootEl.getSize().x);
				coverRelative.setStyle('height', rootEl.getSize().y);

				// Cover calcs
				var height_limit = rootEl.getSize().y - coverImgEl.getSize().y;
				if(height_limit - vue.cover_position.y < 0) {

					overDrag = new Drag(coverImgEl, {
						style: true,
						limit: {
							x: [0, 0],
							y: [height_limit, 0]
						},
						onComplete: function(el) {
							vue.$set('cover_position', el.getPosition());
							vue.$set('canSave', true);
						}
					});

					coverImgEl.setStyles({
						'left' : vue.cover_position.x,
						'top' : vue.cover_position.y
					});

				} else {
					coverImgEl.setStyles({
						'top': height_limit / 2
					});
				}
			});

			

			// Initialize IMG Element and Lazy Load
			coverImgEl
				.set('tween',{ duration: 'long' })
				.fade('hide')
				.addEvent('load', function(e) { // On Image Load Event

					var height_limit = rootEl.getSize().y - this.getSize().y;
					if(height_limit < 0) {

						coverDrag = new Drag(coverImgEl, {
							style: true,
							limit: {
								x: [0, 0],
								y: [height_limit, 0]
							},
							onComplete: function(el) {
								vue.$set('cover_position', el.getPosition());
								vue.$set('canSave', true);
							}
						});

						this.setStyles({
							'left' : vue.cover_position.x,
							'top' : vue.cover_position.y
						});

					} else {

						this.setStyles({
							'top': height_limit / 2
						});

					}

					this.fade(0.7);
				});

				// Load Position
				vue.loadPosition();

		} // end of ready


		function registerVue(classRef) {
			return new Vue({
				el: classRef.options.element,
				template: '#cover-photo-template',
				props: {
					'coverSrc' : String,
					'coverHeight': String,
					'canEdit' : Boolean,
					'editCover': Boolean,
					'showEdit' : Boolean,
					'canSave': Boolean
				},
				data: function() {
					return {
						'cover_position': classRef.options.cover_position || { 'x' : 0, 'y' : 0 },
						'upload_url': classRef.options.uploadUrl || "upload.php",
						'uploaded': true
					}
				},
				// Hooks
				ready: vueReadyHook,
				methods: {
					mouseover: function() {
						if(!this.showEdit && this.canEdit) {
							this.$set('showEdit', true);
						}
					},
					mouseleave: function() {
						if(this.showEdit && this.canEdit) {
							this.$set('showEdit', false);
						}
					},
					coverEdit: function() {
						this.$set('editCover', true);
					},
					cancelCover: function() {
						this.$set('editCover', false);
						this.loadPosition();
					},
					savePosition: function() {
						var cover_pos = JSON.stringify(this.cover_position);
						sessionStorage.setItem('cover_position', cover_pos);

						var img = this.$el.getElement('img.cover-photo');
						//var url = img.get('src');
						//sessionStorage.setItem('cover_url', url);
						if(!this.uploaded) {
							this.uploadSave();
						}
						this.$set('canSave', false);
						this.$set('editCover', false);
					},
					loadPosition: function() {
						var img = this.$el.getElement('img.cover-photo');
						var json_str = sessionStorage.getItem('cover_position'),
							url = sessionStorage.getItem('cover_url'),
							cover_pos=null;

						if(json_str) {
							cover_pos = JSON.parse(json_str);
							if(cover_pos) {
								this.$set('cover_position', cover_pos);
							}
						}

						if(url) {
							img.fade('out').set('src', url);
						} else {
							img.fade('out').set('src', this.coverSrc);
						}
					},
					selectFile: function(event) {
						var e = new Event(event);
						e.stop();

						var uploadFile = this.$el.getElement('#upload_cover');
						uploadFile.click();
					},
					uploadSave: function() {
						var vue = this;
						var photoWrapper = vue.$el.getElement('.cover-photo-wrapper');
						var img = vue.$el.getElement('img.cover-photo');
						var uploadFile = vue.$el.getElement('#upload_cover');
						var form = photoWrapper.getElement('#upload_form');

						var upframe = new Element('iframe', {
							'id': 'up_photo',
							'src': null,
							'name':'up_photo',
							'styles': { 'display': 'none' },
							'events': {
								'load' : function() { // On Upload Complete
									upframeDocument = upframe.contentDocument || upframe.contentWindow.document;
									if(upframeDocument.body.innerHTML.length) {
										var divJson = upframeDocument.getElementsByTagName('div');
										var json = JSON.parse(divJson[0].outerText);
										if(json.status == 'uploaded') {
											//photoWrapper.removeClass('loading');
											//img.set('src', json.url);
											sessionStorage.setItem('cover_url', json.url);
											vue.$set('uploaded', true);
										}
										//console.log('JSON:', json);
										upframe.dispose();
									}
								}
							}
						});
						upframe.inject(w.document.body);

						form.set('target','up_photo');
						form.addEvent('submit', function(e) {
							//photoWrapper.addClass('loading');
							//img.fade('out');
							//vue.$set('cover_position', { 'x' : 0, 'y' : 0 });
						});

						form.getElement('button[type=submit]').click();
					},
					uploadFile: function(event) {

						var vue = this;
						var photoWrapper = vue.$el.getElement('.cover-photo-wrapper');
						var img = vue.$el.getElement('img.cover-photo');
						var uploadFile = vue.$el.getElement('#upload_cover');
						var form = photoWrapper.getElement('#upload_form');

						var oFReader = new FileReader();
						if(oFReader) {
							oFReader.onload = function(oFREvent) {
								// 'image src = oFREvent.target.result; '
								setTimeout(function() {
									photoWrapper.removeClass('loading');
									vue.$set('cover_position', { 'x' : 0, 'y' : 0 });
									img.set('src', oFREvent.target.result);
								}, 1000);
							};

							if(uploadFile.files.length) {
								var oFile = uploadFile.files[0];
								photoWrapper.addClass('loading');
								img.fade('out');

								oFReader.readAsDataURL(oFile);
								vue.$set('canSave', true);
								vue.$set('uploaded', false);
							}
						}
					}
				} // End Of Methods
			}); // End of Vue
		}


		// Export
		var lfk = w.lfk || {};
			w.lfk = lfk;


		lfk['CoverPhoto'] = new Class({
			Implements: [ Options ],
			options: {
				element: null,
				cover_position: { 'x' : 0, 'y' : 0 },
				uploadUrl: 'upload.php'
			},
			initialize: function(options) {
				var self = this;

				this.setOptions(options);

				self.vue = registerVue(self);
			}
		});

})(this);