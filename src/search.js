require('dotenv').config();
const axios = require('axios');

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;

/**
 * Search Naver Blog
 * @param {string} query
 * @returns {Promise<Array>}
 */
async function searchNaverBlog(query) {
    try {
        const response = await axios.get('https://openapi.naver.com/v1/search/blog.json', {
            params: { query: query, display: 5 },
            headers: {
                'X-Naver-Client-Id': NAVER_CLIENT_ID,
                'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
            }
        });
        return response.data.items.map(item => ({
            source: 'Naver Blog',
            title: item.title.replace(/<[^>]+>/g, ''), // Remove HTML tags
            link: item.link,
            description: item.description.replace(/<[^>]+>/g, '')
        }));
    } catch (error) {
        console.error('Naver Blog Search Error:', error.message);
        return [];
    }
}

/**
 * Search Naver News
 * @param {string} query
 * @returns {Promise<Array>}
 */
async function searchNaverNews(query) {
    try {
        const response = await axios.get('https://openapi.naver.com/v1/search/news.json', {
            params: { query: query, display: 5 },
            headers: {
                'X-Naver-Client-Id': NAVER_CLIENT_ID,
                'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
            }
        });
        return response.data.items.map(item => ({
            source: 'Naver News',
            title: item.title.replace(/<[^>]+>/g, ''),
            link: item.originallink || item.link,
            description: item.description.replace(/<[^>]+>/g, '')
        }));
    } catch (error) {
        console.error('Naver News Search Error:', error.message);
        return [];
    }
}

/**
 * Search Google
 * @param {string} query
 * @returns {Promise<Array>}
 */
async function searchGoogle(query) {
    try {
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                key: GOOGLE_API_KEY,
                cx: GOOGLE_SEARCH_ENGINE_ID,
                q: query
            }
        });
        if (!response.data.items) return [];
        return response.data.items.map(item => ({
            source: 'Google Search',
            title: item.title,
            link: item.link,
            description: item.snippet
        }));
    } catch (error) {
        console.error('Google Search Error:', error.message);
        return [];
    }
}

/**
 * Unified Search Function
 * @param {string} query
 * @param {object} options
 * @returns {Promise<Array>}
 */
async function search(query, options = {}) {
    const {
        enableNaverBlog = true,
        enableNaverNews = true,
        enableGoogle = true
    } = options;

    const promises = [];

    if (enableNaverBlog) promises.push(searchNaverBlog(query));
    if (enableNaverNews) promises.push(searchNaverNews(query));
    if (enableGoogle) promises.push(searchGoogle(query));

    const results = await Promise.all(promises);
    return results.flat();
}

module.exports = {
    search,
    searchNaverBlog,
    searchNaverNews,
    searchGoogle
};
