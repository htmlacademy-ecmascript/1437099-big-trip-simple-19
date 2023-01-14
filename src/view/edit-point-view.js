import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import {offersByType, POINT_TYPE} from '../mock/point.js';
import {CITIES} from '../mock/const.js';
import {formattingFullDate} from '../utils.js';

function createOffersTemplate(point) {
  const offersByPointType = offersByType.find((offer) => offer.type === point.type);
  return offersByPointType.offers.map((offer) => {
    const checked = point.offers.includes(offer.id) ? 'checked' : '';
    const offerTitleFusion = offer.title.split(' ').join('');
    return (
      `<div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden"
             id="event-offer-${offerTitleFusion}-${offer.id}"
             type="checkbox"
             name="event-offer-${offerTitleFusion}"
             ${checked}>
      <label class="event__offer-label" for="event-offer-${offerTitleFusion}-${offer.id}">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </label>
    </div>`
    );
  }).join('');
}

function createTypesTemplate(point) {
  return POINT_TYPE.map((type) => (
    `<div class="event__type-item">
      <input id="event-type-${type}-${point.id}" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}">
      <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-${point.id}">${type}</label>
    </div>`
  )).join('');
}

function createDestinationListTemplate() {
  return CITIES.map((city) => `<option value="${city}"></option>`).join('');
}

function createPicturesTemplate(pictures) {
  return pictures.map((picture) => `<img class="event__photo" src="${picture.src}" alt="${picture.description}">`)
    .join('');
}

function createDestinationTemplate(destination){
  const {description, name, pictures} = destination;
  return destination !== null ?
    (
      `<section class="event__section  event__section--destination">
        <h3 class="event__section-title  event__section-title--destination">${name}</h3>
        <p class="event__destination-description">${description}</p>

        <div class="event__photos-container">
          <div class="event__photos-tape">
            ${createPicturesTemplate(pictures)};
          </div>
        </div>
      </section>`
    ) : '' ;
}

function createNewEditPointTemplate(point) {
  const {destination, basePrice, dateFrom, dateTo} = point;
  return (
    `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/flight.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                 ${createTypesTemplate(point)}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">
              Flight
            </label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="Chamonix" list="destination-list-1">
            <datalist id="destination-list-1">
              ${createDestinationListTemplate()}
            </datalist>
          </div>

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${formattingFullDate(dateFrom)}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${formattingFullDate(dateTo)}">
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
             &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
          <section class="event__section  event__section--offers">
            <h3 class="event__section-title  event__section-title--offers">Offers</h3>

            <div class="event__available-offers">
              ${createOffersTemplate(point)}
            </div>
          </section>

          ${createDestinationTemplate(destination)}
        </section>
      </form>
     </li>`
  );
}

export default class EditPointView extends AbstractStatefulView {
  #point = null;
  #handlerSubmit = null;
  #handlerCloseClick = null;

  constructor({point, onSubmit, onCloseClick}) {
    super();
    this.#point = point;
    this.#handlerSubmit = onSubmit;
    this.#handlerCloseClick = onCloseClick;
    this.element.querySelector('form').addEventListener('submit', this.#submitHandler);
    this.element.querySelector('.event__rollup-btn').addEventListener('click',this.#clickCloseHandler);
  }

  #submitHandler = (evt) => {
    evt.preventDefault();
    this.#handlerSubmit();
  };

  #clickCloseHandler = (evt) => {
    evt.preventDefault();
    this.#handlerCloseClick();
  };

  get template() {
    return createNewEditPointTemplate(this.#point);
  }
}

