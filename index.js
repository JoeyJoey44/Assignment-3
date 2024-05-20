const PAGE_SIZE = 12
let currentPage = 1;
let pokemons = []

const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty()

  if (currentPage > 1) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1" id="prevButton" value="${currentPage - 1}">Previous</button>
    `)
  }

  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(numPages, startPage + 4);
  startPage = Math.max(1, endPage - 4);

  for (let i = startPage; i <= endPage; i++) {
    if (i === currentPage) {
      $('#pagination').append(`
        <button class="btn btn-primary page ml-1 numberedButtons active" value="${i}">${i}</button>
      `)
    } else {
      $('#pagination').append(`
        <button class="btn btn-primary page ml-1 numberedButtons" value="${i}">${i}</button>
      `)
    }
  }

  if (currentPage < numPages) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1" id="nextButton" value="${currentPage + 1}">Next</button>
    `)
  }
}

const updatePokemonCount = (count) => {
  $('#pokemonCount').html(`Number of available Pokemons: ${count}`);
}

const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  $('#pokeCards').empty()
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url)
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>  
        `)
  })
  updatePokemonCount(pokemons.length);
}

const setupTypesFilter = async () => {
  const response = await axios.get('https://pokeapi.co/api/v2/type');
  const types = response.data.results;

  types.forEach((type) => {
    $('#filter').append(`
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${type.name}" id="${type.name}">
        <label class="form-check-label" for="${type.name}">
          ${type.name}
        </label>
      </div>
    `);
  });
}

const filterPokemonsByType = async () => {
  const checkedTypes = $('.form-check-input:checked').map(function() {
    return this.value;
  }).get();

  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  let allPokemons = response.data.results;

  if (checkedTypes.length > 0) {
    for (const type of checkedTypes) {
      const response = await axios.get(`https://pokeapi.co/api/v2/type/${type}`);
      const pokemonsOfType = response.data.pokemon.map(p => p.pokemon.name);
      allPokemons = allPokemons.filter(pokemon => pokemonsOfType.includes(pokemon.name));
    }
  }

  pokemons = allPokemons;
  paginate(currentPage, PAGE_SIZE, pokemons);
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
  updatePaginationDiv(currentPage, numPages);
  updatePokemonCount(pokemons.length);
}

const setup = async () => {
  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;

  paginate(currentPage, PAGE_SIZE, pokemons)
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages)
  updatePokemonCount(pokemons.length);

  setupTypesFilter();

  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    const types = res.data.types.map((type) => type.type.name)
    $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

  $('body').on('click', ".numberedButtons, #prevButton, #nextButton", async function (e) {
    currentPage = Number(e.target.value)
    paginate(currentPage, PAGE_SIZE, pokemons)

    updatePaginationDiv(currentPage, numPages)
  })

  $('body').on('change', '.form-check-input', filterPokemonsByType);
}

$(document).ready(setup)
