import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const KEY = '36724264-fe267fbdc66ed4c80a286875f'

async function fetchPictures(searchQuery, page) {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        key: KEY,
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        page: page,
        per_page: '40',
      }
    }

    const response = await axios.get(BASE_URL, config);

    return response;
  } catch (error) {
    console.log(error);
  }
}

export { fetchPictures };