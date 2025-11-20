const request = require('supertest');
const app = require('./server');

describe('Express 서버 테스트', () => {
    describe('GET /health', () => {
        it('헬스체크 엔드포인트가 정상적으로 응답해야 함', async () => {
            const response = await request(app)
                .get('/health')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('timestamp');
            expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
        });
    });

    describe('GET /', () => {
        it('루트 엔드포인트가 API 정보를 반환해야 함', async () => {
            const response = await request(app)
                .get('/')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Search API Server');
            expect(response.body).toHaveProperty('version', '1.0.0');
            expect(response.body).toHaveProperty('endpoints');
            expect(response.body.endpoints).toHaveProperty('health');
            expect(response.body.endpoints).toHaveProperty('search');
            expect(response.body.endpoints).toHaveProperty('searchGet');
            expect(response.body.endpoints).toHaveProperty('sources');
        });
    });

    describe('404 에러 핸들링', () => {
        it('존재하지 않는 엔드포인트 요청 시 404 에러를 반환해야 함', async () => {
            const response = await request(app)
                .get('/nonexistent')
                .expect('Content-Type', /json/)
                .expect(404);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error', '요청한 엔드포인트를 찾을 수 없습니다');
            expect(response.body).toHaveProperty('timestamp');
        });

        it('존재하지 않는 POST 엔드포인트 요청 시 404 에러를 반환해야 함', async () => {
            const response = await request(app)
                .post('/nonexistent')
                .send({ test: 'data' })
                .expect('Content-Type', /json/)
                .expect(404);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('CORS 및 보안 헤더', () => {
        it('CORS 헤더가 포함되어야 함', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.headers).toHaveProperty('access-control-allow-origin');
        });

        it('보안 헤더(helmet)가 포함되어야 함', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            // Helmet이 설정하는 기본 보안 헤더 확인
            expect(response.headers).toHaveProperty('x-dns-prefetch-control');
        });
    });
});
