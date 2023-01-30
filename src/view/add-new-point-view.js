import AbstractView from '../framework/view/abstract-view.js';
import {formattingFullDate} from '../utils.js';
import dayjs from 'dayjs';
import {POINT_TYPE, getOffersByType} from '../mock/point.js';
import {CITIES} from '../mock/const.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const BLANK_POINT = {
  basePrice: 0,
  dateFrom: dayjs().toDate(),
  dateTo: dayjs().toDate(),
  destination: undefined,
  offers: [],
  type: POINT_TYPE[0],
};


function createOffersTemplate(point = BLANK_POINT, offersArr) {
  const {type, offers} = point;

  const offersByPointType = getOffersByType(type, offersArr).offers;

  return (offersByPointType.length !== 0) ? (offersByPointType.map((offer) => {
    const isOfferChecked = (offers.includes(offer.id)) ? 'checked' : '';
    const offerTitleFusion = offer.title.split(' ').join('');
    return (
      `<div class="event__offer-selector">
        <input class="event__offer-checkbox  visually-hidden"
               id="event-offer-${offerTitleFusion}-${offer.id}"
               type="checkbox"
               name="event-offer-${offerTitleFusion}"
               data-offer-id="${offer.id}"
               ${isOfferChecked}>
        <label class="event__offer-label" for="event-offer-${offerTitleFusion}-${offer.id}">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </label>
    </div>`
    );
  }).join('')) : '';
}

function createDestinationListTemplate() {
  return CITIES.map((city) => `<option value="${city}"></option>`).join('');
}

function getPicturesListTemplate(pictures) {
  if (pictures === undefined) {
    return '';
  }
  return pictures.map((picture) => `<img class="event__photo" src=${picture.src} alt="${picture.description}">`).join('');
}

function createTypesTemplate(point) {
  return POINT_TYPE.map((type) => {
    const checked = (type === point.type) ? 'checked' : '';
    return `<div class="event__type-item">
      <input id="event-type-${type}-${point.id}" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}" ${checked}>
      <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-${point.id}">${type}</label>
    </div>`;
  }).join('');
}

function createDestinationTemplate(destination) {
  if (destination === undefined) {
    return '';
  } else {
    const {description, name, pictures} = destination;
    return (
      `<section class="event__section  event__section--destination">
        <h3 class="event__section-title  event__section-title--destination">${name}</h3>
        <p class="event__destination-description">${description}</p>

        <div class="event__photos-container">
          <div class="event__photos-tape">
            ${getPicturesListTemplate(pictures)};
          </div>
        </div>
      </section>`
    );
  }
}

function createAddNewPointTemplate(point, offersArr) {
  const {destination, basePrice, dateFrom, dateTo, type} = point;
  return (
    `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-${point.id}">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-${point.id}" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                 ${createTypesTemplate(point)}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-${point.id}">
              ${type}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-${point.id}" type="text" name="event-destination" value="${(destination === undefined ) ? '' : destination.name}" list="destination-list-${point.id}">
            <datalist id="destination-list-${point.id}">
              ${createDestinationListTemplate()}
            </datalist>
          </div>

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-${point.id}">From</label>
            <input class="event__input  event__input--time" id="event-start-time-${point.id}" type="text" name="event-start-time" value="${formattingFullDate(dateFrom)}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-${point.id}">To</label>
            <input class="event__input  event__input--time" id="event-end-time-${point.id}" type="text" name="event-end-time" value="${formattingFullDate(dateTo)}">
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-${point.id}">
              <span class="visually-hidden">Price</span>
             &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-${point.id}" type="text" name="event-price" value="${basePrice}">
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
          <section class="event__section  event__section--offers ${getOffersByType(type).offers.length === 0 ? 'visually-hidden' : ''}">
            <h3 class="event__section-title  event__section-title--offers">Offers</h3>

            <div class="event__available-offers">
              ${createOffersTemplate(point, offersArr)}
            </div>
          </section>

          ${createDestinationTemplate(destination)}
        </section>
      </form>
     </li>`
  );
}

export default class AddNewPointView extends AbstractView {
  #handlerSubmit = null;
  #handleCloseClick = null;
  #point = null;
  #destinations = null;
  #offersByType = null;

  constructor({destinations, offers, onSubmit, onDeleteClick}) {
    super();
    this.#point = BLANK_POINT;
    this.#destinations = destinations;
    this.#offersByType = offers;
    this.#handlerSubmit = onSubmit;
    this.#handleCloseClick = onDeleteClick;
    this.element.querySelector('form').addEventListener('submit', this.#submitHandler);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#clickHandler);
  }

  #submitHandler = (evt) => {
    evt.preventDefault();
    this.#handlerSubmit();
  };

  #clickHandler = (evt) => {
    evt.preventDefault();
    this.#handleCloseClick();
  };

  get template() {
    console.log(this.#offersByType);
    return createAddNewPointTemplate(this.#point, this.#offersByType);
  }
}
