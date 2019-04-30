var items = function() {
  const stored = localStorage.getItem('items');

  if(stored === null || stored === ""){
    return [];
  }

  return JSON.parse(stored);
}();

var lastItem = function() {
  const stored = localStorage.getItem('lastItem');

  if(stored === null || stored === ""){
    return null;
  }

  return JSON.parse(stored);
}();

var sets = [];

function prepareItem(slot, name, traitOne, traitTwo) {
  const id = lastItem === null ? 0 : lastItem.id+1;
  return {
    id: id,
    name: name,
    slot: slot,
    traitOne: traitOne,
    traitTwo: traitTwo,
  };
}

function resetItems() {
  items = [];
  lastItem = [];
  localStorage.setItem('lastItem', null);
  localStorage.setItem('items', JSON.stringify([]));

  populateTables();
}

function addItem(item) {
  items.push(item);

  localStorage.setItem('items', JSON.stringify(items));
  localStorage.setItem('lastItem', JSON.stringify(item));
  lastItem = item;

  populateTables();
}

function deleteItemId(id) {
  items = items.filter(function(element) {
    return element.id !== id;
  });

  localStorage.setItem('items', items);

  populateTables();
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function refreshCombinationCheckerOptions(){
  const traitOnes = $.map(items, function(item) {
    return item.traitOne;
  })
  const traitTwos= $.map(items, function(item) {
    return item.traitTwo;
  })

  const traits = [...traitOnes, ...traitTwos].filter(onlyUnique);

  $.each(traits, function(_, trait) {
    $('#checkerTraitOne').append(`
      <option>${trait}</option>    
    `);
    $('#checkerTraitTwo').append(`
      <option>${trait}</option>    
    `);
    $('#checkerTraitThree').append(`
      <option>${trait}</option>    
    `);
  });
}

function checkCombinationOf(traits) {
  console.log("Traits to check: ");
  console.log(traits);

  generateSets();

  var matchingSets = sets.filter(function(set){
    var passing = true;

    $.each(traits, function(trait, amount) {
      passing = (set.traits[trait] >= amount);
      console.log(`(set[${trait}] = ${set.traits[trait]}) >= ${amount} (amount)  [[ ${passing} ]]`);

      if(!passing) { return false; }
    })

    return passing;
  })

  return matchingSets;
}

function generateSets() {
  console.log('Generating sets...');

  sets = [];

  const heads = items.filter(function(item) { return item.slot === 'head'; });
  const shoulders = items.filter(function(item) { return item.slot === 'shoulder'; });
  const chests = items.filter(function(item) { return item.slot === 'chest'; });

  console.log('items to match with sets');
  console.log(items);

  $.each(heads, function(_, head) {
    $.each(shoulders, function(_, shoulder) {
      $.each(chests, function(_, chest) {
        const traits = [head.traitOne, head.traitTwo, shoulder.traitOne, shoulder.traitTwo, chest.traitOne, chest.traitTwo];

        const traitSet = {};

        $.each(traits, function(_, trait) {
          traitSet[trait] = traitSet[trait] || 0;
          traitSet[trait]++;
        });

        sets.push({
          items: [head, shoulder, chest],
          traits: traitSet
        });
      })
    })
  });
  console.log(sets);
  refreshCombinationCheckerOptions();
}

function populateTables() {
  $('#chests-tbody').empty();
  $('#heads-tbody').empty();
  $('#shoulders-tbody').empty();

  items.filter(function(el) {
    $(`#${el.slot}s-tbody`).append(`
      <tr id="${el.slot}-${el.id}">
        <td>${el.id}</td>
        <td>${el.name}</td>
        <td>${el.traitOne}</td>
        <td>${el.traitTwo}</td>
        <td><a href="#" onclick="deleteItemId(${el.id}); return false;">delete</a></td>
      </tr>
    `);
  });

  generateSets();
}

$(document).ready(function(){
  populateTables()
});

$('#reset-items').on('click', resetItems);
$('#itemForm').on('submit', function(event) {
  event.preventDefault();

  const slot = $('#itemSlot').val();
  const name = $('#itemName').val();
  const traitOne = $('#traitOne').val();
  const traitTwo = $('#traitTwo').val();

  console.log(`Adding item. Slot: ${slot}, name: ${name}, traitOne: ${traitOne}, traitTwo: ${traitTwo}`);

  addItem(prepareItem(slot, name, traitOne, traitTwo));
});

$('#checkerForm').on('submit', function(event) {
  $('#checkerResult').text('Result: ...');
  event.preventDefault();

  var traits = {};

  traits[$('#checkerTraitOne').val()] = parseInt($('#traitOneNo').val());
  traits[$('#checkerTraitTwo').val()] = parseInt($('#traitTwoNo').val());
  traits[$('#checkerTraitThree').val()] = parseInt($('#traitThreeNo').val());

  var sets = checkCombinationOf(traits);

  if(sets.length > 0) {
    $('#checkerResult').text('Result: OK!');

    $.each(sets, function(_, set) {
      itenz = $.map(set.items, function(item) {
        return `${item.name} (${item.traitOne}, ${item.traitTwo})`;
      });

      $('#checkerResult').append(`
        <p>Wear ${itenz.join(', ')}</p>
      `);
    });
  } else {
    $('#checkerResult').text('Result: :( No matches');
  }
});