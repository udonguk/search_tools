require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const searchRoutes = require('./routes/search');

// 환경 변수 검증
function validateEnvVars() {
    const requiredVars = {
        NAVER_CLIENT_ID: process.env.NAVER_CLIENT_ID,
        NAVER_CLIENT_SECRET: process.env.NAVER_CLIENT_SECRET,
        GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
        GOOGLE_SEARCH_ENGINE_ID: process.env.GOOGLE_SEARCH_ENGINE_ID
    };

    const missingVars = Object.entries(requiredVars)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

    if (missingVars.length > 0) {
        console.warn(`⚠️  경고: 다음 환경 변수가 설정되지 않았습니다: ${missingVars.join(', ')}`);
        console.warn('⚠️  일부 검색 기능이 제대로 작동하지 않을 수 있습니다.');
        console.warn('⚠️  .env 파일을 확인하거나 .env.example을 참고하세요.');
    }
}

// 환경 변수 검증 실행
validateEnvVars();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(helmet()); // 보안 헤더
app.use(cors()); // CORS 활성화
app.use(morgan('dev')); // HTTP 요청 로깅
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL-encoded 파싱

// API 라우트
app.use('/api', searchRoutes);

// 헬스체크
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// 기본 라우트
app.get('/', (req, res) => {
    res.json({
        message: 'Search API Server',
        version: '1.0.0',
        endpoints: {
            health: 'GET /health',
            search: 'POST /api/search',
            searchGet: 'GET /api/search?q=검색어',
            sources: 'GET /api/sources'
        }
    });
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || '서버 오류가 발생했습니다',
        timestamp: new Date().toISOString()
    });
});

// 404 핸들러
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: '요청한 엔드포인트를 찾을 수 없습니다',
        timestamp: new Date().toISOString()
    });
});

// 서버 시작
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다`);
        console.log(`📍 Health Check: http://localhost:${PORT}/health`);
        console.log(`📍 API Info: http://localhost:${PORT}/`);
    });
}

module.exports = app;
