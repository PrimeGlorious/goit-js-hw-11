import SimpleLightbox from "simplelightbox";
import 'simplelightbox/dist/simple-lightbox.min.css';
import { getRefs } from "./getRefs";

const lightbox = new SimpleLightbox('.gallery a');

const refs = getRefs();

function createCardMarkup(arr) {
  return arr.map(({ likes, views, comments, downloads, tags, webformatURL, largeImageURL }) => {
    return `
    <a href="${largeImageURL}" class="gallery-link">
      <div class="photo-card">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" width="400" height="250"/>
        <div class="info">
          <p class="info-item">
            <b>Likes </br>${likes}</b>
          </p>
          <p class="info-item">
            <b>Views </br>${views}</b>
          </p>
          <p class="info-item">
            <b>Comments </br>${comments}</b>
          </p>
          <p class="info-item">
            <b>Downloads </br>${downloads}</b>
          </p>
        </div>
      </div>
    </a>
    `
  }).join('');
}

function renderMarkup(data) {
  const markup = createCardMarkup(data);
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}

export { renderMarkup };