import ApiService from './framework/api-service.js';

const Method = {
  GET: 'GET',
  PUT: 'PUT'
};

export default class PointApiService extends ApiService {
  get points() {
    return this._load({
      url: 'points'
    }).then(ApiService.parseResponse);
  }

  get destinations() {
    return this._load({
      url: 'destinations'
    }).then(ApiService.parseResponse);
  }

  get offersByType() {
    return this._load({
      url: 'offers',
    }).then(ApiService.parseResponse);
  }

  async updatePoint(point){
    const response = await this._load({
      url: `points/${point.id}`,
      method: Method.PUT,
      body: JSON.stringify(this.#adaptToServer(point)),
      headers: new Headers({'Content-Type': 'application/json'}),
    });
    const parsedResponse = await ApiService.parseResponse(response);
    return parsedResponse;
  }

  #adaptToServer(point) {
    const adaptedPoint = {
      ...point,
      'base_price': point.basePrice instanceof Date ? point.basePrice.toISOString() : null,
      'date_from': point.dateFrom instanceof Date ? point.dateFrom.toISOString() : null,
      'date_to': point.dateTo,
    };

    delete adaptedPoint.basePrice;
    delete adaptedPoint.dateFrom;
    delete adaptedPoint.dateTo;

    return adaptedPoint;
  }
}
