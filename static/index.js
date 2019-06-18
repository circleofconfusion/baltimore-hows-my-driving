const stateField = document.getElementById('state-field');
const tagField = document.getElementById('tag-field');
const searchButton = document.getElementById('search-button');
const violationsList = document.getElementById('violations-table');

searchButton.addEventListener('click', () => {
    const state = stateField.value;
    const tag = tagField.value;
    const url = `/query/by-tag?state=${state}&tag=${tag}`;
    fetch(url)
        .then(response => response.json())
        .then(json => { displayResults(json) })
        .catch(error => { console.error(error) });
});

function displayResults(dataArray) {
    violationsList.innerHTML = '';
    const heading = createTableHeading();
    violationsList.appendChild(heading);
    dataArray.forEach(violation => {
        const li = createListItem(violation);
        violationsList.appendChild(li);
    });
}

function createListItem(violation) {
    const li = document.createElement('li');
    li.setAttribute('role', 'row');
    const state = document.createElement('div');
    state.innerHTML = violation.state;
    const tag = document.createElement('div');
    tag.innerHTML = violation.tag;
    const make = document.createElement('div');
    make.innerHTML = violation.make;
    const address = document.createElement('div');
    address.innerHTML = violation.location;
    const description = document.createElement('div');
    description.innerHTML = violation.description;
    const violDate = document.createElement('div');
    violDate.innerHTML = violation.violdate;

    li.appendChild(state);
    li.appendChild(tag);
    li.appendChild(make);
    li.appendChild(address);
    li.appendChild(description);
    li.appendChild(violDate);

    return li;
}

function createTableHeading() {
    const li = document.createElement('li');
    li.innerHTML = `<div role="columnheader">State</div>
        <div role="columnheader">Tag</div>
        <div role="columnheader">Make</div>
        <div role="columnheader">Address</div>
        <div role="columnheader">Description</div>
        <div role="columnheader">Violation Date</div>`;
    li.classList = ['table-heading'];

    return li;
}