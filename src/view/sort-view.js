import AbstractView from '../framework/view/abstract-view.js';
import {SortType} from '../const.js';

function createSortTemplate() {
  return `<form class="trip-events__trip-sort  trip-sort" action="#" method="get">
            <div class="trip-sort__item  trip-sort__item--day">
              <input id="sort-day" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-day" checked>
              <label class="trip-sort__btn" for="sort-day" data-sort-type="${SortType.DATE_UP}">Day</label>
            </div>

            <div class="trip-sort__item  trip-sort__item--event">
              <input id="sort-event" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-event" disabled>
              <label class="trip-sort__btn" for="sort-event">Event</label>
            </div>

            <div class="trip-sort__item  trip-sort__item--time">
              <input id="sort-time" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-time" disabled>
              <label class="trip-sort__btn" for="sort-time">Time</label>
            </div>

            <div class="trip-sort__item  trip-sort__item--price">
              <input id="sort-price" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-price">
              <label class="trip-sort__btn" for="sort-price" data-sort-type="${SortType.PRICE_DOWN}">Price</label>
            </div>

            <div class="trip-sort__item  trip-sort__item--offer">
              <input id="sort-offer" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-offer" disabled>
              <label class="trip-sort__btn" for="sort-offer">Offers</label>
            </div>
          </form>`;
}

export default class SortView extends AbstractView {
  #handleSortData = null;
  #handleSortPrice = null;

  constructor({onSortData, onSortPrice}) {
    super();
    this.#handleSortData = onSortData;
    this.#handleSortPrice = onSortPrice;
    this.element.querySelector('.trip-sort__item--day').addEventListener('click', this.#handleClickData);
    this.element.querySelector('.trip-sort__item--price').addEventListener('click', this.#handleClickPrice);
  }

  #handleClickData = (evt) => {
    evt.preventDefault();
    this.#handleSortData();
  };

  #handleClickPrice = (evt) => {
    evt.preventDefault();
    this.#handleSortPrice();
  };

  get template() {
    return createSortTemplate();
  }
}
