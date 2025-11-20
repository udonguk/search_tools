const request = require('supertest');
const app = require('../server');
const { search } = require('../search');

// search 함수 모킹
jest.mock('../search');

describe('검색 API 엔드포인트 테스트', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/search', () => {
        it('정상적인 검색 요청 시 결과를 반환해야 함', async () => {
            const mockResults = [
                {
                    source: 'Naver Blog',
                    title: 'LangChain 시작하기',
                    link: 'https://blog.naver.com/test',
                    description: 'LangChain 설명'
                },
                {
                    source: 'Google Search',
                    title: 'LangChain Docs',
                    link: 'https://langchain.com',
                    description: 'Official documentation'
                }
            ];

            search.mockResolvedValue(mockResults);

            const response = await request(app)
                .post('/api/search')
                .send({
                    query: 'LangChain',
                    options: {
                        enableNaverBlog: true,
                        enableNaverNews: true,
                        enableGoogle: true
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('query', 'LangChain');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('totalResults', 2);
            expect(response.body).toHaveProperty('results');
            expect(response.body.results).toHaveLength(2);
            expect(response.body.results[0].source).toBe('Naver Blog');
        });

        it('검색어가 없으면 400 에러를 반환해야 함', async () => {
            const response = await request(app)
                .post('/api/search')
                .send({})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error', '검색어(query)가 필요합니다');
            expect(response.body).toHaveProperty('timestamp');
        });

        it('검색어가 빈 문자열이면 400 에러를 반환해야 함', async () => {
            const response = await request(app)
                .post('/api/search')
                .send({ query: '   ' })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body.error).toBe('검색어(query)가 필요합니다');
        });

        it('검색어가 문자열이 아니면 400 에러를 반환해야 함', async () => {
            const response = await request(app)
                .post('/api/search')
                .send({ query: 123 })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
        });

        it('options가 없으면 모든 소스가 활성화되어야 함', async () => {
            search.mockResolvedValue([]);

            await request(app)
                .post('/api/search')
                .send({ query: 'test' })
                .expect(200);

            expect(search).toHaveBeenCalledWith('test', {
                enableNaverBlog: true,
                enableNaverNews: true,
                enableGoogle: true
            });
        });

        it('특정 소스만 활성화하여 검색할 수 있어야 함', async () => {
            search.mockResolvedValue([]);

            await request(app)
                .post('/api/search')
                .send({
                    query: 'test',
                    options: {
                        enableNaverBlog: false,
                        enableNaverNews: false,
                        enableGoogle: true
                    }
                })
                .expect(200);

            expect(search).toHaveBeenCalledWith('test', {
                enableNaverBlog: false,
                enableNaverNews: false,
                enableGoogle: true
            });
        });

        it('검색어 앞뒤 공백이 제거되어야 함', async () => {
            search.mockResolvedValue([]);

            const response = await request(app)
                .post('/api/search')
                .send({ query: '  LangChain  ' })
                .expect(200);

            expect(response.body.query).toBe('LangChain');
            expect(search).toHaveBeenCalledWith('LangChain', expect.any(Object));
        });

        it('검색 중 에러 발생 시 에러 핸들러가 처리해야 함', async () => {
            search.mockRejectedValue(new Error('Search failed'));

            const response = await request(app)
                .post('/api/search')
                .send({ query: 'test' })
                .expect('Content-Type', /json/)
                .expect(500);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/search', () => {
        it('쿼리 파라미터로 검색할 수 있어야 함', async () => {
            const mockResults = [
                {
                    source: 'Naver Blog',
                    title: 'Test',
                    link: 'https://test.com',
                    description: 'Test description'
                }
            ];

            search.mockResolvedValue(mockResults);

            const response = await request(app)
                .get('/api/search?q=LangChain')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('query', 'LangChain');
            expect(response.body).toHaveProperty('totalResults', 1);
            expect(response.body.results).toHaveLength(1);
        });

        it('검색어 파라미터(q)가 없으면 400 에러를 반환해야 함', async () => {
            const response = await request(app)
                .get('/api/search')
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error', '검색어(q)가 필요합니다');
        });

        it('GET 방식은 모든 소스가 자동으로 활성화되어야 함', async () => {
            search.mockResolvedValue([]);

            await request(app)
                .get('/api/search?q=test')
                .expect(200);

            expect(search).toHaveBeenCalledWith('test');
        });

        it('쿼리 파라미터 공백이 제거되어야 함', async () => {
            search.mockResolvedValue([]);

            const response = await request(app)
                .get('/api/search?q=%20%20test%20%20')
                .expect(200);

            expect(response.body.query).toBe('test');
        });
    });

    describe('GET /api/sources', () => {
        it('사용 가능한 검색 소스 목록을 반환해야 함', async () => {
            const response = await request(app)
                .get('/api/sources')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('sources');
            expect(response.body.sources).toHaveLength(3);

            const sources = response.body.sources;
            expect(sources[0]).toEqual({
                id: 'naver_blog',
                name: 'Naver Blog',
                enabled: true
            });
            expect(sources[1]).toEqual({
                id: 'naver_news',
                name: 'Naver News',
                enabled: true
            });
            expect(sources[2]).toEqual({
                id: 'google',
                name: 'Google Search',
                enabled: true
            });
        });
    });
});
