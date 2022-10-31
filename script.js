let game_started = false;
let game_over = false;
let mines_count = 0;

// make a n*n 2d array full of 0s
const make_grid = n => {
    const grid = Array(n);
    for (let i = 0; i < n; ++i)
        grid[i] = Array(n).fill(0);
    return grid;
}

const minefield = make_grid(8);

// TODO: add 3 buttons, one for beginner, intermediate, and expert grids

// the first clicked cell cannot be a mine, the
// last 2 args are its row and column indices
const plant_mines = (minefield, num_mines, invalid_r , invalid_c) => {
    let rows_num = minefield.length;
    let mines_planted = 0;

    while (mines_planted < num_mines)
    {
        let r = Math.floor(Math.random() * rows_num);
        let c = Math.floor(Math.random() * rows_num);
        if (minefield[r][c]===1 || (r === invalid_r && c === invalid_c)) 
            continue;
        minefield[r][c] = 1;
        mines_planted++;
    }
    mines_count = num_mines;
}

const fill_html_grid = (n) => {
    gameboard = document.getElementById('grid');

    for (let row = 0; row < n; row++)
    {
        for (let col = 0; col < n; col++)
        {
            let cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('id', 'c' + row + col);
            // cell.style.backgroundColor = 'lightgrey';
            gameboard.appendChild(cell);
        }
    }
}

fill_html_grid(8);

let player = 'X'; // 1 is 'X', 2 is 'O'

// is this element in the 'cell' class?
const is_cell = elem => elem.classList.contains('cell');

const is_opened = elem => elem.classList.contains('opened');
const is_unopened = elem => !is_opened(elem);

const end_game = () => {
    game_over = true;
    alert(player + " won!");
}

const change_turn = () => {
    switch(player)
    {
        case 'X': {
            player = 'O';
            break;
        }
        case 'O': {
            player = 'X';
            break;
        }
        default: alert("change_turn(): player isn't 'X' or 'O'");
    }
}

const is_game_won = () => {
    // return false;

    let num_flagged_mines = 0;
    let num_opened_cells_without_mines = 0;

    // are all cells without mines opened?
    for (let r = 0; r < minefield.length; ++r)
    {
        for (let c = 0; c < minefield.length; ++c)
        {
            const cell = document.getElementById('c' + '' + r + '' + c);
            if (minefield[r][c] === 0 && is_opened(cell))
                num_opened_cells_without_mines++;
        }
    }
    // are all cells with mines flagged?
    for (let r = 0; r < minefield.length; ++r)
    {
        for (let c = 0; c < minefield.length; ++c)
        {
            const cell = document.getElementById('c' + '' + r + '' + c);
            if (minefield[r][c] === 1 && !is_opened(cell) && is_flagged(cell))
                num_flagged_mines++;
        }
    }
    if (num_flagged_mines === 10 && num_opened_cells_without_mines === 8*8-10)
        return true;
    return false;
}

const is_mine = (r, c) => minefield[r][c] === 1;

const count_adjacent_mines = (r, c) => {
    let count = 0;
    r = parseInt(r);
    c = parseInt(c);
    // check above
    if (r >= 1) {
        // straight above
        if (is_mine(r-1, c)) ++count;
        // top left
        if (c >= 1) {
            if (is_mine(r-1, c-1)) ++count;
        }
        // top right
        if (c <= minefield.length-2) {
            if (is_mine(r-1, c+1)) ++count;
        }
    }
    // below
    if (r <= minefield.length-2) {
        // straight below
        if (is_mine(r+1, c)) ++count;
        // bottom left
        if (c >= 1) {
            if (is_mine(r+1, c-1)) ++count;
        }
        // bottom right
        if (c <= minefield.length-2 && is_mine(r+1, c+1)) ++count;
    }
    // right
    if (c <= minefield.length-2 && is_mine(r, c+1))
        ++count;
    // left
    if (c >= 1 && is_mine(r, c-1))
        ++count;
    return count;
}

const open_cell = (i,j) => {
    // const i = parseInt(cell.id[1]);
    // const j = parseInt(cell.id[2]);
    const cell = document.getElementById('c' + i + '' + j);
    if (is_opened(cell)) return;
    // if a mine planted in this unopened cell, end game
    if (minefield[i][j] === 1) {
        
        cell.style.backgroundColor = 'darkred';
        // show all mines on their cells
        for (let r = 0; r < minefield.length; ++r)
        {
            for (let c = 0; c < minefield.length; ++c)
            {
                if (minefield[r][c] === 1)
                {
                    cell_with_mine = document.getElementById('c' + r + '' + c);
                    cell_with_mine.innerHTML = '💣'
                }
                    
            }
        }
        // end game
        game_over = true;
    }

    if (minefield[i][j] === 0) {
        // count mines in adjacent cells
        const num_adjacent_mines = count_adjacent_mines(i, j);
        // show the count on this cell
        if (num_adjacent_mines >= 1)
            cell.innerHTML = ''+num_adjacent_mines;
        
        cell.classList.add('opened');
        // if the count is 0, click every adjacent cell clockwise
        if (num_adjacent_mines === 0) {
            open_cells_around_opened_cell(cell);
        }
    }
}

const plant_flag = cell => {
    cell.innerHTML = '🚩';
    --mines_count;
    const mine_count_elem = document.getElementById('mine_count');
    mine_count_elem.innerHTML = parseInt(mine_count_elem.innerHTML)-1;
}

const open_cells_around_opened_cell = cell => {
    const r = parseInt(cell.id[1]);
    const c = parseInt(cell.id[2]);
    // above
    if (r > 0)
        open_cell(r-1, c);
    // top right
    if (r > 0 && c < minefield.length-1)
        open_cell(r-1, c+1);
    // right
    if (c < minefield.length-1)
        open_cell(r, c+1);
    // bottom right
    if (r < minefield.length-1 && c < minefield.length-1)
        open_cell(r+1, c+1);
    // bottom
    if (r < minefield.length-1)
        open_cell(r+1, c);
    // bottom left
    if (r < minefield.length-1 && c > 0)
        open_cell(r+1, c-1);
    // left
    if (c > 0)
        open_cell(r, c-1);
    // top left
    if (r > 0 && c > 0)
        open_cell(r-1, c-1);
}

// left click opens, right flags, middle opens adjacent cells with adjacent bombs
const mouse_button_click_handler = () => {

}

const handle_mouse_click = event => {
    console.log(event.button);

    if (game_over || is_cell(event.target) == false)
        return;
    
    const cell = event.target;
    const i = parseInt(cell.id[1]);
    const j = parseInt(cell.id[2]);

    if (!game_started) { // move to a game_start() function?
        //TODO: generalize num mines, 2nd arg in this call below
        plant_mines(minefield, 10, i, j);
        game_started = true;
    }

    // when right clicking
    // if cell is opened and all adjacent cells are opened or flagged
    
    
    // check if clicked cell is opened, in which case return
    if (is_opened(cell)) return;

    open_cell(i,j);
    
    if (!game_over && is_game_won()) {
        alert('YOU WON')
        // 0.1 second delay to let the css change in this function take effect
        // before the alert pops up and freezes code execution (at least on my pc)
        // setTimeout(() => {
        //     end_game();
        // }, "100")
    }
    // else
        // change_turn();
}

addEventListener('click', handle_mouse_click);

// right click
addEventListener('contextmenu', (e) => {
    if (is_cell(e.target))
    // console.log('e.button:',e.button)
        e.preventDefault();
});

// generate_mines(0,0);

const is_mouse_hovering = elem => elem.classList.contains('mouse-hovering');

addEventListener('mouseover', (event) => {
    if (!is_cell(event.target)) return;

    const cell = event.target;

    if (is_unopened(cell))
        cell.classList.add('mouse-hovering');
    // const r = cell.id[1];
    // const c = cell.id[2];
});

addEventListener('mouseout', (event) =>{
    if (!is_cell(event.target)) return;

    const cell = event.target;

    if (is_mouse_hovering(cell))
        cell.classList.remove('mouse-hovering');
    if (cell.classList.contains('mousedown'))
    cell.classList.remove('mousedown');
});

const is_flagged = cell => cell.innerHTML === '🚩';

const remove_flag = cell => {
    cell.innerHTML = '';
    const mine_count_elem = document.getElementById('mine_count');
    mine_count_elem.innerHTML = parseInt(mine_count_elem.innerHTML) + 1;
}

addEventListener('mousedown', (event) => {
    if (!is_cell(event.target)) return;

    const cell = event.target;
    cell.classList.add('mousedown');

    if (!game_started || game_over) return;

    console.log('mousedown:',event.button);


    if (event.button === 2) {
        console.log('im here');
        event.preventDefault();

    
        // plant flag if cell is unopened
        if (is_unopened(cell))
            if (is_flagged(cell))
                remove_flag(cell);
            else
                plant_flag(cell);
    }

    // if (is_unopened(cell))
    
});

addEventListener('mouseup', (event) => {
    if (!is_cell(event.target)) return;
    console.log('mouseup:',event.button);
    const cell = event.target;
    if (cell.classList.contains('mousedown'))
        cell.classList.remove('mousedown');
});