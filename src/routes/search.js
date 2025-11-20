const express = require('express');
const router = express.Router();
const { search } = require('../search');

/**
 * POST /api/search
 * 통합 검색 API 엔드포인트
 */
router.post('/search', async (req, res, next) => {
    const startTime = Date.now();
    try {
        const { query, options } = req.body;

        // 입력 유효성 검사
        if (!query || typeof query !== 'string' || query.trim() === '') {
            console.warn(`[검색 실패] 유효하지 않은 검색어: ${JSON.stringify(query)}`);
            return res.status(400).json({
                success: false,
                error: '검색어(query)가 필요합니다',
                timestamp: new Date().toISOString()
            });
        }

        // 검색 옵션 기본값 설정
        const searchOptions = {
            enableNaverBlog: options?.enableNaverBlog !== false,
            enableNaverNews: options?.enableNaverNews !== false,
            enableGoogle: options?.enableGoogle !== false
        };

        console.log(`[검색 시작] 검색어: "${query.trim()}", 옵션:`, searchOptions);

        // 검색 실행
        const results = await search(query.trim(), searchOptions);

        const duration = Date.now() - startTime;
        console.log(`[검색 완료] 검색어: "${query.trim()}", 결과: ${results.length}개, 소요시간: ${duration}ms`);

        // 성공 응답
        res.json({
            success: true,
            query: query.trim(),
            timestamp: new Date().toISOString(),
            totalResults: results.length,
            results: results
        });
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`[검색 에러] 소요시간: ${duration}ms, 에러:`, error.message);
        next(error);
    }
});

/**
 * GET /api/search?q=검색어
 * 간단한 GET 방식 검색 엔드포인트
 */
router.get('/search', async (req, res, next) => {
    const startTime = Date.now();
    try {
        const { q } = req.query;

        // 입력 유효성 검사
        if (!q || typeof q !== 'string' || q.trim() === '') {
            console.warn(`[검색 실패] 유효하지 않은 검색어 (GET): ${JSON.stringify(q)}`);
            return res.status(400).json({
                success: false,
                error: '검색어(q)가 필요합니다',
                timestamp: new Date().toISOString()
            });
        }

        console.log(`[검색 시작] (GET) 검색어: "${q.trim()}"`);

        // 모든 소스 활성화로 검색 실행
        const results = await search(q.trim());

        const duration = Date.now() - startTime;
        console.log(`[검색 완료] (GET) 검색어: "${q.trim()}", 결과: ${results.length}개, 소요시간: ${duration}ms`);

        // 성공 응답
        res.json({
            success: true,
            query: q.trim(),
            timestamp: new Date().toISOString(),
            totalResults: results.length,
            results: results
        });
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`[검색 에러] (GET) 소요시간: ${duration}ms, 에러:`, error.message);
        next(error);
    }
});

/**
 * GET /api/sources
 * 사용 가능한 검색 소스 목록
 */
router.get('/sources', (req, res) => {
    res.json({
        sources: [
            {
                id: 'naver_blog',
                name: 'Naver Blog',
                enabled: true
            },
            {
                id: 'naver_news',
                name: 'Naver News',
                enabled: true
            },
            {
                id: 'google',
                name: 'Google Search',
                enabled: true
            }
        ]
    });
});

module.exports = router;
