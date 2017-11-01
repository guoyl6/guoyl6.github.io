function randomItems(arr, nums) {
	var rs = [];
	var pickData = arr.map(function(value, index) {
		return index;
	});
	if (nums >= pickData.length) {
		return pickData;
	}
	while (nums-- > 0) {
		rs.push(
			pickData.splice(Math.floor(Math.random() * pickData.length), 1)[0]
		)
	}
	return rs;
}

function SaoLei(width, height, LeiShu) {
	this.init(width, height, LeiShu);
}

SaoLei.prototype.init = function(width, height, LeiShu) {
	var self = this;
	self.died = false;
	self.win = false;
	self.area = [];
	self.state = [];
	self.width = width;
	self.height = height;
	self.LeiShu = LeiShu;
	self.rest = self.width * self.height;
	self.correctTag = 0;
	
	self.fresh();

}

SaoLei.prototype.fresh = function() {
	var self = this;
	self.rest = self.width * self.height;
	self.correctTag = 0;
	self.died = false;
	self.win = false;
	for (var i = self.width * self.height; i--;) {
		self.area[i] = SaoLei.EMPTY;
		self.state[i] = SaoLei.STATE.HIDDEN;
	}
	var LeiIndexes = randomItems(self.area, self.LeiShu);
	LeiIndexes.forEach(function(i) {
		self.area[i] = SaoLei.LEI;
	})

	LeiIndexes.forEach(function(i) {
		var y = parseInt(i / self.width),
			x = i % self.width;
		self.surroundIndexes(y, x, SaoLei.FILTER.notLei)
		.forEach(function(index) {
			self.area[index]++;
		})
	})
}

SaoLei.prototype.validIndex = function(y, x) {
	return 0 <= y && y < this.height && 0 <= x && x < this.width;
}

SaoLei.prototype.surroundIndexes = function(y, x, filter) {
	if (!this.validIndex(y, x)) {
		return [];
	}
	var rs = [], surrounds = [
		[-1, -1], [-1, 0], [-1, 1],
		[0, -1], [0, 0], [0, 1],
		[1, -1], [1, 0], [1, 1]
	];
	for (var i = 0; i < 9; i++) {
		var change = surrounds[i],
			n_y = y + change[0],
			n_x = x + change[1];
		if (this.validIndex(n_y, n_x)) {
			var index = n_y * this.width + n_x;
			if (filter && !filter.call(this, n_y, n_x, index, change)) {
				continue;
			}
			rs.push(index);
		}
	}
	return rs;
}

SaoLei.prototype.tic = function(y, x) {
	var self = this, index = y * this.width + x;
	if (!self.validIndex(y, x)
		|| self.state[index] == SaoLei.STATE.SHOWN || self.state[index] == SaoLei.STATE.TAG) {
		return;
	}
	self.state[index] = SaoLei.STATE.SHOWN;
	self.rest--;
	if (self.area[index] == SaoLei.LEI) {
		self.died = true;
	} else if (self.area[index] == SaoLei.EMPTY) {
		self
		.surroundIndexes(y, x, function(n_y, n_x, index, change) {
			return SaoLei.FILTER.notLei.apply(this, arguments)
			&& Math.abs(change[0]) + Math.abs(change[1]) == 1
			&& this.state[index] == SaoLei.STATE.HIDDEN;
		})
		.forEach(function(index) {
			var n_y = parseInt(index / self.width),
				n_x = index % self.width;
			self.tic(n_y, n_x);
		});
	}
	self.freshWinState();
}

SaoLei.prototype.toggleTag = function(y, x) {
	var self = this, index = y * this.width + x;
	if (!self.validIndex(y, x) || self.state[index] == SaoLei.STATE.SHOWN) {
		return;
	}
	self.state[index] = self.state[index] == SaoLei.STATE.TAG ? SaoLei.STATE.HIDDEN : SaoLei.STATE.TAG;
	if (self.state[index] == SaoLei.STATE.TAG && self.area[index] == SaoLei.LEI) {
		self.correctTag++;
	} else if (self.area[index] == SaoLei.LEI) {
		self.correctTag--;
	}
	self.freshWinState();
}

SaoLei.prototype.confirm = function(y, x) {
	// -1: 非法操作
	// 0: 失败操作 --> 未标记出所有雷
	// 1: 操作成功
	var self = this, index = y * this.width + x;
	if (!self.validIndex(y, x) || self.state[index] != SaoLei.STATE.SHOWN
		|| self.area[index] == SaoLei.EMPTY || self.area[index] == SaoLei.LEI) {
		return -1;
	}
	
	if (self.surroundIndexes(y, x, SaoLei.FILTER.isTag).length != self.area[index]) {
		return 0;
	}
	self.surroundIndexes(y, x, SaoLei.FILTER.isHidden)
	.forEach(function(index) {
		var n_y = parseInt(index / self.width),
			n_x = index % self.width;
		self.tic(n_y, n_x);
	})
	return 1;
}

SaoLei.prototype.showAll = function() {
	var self = this;
	for (var i = self.state.length; i--;) {
		if (self.area[i] == SaoLei.LEI) {
			self.state[i] = self.win ? SaoLei.STATE.TAG : SaoLei.STATE.SHOWN;
		} else if (self.state[i] == SaoLei.STATE.HIDDEN) {
			self.state[i] = SaoLei.STATE.SHOWN;
		} else if (self.state[i] == SaoLei.STATE.TAG && self.area[i] != SaoLei.LEI) {
			self.state[i] = SaoLei.STATE.TAGERROR;
		}
	}
}

SaoLei.prototype.freshWinState = function() {
	var self = this;
	if (self.correctTag == self.LeiShu || self.rest == self.LeiShu) {
		self.win = true;
	} else {
		self.win = false;
	}

}

SaoLei.STATE = {
	HIDDEN: 'hidden',
	SHOWN: 'shown',
	TAG: 'tag',
	TAGCORRECT: 'tag correct',
	TAGERROR: 'tag wrong'
};

SaoLei.FILTER = {
	notLei: function(n_y, n_x, index, change) {
		return this.area[index] != SaoLei.LEI;
	},
	isTag: function(n_y, n_x, index, change) {
		return this.state[index] == SaoLei.STATE.TAG;
	},
	isHidden: function(n_y, n_x, index, change) {
		return this.state[index] == SaoLei.STATE.HIDDEN;
	}
}

SaoLei.EMPTY = 0;
SaoLei.LEI = -1;


// view

$(function() {
	var obj = new SaoLei(10, 10, 10);
	var $area = $("#area"),
		$controller = $("#controller"),
		$row = $("#row"),
		$column = $("#column"),
		$leiShu = $("#lei-shu");

	function render_saolei($area, obj) {
		$area.empty().append(
			obj.area.map(function(value, index) {
				return $("<div></div>").addClass(['item', obj.state[index]].join(' '));
			})
		).width(obj.width * $area.children().outerWidth()).height(obj.height * $area.children().outerHeight());
	}
	function fresh_saolei($area, obj) {
		if (obj.win || obj.died) {
			obj.showAll();
			setTimeout($area.trigger.bind($area), 30, obj.win ? 'game_win' : 'game_died')
		}
		$area.children('.item').each(function(index, dom) {
			var $dom = $(this);
			for (var key in SaoLei.STATE) {
				$dom.removeClass(SaoLei.STATE[key]);
			}
			$dom.addClass(obj.state[index]);
			if (obj.state[index] != SaoLei.STATE.HIDDEN && obj.state[index] != SaoLei.STATE.TAG) {
				if (obj.area[index] == SaoLei.LEI) {
					$dom.addClass('lei');
				} else if (obj.area[index] == SaoLei.EMPTY) {
					$dom.addClass('empty');
				} else {
					$dom.addClass('num').text(obj.area[index]);
				}
			}
		})
	}
	render_saolei($area, obj);
	$area
	.on('selectstart', false)
	.on('click', '.item.' + SaoLei.STATE.HIDDEN, function(e) {
		if (obj.win || obj.died) {
			return;
		}
		var i = $(this).index();
		var y = parseInt(i / obj.width),
			x = i % obj.width;
		obj.tic(y, x);
		fresh_saolei($area, obj);
	})
	.on('contextmenu', ['.item.' + SaoLei.STATE.HIDDEN, '.item.' + SaoLei.STATE.TAG].join(','), function(e) {
		e.preventDefault();
		if (obj.win || obj.died) {
			return;
		}
		var i = $(this).index();
		var y = parseInt(i / obj.width),
			x = i % obj.width;

		obj.toggleTag(y, x);
		fresh_saolei($area, obj);
		return false;
	})
	.on('click', '.item.' + SaoLei.STATE.SHOWN, function(e) {
		if (obj.win || obj.died) {
			return;
		}
		var i = $(this).index();
		var y = parseInt(i / obj.width),
			x = i % obj.width;

		if (obj.confirm(y, x) > 0) {
			fresh_saolei($area, obj);
		};
	})
	.on('game_win', function() {
		alert('你赢了！');
	})
	.on('game_died', function() {
		alert('你输了....')
	})


	$controller
	.on('click', '#restart', function() {
		obj.fresh();
		render_saolei($area, obj);
	})
	.on('change', '#row, #column, #lei-shu', function() {
		var height = parseFloat($row.val()),
			width = parseFloat($column.val()),
			LeiShu = parseFloat($leiShu.val());

		obj = new SaoLei(width, height, LeiShu);
		render_saolei($area, obj);
	})

})