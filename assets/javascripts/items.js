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
})