require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

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

/**
 * 검색 결과를 JSON 파일로 저장
 * @param {Array} results - 검색 결과 배열
 * @param {string} query - 검색 쿼리
 * @returns {string} - 저장된 파일 경로
 */
function saveResultsToJson(results, query) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedQuery = query.replace(/[^a-zA-Z0-9가-힣]/g, '_');
    const fileName = `search_results_${sanitizedQuery}_${timestamp}.json`;
    const filePath = path.join(__dirname, fileName);

    const outputData = {
        query: query,
        timestamp: new Date().toISOString(),
        totalResults: results.length,
        results: results
    };

    fs.writeFileSync(filePath, JSON.stringify(outputData, null, 2), 'utf8');
    return filePath;
}

// Example usage if run directly
if (require.main === module) {
    const query = process.argv[2] || 'LangChain';
    console.log(`검색 중: ${query}\n`);

    search(query)
        .then(results => {
            // 결과 리스트만 출력
            results.forEach((item, index) => {
                console.log(`${index + 1}. [${item.source}] ${item.title}`);
                console.log(`   링크: ${item.link}`);
                console.log(`   설명: ${item.description}`);
                console.log('');
            });

            // JSON 파일로 저장
            const savedPath = saveResultsToJson(results, query);
            console.log(`검색 결과가 저장되었습니다: ${savedPath}`);
        })
        .catch(err => {
            console.error(err);
        });
}

module.exports = { search, saveResultsToJson };