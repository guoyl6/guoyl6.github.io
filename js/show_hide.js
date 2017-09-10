+function() {
	$(function() {
		var toggle = function($target, whichType) {
			if (!$target.length || !(whichType in toggleHandler)) {
				return;
			}
			var state = $target.data('toggle.state.' + whichType) || 'show';
			var trasform = {
				state: [],
				icon: []
			};
			if (state == 'show') {
				toggleHandler[whichType].hide($target);
				$target.data('toggle.state.' + whichType, 'hide');
				trasform.state = ['show', 'hide'];

			} else {
				toggleHandler[whichType].show($target);
				$target.data('toggle.state.' + whichType, 'show');
				trasform.state = ['hide', 'show'];
			}
			return trasform;
		}
		var toggleHandler = {
			'slide': {
				show: function($target) {
					$target.slideDown();
				},
				hide: function($target) {
					$target.slideUp();
				},
				icon: {
					show: 'fa-toggle-up',
					hide: 'fa-toggle-down'
				}
			}
		}
		$("body").on('click', '.toggle_slide', function() {
			var $self = $(this),
				$next = $($self.data('target'));
			var transform = toggle($next, 'slide');

			transform && $self.removeClass(transform.state[0]).addClass(transform.state[1]);
			
		})
	})
}(jQuery);