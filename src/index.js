import SimpleLightbox from "simplelightbox";
import 'simplelightbox/dist/simple-lightbox.min.css';
import { getRefs } from "./js/getRefs";
import { fetchPictures } from './js/fetchPictures';
import Notiflix from 'notiflix';

const refs = getRefs();
const lightbox = new SimpleLightbox('.gallery a');
const options = {
  rootMargin: "400px",
  threshold: 0,
};
const observer = new IntersectionObserver(onObserverPagination, options);

refs.form.addEventListener('submit', onFormSubmit);

let currentPage = 1;
let query = '';
let includesHits = null;

async function onFormSubmit(e) {
  e.preventDefault();
  clearGalleryList();
  currentPage = 1;
  query = e.currentTarget.elements.searchQuery.value.trim();

  try {
    if (query === '') {
      Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
      clearGalleryList();
      return;
    }
    const pictures = await fetchPictures(query, currentPage);
    if (pictures.data.hits.length === 0) {
      Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
      clearGalleryList();
      return;
    }
    includesHits = pictures.data.totalHits;
    renderMarkup(pictures.data.hits);
    observer.observe(refs.guard);
    Notiflix.Notify.success(`Hooray! We found ${pictures.data.totalHits} images.`);
  } catch (error) {
    console.log(error);
  }
}

async function onObserverPagination(entries) {
  entries.forEach(async entry => {
    if (entry.isIntersecting && refs.gallery.children.length >= 40 && includesHits > refs.gallery.children.length) {
      currentPage += 1;
      try {
        if (currentPage * 40 >= includesHits) {
          Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
          observer.unobserve(refs.guard);
          return;
        }
        const pictures = await fetchPictures(query, currentPage);
        if (pictures.data.totalHits < 41) {
          return;
        }
        renderMarkup(pictures.data.hits)
      } catch (error) {
        console.log(error);
      }
    };
  });
}

function clearGalleryList() {
  refs.gallery.innerHTML = '';
}

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