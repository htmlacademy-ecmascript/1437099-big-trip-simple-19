import AbstractView from '../framework/view/abstract-view.js';

function createFiltersTemplate(filters, filterName) {
  return filters.map(({type, count}) => {
    const isFilterDisabled = (count === 0) ? 'disabled' : '';
    const isChecked = (type === filterName) ? 'checked' : '';
    return ` <div class="trip-filters__filter">
      <input id="filter-${type}" class="trip-filters__filter-input visually-hidden" ${isFilterDisabled} type="radio"
             name="trip-filter" value=${type} data-filter-name="${type}" ${isChecked}>
        <label class="trip-filters__filter-label" for="filter-${type}">${type}</label>
    </div>`;
  }).join('');
}

function createFiltersBlockTemplate(filters, filterName) {
  return `<form class="trip-filters" action="#" method="get">
            ${createFiltersTemplate(filters, filterName)}
            <button class="visually-hidden" type="submit">Accept filter</button>
          </form>`;
}

export default class FilterView extends AbstractView {
  #handleFilterChange = null;
  #currentFilterName = null;

  constructor({filter, currentFilterName, onFilterChange}) {
    super();
    this.#handleFilterChange = onFilterChange;
    this.filters = filter;
    this.#currentFilterName = currentFilterName;
    this.element.addEventListener('change', this.#filterTypeChangeHandler);
  }

  #filterTypeChangeHandler = (evt) => {
    const {filterName} = evt.target.dataset;
    this.#handleFilterChange(filterName);
  };

  get template() {
    return createFiltersBlockTemplate(this.filters, this.#currentFilterName);
  }
}
