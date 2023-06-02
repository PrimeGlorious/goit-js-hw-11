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

async function onFormSubmit(e) {
  e.preventDefault();

  query = e.currentTarget.elements.searchQuery.value.trim();

  if (query === '') {
    Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
    clearGallery()
    return;
  }

  try {
    const pictures = await fetchPictures(query);
    if (pictures.data.hits.length < 1) {
      clearGallery()
      Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
      return;
    }
    clearGallery();
    renderMarkup(pictures.data.hits);
    lightbox.refresh();
    Notiflix.Notify.success(`Hooray! We found ${pictures.data.totalHits} images.`);
    if (pictures.data.totalHits > refs.gallery.children.length && refs.gallery.children.length >= 16) {
      observer.observe(refs.guard);
    }
  } catch (error) {
    console.log(error)
  }
}

function onObserverPagination(entries) {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      try {
        const pictures = await fetchPictures(query);
        if (pictures.data.totalHits <= refs.gallery.children.length) {
          observer.unobserve(refs.guard);
          if (pictures.data.totalHits < 41) {
            return;
          }
        Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
        return;
        }
        renderMarkup(pictures.data.hits)
        lightbox.refresh();

      } catch (error) {
        console.log(error);
      }
    };
  });
}

function clearGallery() {
  refs.gallery.innerHTML = '';
}

function renderMarkup(data) {
  const markup = createCardMarkup(data);
  refs.gallery.insertAdjacentHTML('beforeend', markup);
}