import {render, remove, RenderPosition} from '../framework/render.js';
import PointsListView from '../view/points-list-view.js';
import SortView from '../view/sort-view.js';
import EmptyListView from '../view/empty-list-view.js';
import PointPresenter from './point-presenter.js';
import {SortType, FilterType, UpdateType, UserAction} from '../const.js';
import {sortPointsDateUp, sortPointsPriceDown} from '../utils/utils.js';
import {filters} from '../utils/filter.js';
import NewPointPresenter from './new-point-presenter.js';
import LoadingView from '../view/loading-view.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import ErrorServerView from '../view/error-server-view.js';

const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

export default class ListPresenter {
  #pointsContainer = null;
  #pointsModel = null;
  #filterModel = null;

  #listComponent = new PointsListView();
  #sortComponent = null;
  #pointPresenters = new Map();
  #currentSortType = SortType.DATE_UP;
  #filterType = FilterType.EVERYTHING;
  #emptyListComponent = null;
  #newPointPresenter = null;
  #errorServerComponent = null;
  #loadingComponent = new LoadingView();
  #isLoading = true;
  #onNewPointDestroy = null;
  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT
  });

  constructor({pointsContainer, pointsModel, filterModel, onNewPointDestroy}) {
    this.#pointsContainer = pointsContainer;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
    this.#onNewPointDestroy = onNewPointDestroy;

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    const points = this.#pointsModel.points;
    this.#filterType = this.#filterModel.filterType;
    const filteredPoints = filters[this.#filterType](points);

    switch (this.#currentSortType) {
      case SortType.DATE_UP:
        return filteredPoints.sort(sortPointsDateUp);
      case SortType.PRICE_DOWN:
        return filteredPoints.sort(sortPointsPriceDown);
    }
    return filteredPoints;
  }

  set points(updatePoints) {
    this.#pointsModel.points = updatePoints;
  }

  get destinations() {
    return this.#pointsModel.destinations;
  }

  get offers() {
    return this.#pointsModel.offers;
  }

  init() {
    this.#renderBoard();
  }

  createPoint(){
    this.#currentSortType = SortType.DATE_UP;
    this.#filterModel.setFilterType(UpdateType.MAJOR, FilterType.EVERYTHING);
    this.#newPointPresenter = new NewPointPresenter({
      destinations: this.destinations,
      offers: this.offers,
      listComponent: this.#listComponent.element,
      onDataChange: this.#handleViewAction,
      onDestroy: this.#onNewPointDestroy,
    });
    if (this.#emptyListComponent) {
      remove(this.#emptyListComponent);
    }
    this.#newPointPresenter.init();
  }

  #renderErrorServer() {
    this.#errorServerComponent = new ErrorServerView();
    render(this.#errorServerComponent, this.#listComponent.element);
  }

  #renderNoTask() {
    this.#emptyListComponent = new EmptyListView({
      filterType: this.#filterModel.filterType
    });
    render(this.#emptyListComponent, this.#listComponent.element);
  }

  #renderLoading() {
    render(this.#loadingComponent, this.#listComponent.element, RenderPosition.BEFOREBEGIN);
  }

  #renderSort() {
    this.#sortComponent = new SortView({
      onSortChange: this.#handleSortChange,
      currentSort: this.#currentSortType,
    });
    render(this.#sortComponent, this.#listComponent.element, RenderPosition.BEFOREBEGIN);
  }

  #renderBoard() {
    render(this.#listComponent, this.#pointsContainer);

    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }

    const points = this.points;
    if (points.length === 0 && this.offers.length === 0) {
      this.#renderErrorServer();
      return;
    }

    if (points.length === 0) {
      this.#renderNoTask();
      return;
    }

    this.#renderSort();
    this.#renderPoints();
  }

  #renderPoints() {
    this.points.forEach((point) => {
      this.#renderPoint(point);
    });
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      listComponent: this.#listComponent.element,
      destinations: this.destinations,
      offers: this.offers,
      onModeChange: this.#handleModeChange,
      onDataChange: this.#handleViewAction,
    });
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #clearBoard({resetSortType = false} = {}) {
    if(this.#newPointPresenter) {
      this.#newPointPresenter.destroy();
    }

    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    remove(this.#sortComponent);
    remove(this.#loadingComponent);

    if (this.#emptyListComponent) {
      remove(this.#emptyListComponent);
    }

    if(resetSortType) {
      this.#currentSortType = SortType.DATE_UP;
    }
  }

  #handleViewAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block();
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointPresenters.get(update.id).setSaving();
        try {
          await this.#pointsModel.updatePoint(updateType, update);
        } catch (err) {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;
      case UserAction.ADD_POINT:
        this.#newPointPresenter.setSaving();
        try {
          await this.#pointsModel.addPoint(updateType, update);
        } catch (err) {
          this.#newPointPresenter.setAborting();
        }
        break;
      case UserAction.DELETE_POINT:
        this.#pointPresenters.get(update.id).setDeleting();
        try {
          await this.#pointsModel.deletePoint(updateType, update);
        } catch (err) {
          this.#pointPresenters.get(update.id).setAborting();
        }
    }
    this.#uiBlocker.unblock();
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType){
      case UpdateType.PATCH:
        this.#pointPresenters.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard({resetSortType: true});
        this.#renderBoard();
        break;
      case UpdateType.INIT:
        this.#isLoading = false;
        remove(this.#loadingComponent);
        this.#renderBoard();
        break;
    }
  };

  #handleSortChange = (sortType) => {
    if(this.#currentSortType === sortType) {
      return;
    }
    this.#currentSortType = sortType;
    this.#clearBoard();
    this.#renderBoard();
  };

  #handleModeChange = () => {
    if(this.#newPointPresenter) {
      this.#newPointPresenter.destroy();
    }
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };
}
