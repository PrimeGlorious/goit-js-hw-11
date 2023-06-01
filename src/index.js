import SimpleLightbox from "simplelightbox";
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import { createCardMarkup } from "./js/createMarkup";
import { fetchPictures } from "./js/fetchPictures";
import { getRefs } from "./js/getRefs";

const refs = getRefs();

const options = {
  rootMargin: "400px",
  threshold: 0,
};

const observer = new IntersectionObserver(onObserverPagination, options);

refs.form.addEventListener('submit', onFormSubmit);

const lightbox = new SimpleLightbox('.gallery a');

let query = '';

function onFormSubmit(e) {
  e.preventDefault();

  query = e.currentTarget.elements.searchQuery.value.trim();

  if (query === '') {
    Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
    return;
  }

  fetchPictures(query).then(resp => {
    if (resp.data.hits.length < 1) {
      Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
      return;
    }
    refs.gallery.innerHTML = '';
    const markup = createCardMarkup(resp.data.hits);
    refs.gallery.insertAdjacentHTML('beforeend', markup);
    lightbox.refresh();
    Notiflix.Notify.info(`Hooray! We found ${resp.data.totalHits} images.`);
    if (resp.data.totalHits > refs.gallery.children.length && refs.gallery.children.length >= 16) {
      observer.observe(refs.guard);
    }
  })
}

function onObserverPagination(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      fetchPictures(query).then(resp => {
        if (resp.data.totalHits <= refs.gallery.children.length) {
          observer.unobserve(refs.guard);
          if (resp.data.totalHits < 17) {
            return;
          }
        Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
        return;
      }
      const markup = createCardMarkup(resp.data.hits);
      refs.gallery.insertAdjacentHTML('beforeend', markup);
      lightbox.refresh();

      })
    };
  });
}