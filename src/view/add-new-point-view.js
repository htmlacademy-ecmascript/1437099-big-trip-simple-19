import {formattingFullDate} from '../utils/utils.js';
import dayjs from 'dayjs';
import he from 'he';
import {getOffersByType} from '../utils/utils.js';
import {POINT_TYPES} from '../const.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';

const BLANK_POINT = {
  basePrice: '',
  dateFrom: dayjs().toDate(),
  dateTo: dayjs().add(1, 'day').toDate(),
  destination: undefined,
  offers: [],
  type: POINT_TYPES[0],
};


function createOffersTemplate(point = BLANK_POINT, offersByType) {
  const {type, offers} = point;

  const offersByPointType = getOffersByType(type, offersByType).offers;

  return (offersByPointType.length !== 0) ? (offersByPointType.map(({id, title, price}) => {
    const isOfferChecked = (offers.includes(id)) ? 'checked' : '';
    const offerTitleFusion = title.split(' ').join('');
    return (
      `<div class="event__offer-selector">
        <input class="event__offer-checkbox  visually-hidden"
               id="event-offer-${offerTitleFusion}-${id}"
               type="checkbox"
               name="event-offer-${offerTitleFusion}"
               data-offer-id="${id}"
               ${isOfferChecked}>
        <label class="event__offer-label" for="event-offer-${offerTitleFusion}-${id}">
        <span class="event__offer-title">${title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${price}</span>
      </label>
    </div>`
    );
  }).join('')) : '';
}

function createDestinationListTemplate(destinations) {
  return destinations.map((destination) => `<option value="${destination.name}"></option>`).join('');
}

function getPicturesListTemplate(pictures) {
  if (pictures === undefined) {
    return '';
  }
  return pictures.map((picture) => `<img class="event__photo" src=${picture.src} alt="${picture.description}">`).join('');
}

function createTypesTemplate(point) {
  return POINT_TYPES.map((type) => {
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
    const {description, pictures} = destination;
    return (
      `<section class="event__section  event__section--destination ${description === undefined ? 'visually-hidden' : ''}">
        <h3 class="event__section-title  event__section-title--destination">Destination</h3>
        <p class="event__destination-description">${he.encode(description)}</p>

        <div class="event__photos-container ${pictures === undefined ? 'visually-hidden' : ''}">
          <div class="event__photos-tape">
            ${getPicturesListTemplate(pictures)};
          </div>
        </div>
      </section>`
    );
  }
}

function createAddNewPointTemplate(point, destinations, offersByType) {
  const {destination, basePrice, dateFrom, dateTo, type, isDisabled, isSaving} = point;
  const pointDestinationDescription = destinations.find((item) => item.id === destination);
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
              ${he.encode(type)}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-${point.id}" type="text" name="event-destination" value="${(destination === undefined ) ? '' : he.encode(pointDestinationDescription.name)}" list="destination-list-${point.id}">
            <datalist id="destination-list-${point.id}">
              ${createDestinationListTemplate(destinations)}
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
            <input class="event__input  event__input--price" id="event-price-${point.id}" type="text" name="event-price" value="${he.encode((basePrice).toString())}">
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit" ${isDisabled ? 'disabled' : ''}>${isSaving ? 'Saving...' : 'Save'}</button>
          <button class="event__reset-btn" type="reset" ${isDisabled ? 'disabled' : ''}>Cancel</button>

        </header>
        <section class="event__details">
          <section class="event__section  event__section--offers ${getOffersByType(type, offersByType).offers.length === 0 ? 'visually-hidden' : ''}">
            <h3 class="event__section-title  event__section-title--offers">Offers</h3>

            <div class="event__available-offers">
              ${createOffersTemplate(point, offersByType)}
            </div>
          </section>

          ${createDestinationTemplate(pointDestinationDescription)}
        </section>
      </form>
     </li>`
  );
}

export default class AddNewPointView extends AbstractStatefulView {
  #handlerSubmit = null;
  #handleCloseClick = null;
  #point = null;
  #destinations = null;
  #offersByType = null;
  #datepickerFrom = null;
  #datepickerTo = null;

  constructor({destinations, offers, onSubmit, onCancelClick}) {
    super();
    this.#point = BLANK_POINT;
    this.#destinations = destinations;
    this.#offersByType = offers;
    this.#handlerSubmit = onSubmit;
    this.#handleCloseClick = onCancelClick;

    this._setState(AddNewPointView.parsePointToState(this.#point));
    this._restoreHandlers();
  }

  get template() {
    return createAddNewPointTemplate(this._state, this.#destinations, this.#offersByType);
  }

  _restoreHandlers() {
    this.element.querySelector('form').addEventListener('submit', this.#submitHandler);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#cancelClickHandler);
    this.element.querySelector('.event__available-offers').addEventListener('change', this.#offerChangeHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);
    this.element.querySelector('.event__type-group').addEventListener('change', this.#typeChangeHandler);
    this.element.querySelector('.event__input--price').addEventListener('change', this.#priceChangeHandler);
    this.#setDatepicker();
  }

  removeElement() {
    super.removeElement();

    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy();
      this.#datepickerFrom = null;
    }

    if (this.#datepickerTo) {
      this.#datepickerTo.destroy();
      this.#datepickerTo = null;
    }
  }

  #setDatepicker() {
    this.#datepickerFrom = flatpickr(this.element.querySelector('input[name="event-start-time"]'),
      {
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateFrom,
        maxDate: this._state.dateTo,
        onChange: this.#handleStartDataChange,
      });
    this.#datepickerTo = flatpickr(this.element.querySelector('input[name="event-end-time"]'),
      {
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateTo,
        minDate: this._state.dateFrom,
        onChange: this.#handleEndDataChange,
      });
  }

  reset(point) {
    this.updateElement(AddNewPointView.parsePointToState(point));
  }

  #handleStartDataChange = ([userDate]) => {
    this.updateElement({
      dateFrom: userDate,
    });
  };

  #handleEndDataChange = ([userDate]) => {
    this.updateElement({
      dateTo: userDate,
    });
  };

  #priceChangeHandler = (evt) => {
    evt.preventDefault();
    this._setState({
      basePrice: Number(evt.target.value),
    });
  };

  #offerChangeHandler = (evt) => {
    evt.preventDefault();
    const item = evt.target;
    const checkedOfferId = Number(item.dataset.offerId);
    if(item.hasAttribute('checked')){
      item.removeAttribute('checked');
      this._state.offers = this._state.offers.filter((id) => id !== checkedOfferId);
    } else {
      item.setAttribute('checked', 'checked');
      this._state.offers.push(checkedOfferId);
    }
    this._setState({
      offers: this._state.offers,
    });
  };

  #destinationChangeHandler = (evt) => {
    evt.preventDefault();
    const tripDestination = this.#destinations.find((item) => item.name === evt.target.value);
    if (tripDestination === undefined) {
      this.updateElement({
        destination: undefined,
      });
      return;
    }
    this.updateElement({
      destination: tripDestination.id,
    });
  };

  #typeChangeHandler = (evt) => {
    evt.preventDefault();
    const tripType = evt.target.value;
    this.updateElement({
      type: tripType,
      offers: []
    });
  };

  #submitHandler = (evt) => {
    evt.preventDefault();
    this.#handlerSubmit(AddNewPointView.parseStateToPoint(this._state));
  };

  #cancelClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleCloseClick();
  };

  static parsePointToState(point) {
    return {...point,
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    };
  }

  static parseStateToPoint(state) {
    const task = {...state};
    delete task.isDeleting;
    delete task.isSaving;
    delete task.isDisabled;

    return task;
  }
}
