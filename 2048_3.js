// website to run: http://gabrielecirulli.github.io/2048/

GameSolver = function() {
	this.loadjQuery();
	this.run = false;
	this.stop = false;
}

GameSolver.prototype.possibleGrids = function(grid){
	var possibles = [];
	for (var i=0; i<4; i++){
		for (var j=0; j<4; j++){
			if (grid[i][j] == null){
				var game_1 = this.copyGrid(grid);
				var game_2 = this.copyGrid(grid);
				game_1[i][j] = 2;
				game_2[i][j] = 4;
				possibles.push([game_1, 0.9]);
				possibles.push([game_2, 0.1]);
			}
		}
	}
	return possibles;
}

GameSolver.prototype.possibleMoves = function(grid_p){
	var moves = [];
	for (var i=0; i<4; i++){
		var grid = this.moveToSide(grid_p, i);
		if(!this.gridsAreEqual(grid_p, grid))
			moves.push([grid, i]);
	}
	return moves;
}

GameSolver.prototype.moveToSide = function(grid, side){
// 0: up, 1: right, 2: down, 3: left
	var new_grid = this.copyGrid(grid);
	var merged = [[false, false, false, false], [false, false, false, false], [false, false, false, false], [false, false, false, false]];
	switch (side){
		case 0:
			for (var i=0; i<4; i++) for (var j=1; j<4; j++) if(new_grid[i][j] != null) for (var k=j; k>0; k--) {
				if (new_grid[i][k-1] == null){
					new_grid[i][k-1] = new_grid[i][k];
					new_grid[i][k] = null;
					merged[i][k-1] = merged[i][k];
					merged[i][k] = false;
				}
				else if (new_grid[i][k-1] == new_grid[i][k] && merged[i][k] == false && merged[i][k-1] == false){
					merged[i][k-1] = true;
					new_grid[i][k-1] *= 2;
					new_grid[i][k] = null;
				}
				else break;
			}
			break;
		case 1:
			for (var j=0; j<4; j++) for (var i=2; i>=0; i--) if(new_grid[i][j] != null) for (var k=i; k<3; k++) {
				if (new_grid[k+1][j] == null){
					new_grid[k+1][j] = new_grid[k][j];
					new_grid[k][j] = null;
					merged[k+1][j] = merged[k][j];
					merged[k][j] = false;
				}
				else if (new_grid[k+1][j] == new_grid[k][j] && merged[k][j] == false && merged[k+1][j] == false){
					merged[k+1][j] = true;
					new_grid[k+1][j] *= 2;
					new_grid[k][j] = null;
				}
				else break;
			}
			break;
		case 2:
			for (var i=0; i<4; i++) for (var j=2; j>=0; j--) if(new_grid[i][j] != null) for (var k=j; k<3; k++) {
				if (new_grid[i][k+1] == null){
					new_grid[i][k+1] = new_grid[i][k];
					new_grid[i][k] = null;
					merged[i][k+1] = merged[i][k];
					merged[i][k] = false;
				}
				else if (new_grid[i][k+1] == new_grid[i][k] && merged[i][k] == false && merged[i][k+1] == false){
					merged[i][k+1] = true;
					new_grid[i][k+1] *= 2;
					new_grid[i][k] = null;
				}
				else break;
			}
			break;
		case 3:
			for (var j=0; j<4; j++) for (var i=1; i<4; i++) if(new_grid[i][j] != null) for (var k=i; k>0; k--) {
				if (new_grid[k-1][j] == null){
					new_grid[k-1][j] = new_grid[k][j];
					new_grid[k][j] = null;
					merged[k-1][j] = merged[k][j];
					merged[k][j] = false;
				}
				else if (new_grid[k-1][j] == new_grid[k][j] && merged[k][j] == false && merged[k-1][j] == false){
					merged[k-1][j] = true;
					new_grid[k-1][j] *= 2;
					new_grid[k][j] = null;
				}
				else break;
			}
			break;
	}
	return new_grid;
}

GameSolver.prototype.minimax = function(grid, depth, maxPlayer){
	if (depth == 0)
		return this.heuristic(grid);
	if (this.gridIsTerminal(grid))
		return -100000000000000;
	if (maxPlayer){
		var children = this.possibleMoves(grid);
		var alpha = Number.NEGATIVE_INFINITY;
		for (var i in children){
			alpha = Math.max(alpha, this.minimax(children[i][0], depth-1, false));
		}
		return alpha;
	}
	else {
		var children = this.possibleGrids(grid);
		var acc = 0;
		for (var i in children){
			acc += children[i][1] * this.minimax(children[i][0], depth-1, true);
		}
		return 2*acc/children.length;
	}
}

GameSolver.prototype.nextMove = function(_grid){
	var grid = this.convertGridFromOriginal(_grid);
	if (this.gridIsTerminal(grid)) return null;
	var alpha = Number.NEGATIVE_INFINITY;
	var move = null;
	var moves = this.possibleMoves(grid);
	var empty_tiles = 1;
	for (var i=0; i<4; i++) for (var j=0; j<4; j++) if (grid[i][j] == null) empty_tiles++;
	for (var i=0; i<moves.length; i++){
		var value = this.minimax(moves[i][0], 4, false);
		if (value > alpha){
			alpha = value;
			move =moves[i][1];
		}
	}
	return move;
}

GameSolver.prototype.heuristic = function(grid){
	var points = 0;
	var vals = this.existingValues(grid);
	for (var i in vals) points -= 300*(2048/i) * vals[i]* vals[i];
	var merge_points =0;
	for (var i=0; i<4; i++) for (var j=0; j<4; j++) {
		if (grid[i][j] != null) {
			if(grid[i][j]<64) merge_points+= grid[i][j]*grid[i][j]/8;
			else if(grid[i][j]<128) merge_points += grid[i][j]*grid[i][j];
			else merge_points+= 2*grid[i][j]*grid[i][j];
		}	
	}
	points += 100*merge_points;
	points += 50*this.monotonicityPoints(grid);
	return points;
}

GameSolver.prototype.monotonicityPoints = function(grid){
	var points=0;
	for (var i=0; i<4; i++) {
		var last_found =null;
		for (var j=0; j<4;j++){
			if (grid[i][j]){
				if (last_found)
					if (last_found > grid[i][j]) points += 10*last_found*Math.abs(last_found - grid[i][j]);
				last_found = grid[i][j];
			}
			else {
				points += 5*last_found*last_found;
			}
		}
	}
	for (var j=0; j<4; j++) {
		var last_found =null;
		if(j==3) for (var i=0; i<4;i++){
			if (grid[i][j]){
				if (last_found)
					if (last_found > grid[i][j]) points += 2*last_found*Math.abs(last_found - grid[i][j]);
				last_found = grid[i][j];
			}
			else {
				points += last_found*last_found;
			}
		}
		else for (var i=3; i>=0;i--){
			if (grid[i][j]){
				if (last_found)
					if (last_found > grid[i][j]) points += 2*last_found*Math.abs(last_found - grid[i][j]);
				last_found = grid[i][j];
			}
			else {
				points += last_found*last_found;
			}
		}
	}
	return -points;
}

GameSolver.prototype.existingValues = function(grid){
	var vals = {};
	for (var i = 0; i < 4; i++) {
		for (var j = 0; j < 4; j++) {
			if (grid[i][j]) {
				if (vals[grid[i][j]]) vals[grid[i][j]]++;
				else vals[grid[i][j]] = 1;
			}
		}
	}
	return vals;
}

GameSolver.prototype.gridIsTerminal = function (grid) {
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
		if(grid[i][j] == null) return false;
    }
  }
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
		if(i>0 && grid[i][j] == grid[i-1][j]) return false;
		if(i<3 && grid[i][j] == grid[i+1][j]) return false;
		if(j>0 && grid[i][j] == grid[i][j-1]) return false;
		if(j<3 && grid[i][j] == grid[i][j+1]) return false;
    }
  }
  
  return true;
};

GameSolver.prototype.gridsAreEqual = function(grid_1, grid_2){
	for (var i=0; i<4; i++)
		for (var j=0; j<4; j++)
			if ((grid_1[i][j]==null && grid_2[i][j]!=null) || (grid_2[i][j]==null && grid_1[i][j]!=null) || (grid_1[i][j]!=null && grid_2[i][j]!=null && grid_1[i][j]!=grid_2[i][j]))
				return false
	return true;
}

GameSolver.prototype.copyGrid = function(grid){
	var new_grid = [];
	for (var i=0; i<4; i++) new_grid.push(grid[i].slice());
	return new_grid;
}

GameSolver.prototype.convertGridFromOriginal = function(grid){
	var new_grid = [];
	for (var i=0; i<4; i++){
		new_grid.push([]);
		for (var j=0; j<4; j++){
			if (grid[i][j] == null)
				new_grid[i].push(null);
			else
				new_grid[i].push(grid[i][j].value);
		}
	}
	return new_grid;
}

GameSolver.prototype.loadjQuery = function(){
	var s=document.createElement('script');
	s.setAttribute('src','https://code.jquery.com/jquery-2.1.1.min.js');
	s.setAttribute('type','text/javascript');
	document.getElementsByTagName('head')[0].appendChild(s);
}

window.requestAnimationFrame(function () {
	window.gameManager = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
	window.gameSolver = new GameSolver();	gameManager.keepPlaying = true;
	var a= function(){
		if (gameSolver.run) gameManager.move(gameSolver.nextMove(gameManager.grid.cells));
		if (gameManager)
		setTimeout(a, 20);	
	};
	setTimeout(a, 1);
	gameSolver.run = true;
});

