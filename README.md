# Search Tools API

네이버 블로그, 네이버 뉴스, 구글 검색을 통합하여 제공하는 REST API 서버입니다. n8n HTTP Request 노드와의 연동을 위해 설계되었습니다.

## 주요 기능

- 🔍 **다중 소스 검색**: 네이버 블로그, 네이버 뉴스, 구글 검색 통합
- 🚀 **RESTful API**: Express.js 기반의 간단하고 직관적인 API
- 🔒 **보안**: Helmet.js를 통한 보안 헤더 설정, CORS 지원
- 📊 **로깅**: Morgan을 통한 HTTP 요청 로깅 및 상세한 검색 로그
- 🐳 **Docker 지원**: Docker Compose로 간편한 배포
- ✅ **테스트**: Jest와 Supertest를 활용한 전체 테스트 커버리지

## 기술 스택

- **웹 프레임워크**: Express.js 5.x
- **런타임**: Node.js 18
- **컨테이너**: Docker & Docker Compose
- **테스트**: Jest, Supertest
- **보안**: Helmet, CORS
- **로깅**: Morgan

## 프로젝트 구조

```
search_tools/
├── src/
│   ├── server.js           # Express 서버 메인
│   ├── search.js           # 검색 로직 모듈
│   ├── search.test.js      # 검색 기능 테스트
│   ├── server.test.js      # 서버 테스트
│   └── routes/
│       ├── search.js       # 검색 API 라우트
│       └── search.test.js  # 라우트 테스트
├── docs/
│   └── IMPLEMENTATION_PLAN.md  # 구현 계획 문서
├── package.json
├── Dockerfile
├── docker-compose.yml
├── .env                    # 환경 변수 (git ignored)
├── .env.example            # 환경 변수 예시
├── .dockerignore
└── CLAUDE.md               # Claude Code 지침
```

## 설치 및 실행

### 환경 변수 설정

1. `.env.example` 파일을 복사하여 `.env` 파일을 생성합니다:

```bash
cp .env.example .env
```

2. `.env` 파일을 열어 API 키를 입력합니다:

```env
# 서버 설정
PORT=3000
NODE_ENV=development

# 네이버 API (https://developers.naver.com/apps/#/register)
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret

# 구글 API (https://developers.google.com/custom-search/v1/overview)
GOOGLE_API_KEY=your_google_api_key
GOOGLE_SEARCH_ENGINE_ID=your_google_search_engine_id
```

### 로컬 실행

```bash
# 의존성 설치
npm install

# 서버 실행
npm run server

# 개발 모드 (nodemon 사용 시)
npm run dev
```

서버가 실행되면 다음 URL에서 접근할 수 있습니다:
- 서버 정보: http://localhost:8833/
- 헬스체크: http://localhost:8833/health
- API 문서: 아래 API 명세 참조

### Docker 실행

```bash
# Docker Compose로 빌드 및 실행
docker-compose up --build

# 백그라운드 실행
docker-compose up -d

# 컨테이너 중지
docker-compose down
```

### 테스트 실행

```bash
# 전체 테스트 실행
npm test

# 테스트 watch 모드
npm run test:watch

# 커버리지 확인
npm run test:coverage
```

## API 명세

### 1. 헬스체크

서버 상태를 확인합니다.

**요청**
```http
GET /health
```

**응답**
```json
{
  "status": "ok",
  "timestamp": "2025-11-20T13:00:00.000Z"
}
```

### 2. 서버 정보

API 엔드포인트 목록을 확인합니다.

**요청**
```http
GET /
```

**응답**
```json
{
  "message": "Search API Server",
  "version": "1.0.0",
  "endpoints": {
    "health": "GET /health",
    "search": "POST /api/search",
    "searchGet": "GET /api/search?q=검색어",
    "sources": "GET /api/sources"
  }
}
```

### 3. 통합 검색 (POST)

검색어와 옵션을 지정하여 검색합니다.

**요청**
```http
POST /api/search
Content-Type: application/json

{
  "query": "LangChain",
  "options": {
    "enableNaverBlog": true,
    "enableNaverNews": true,
    "enableGoogle": true
  }
}
```

**파라미터**
- `query` (필수): 검색어 (문자열)
- `options` (선택): 검색 옵션
  - `enableNaverBlog` (기본값: true): 네이버 블로그 검색 활성화
  - `enableNaverNews` (기본값: true): 네이버 뉴스 검색 활성화
  - `enableGoogle` (기본값: true): 구글 검색 활성화

**성공 응답 (200 OK)**
```json
{
  "success": true,
  "query": "LangChain",
  "timestamp": "2025-11-20T13:00:00.000Z",
  "totalResults": 15,
  "results": [
    {
      "source": "Naver Blog",
      "title": "LangChain 시작하기",
      "link": "https://blog.naver.com/...",
      "description": "LangChain은 강력한 프레임워크입니다."
    },
    {
      "source": "Naver News",
      "title": "LangChain 최신 뉴스",
      "link": "https://news.naver.com/...",
      "description": "최신 LangChain 소식"
    },
    {
      "source": "Google Search",
      "title": "LangChain Documentation",
      "link": "https://langchain.com",
      "description": "LangChain official documentation"
    }
  ]
}
```

**에러 응답 (400 Bad Request)**
```json
{
  "success": false,
  "error": "검색어(query)가 필요합니다",
  "timestamp": "2025-11-20T13:00:00.000Z"
}
```

### 4. 간단한 검색 (GET)

쿼리 파라미터로 간단하게 검색합니다. 모든 소스가 자동으로 활성화됩니다.

**요청**
```http
GET /api/search?q=LangChain
```

**파라미터**
- `q` (필수): 검색어 (문자열)

**응답**
```json
{
  "success": true,
  "query": "LangChain",
  "timestamp": "2025-11-20T13:00:00.000Z",
  "totalResults": 15,
  "results": [...]
}
```

### 5. 검색 소스 목록

사용 가능한 검색 소스 목록을 확인합니다.

**요청**
```http
GET /api/sources
```

**응답**
```json
{
  "sources": [
    {
      "id": "naver_blog",
      "name": "Naver Blog",
      "enabled": true
    },
    {
      "id": "naver_news",
      "name": "Naver News",
      "enabled": true
    },
    {
      "id": "google",
      "name": "Google Search",
      "enabled": true
    }
  ]
}
```

## curl 사용 예시

### 헬스체크
```bash
curl http://localhost:8833/health
```

### GET 방식 검색
```bash
curl "http://localhost:8833/api/search?q=LangChain"
```

### POST 방식 검색
```bash
curl -X POST http://localhost:8833/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "LangChain",
    "options": {
      "enableNaverBlog": true,
      "enableNaverNews": true,
      "enableGoogle": true
    }
  }'
```

### 특정 소스만 활성화
```bash
curl -X POST http://localhost:8833/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "LangChain",
    "options": {
      "enableNaverBlog": false,
      "enableNaverNews": false,
      "enableGoogle": true
    }
  }'
```

## n8n 연동 가이드

### HTTP Request 노드 설정

1. **Method**: POST
2. **URL**: `http://localhost:8833/api/search`
3. **Body Content Type**: JSON
4. **Body**:
```json
{
  "query": "{{ $json.searchQuery }}",
  "options": {
    "enableNaverBlog": true,
    "enableNaverNews": true,
    "enableGoogle": true
  }
}
```

### 워크플로우 예시

```
[Webhook/Trigger]
    ↓
[Set Node] - 검색어 설정
    ↓
[HTTP Request] - Search API 호출
    ↓
[Function/Code] - 결과 처리
    ↓
[Output Node] - 결과 저장/전송
```

### 응답 데이터 접근

n8n에서 API 응답 데이터에 접근하는 방법:

```javascript
// 전체 결과 개수
{{ $json.totalResults }}

// 첫 번째 검색 결과 제목
{{ $json.results[0].title }}

// 모든 결과를 반복 처리
{{ $json.results }}
```

## 로깅

서버는 다음 항목들을 로깅합니다:

### HTTP 요청 로깅 (Morgan)
```
GET /api/search?q=test 200 880.123 ms - 7441
POST /api/search 200 46.791 ms - 2280
```

### 검색 로깅
```
[검색 시작] 검색어: "test", 옵션: { enableNaverBlog: true, ... }
[검색 완료] 검색어: "test", 결과: 20개, 소요시간: 880ms
[검색 에러] 소요시간: 100ms, 에러: Network timeout
```

### 환경 변수 검증
```
⚠️  경고: 다음 환경 변수가 설정되지 않았습니다: NAVER_CLIENT_ID, NAVER_CLIENT_SECRET
⚠️  일부 검색 기능이 제대로 작동하지 않을 수 있습니다.
```

## 보안

- **Helmet.js**: 다양한 보안 헤더 자동 설정
- **CORS**: Cross-Origin Resource Sharing 지원
- **환경 변수**: API 키를 환경 변수로 관리하여 보안 강화
- **입력 검증**: 모든 API 엔드포인트에서 입력 유효성 검사 수행

## 문제 해결

### API 키 관련 오류

```
⚠️  경고: 다음 환경 변수가 설정되지 않았습니다: NAVER_CLIENT_ID
```

**해결 방법**: `.env` 파일에 올바른 API 키를 설정하세요.

### 포트 충돌

```
Error: listen EADDRINUSE: address already in use :::3000
```

**해결 방법**:
1. 다른 포트를 사용: `.env` 파일에서 `PORT=3001`로 변경
2. 기존 프로세스 종료: `lsof -ti:3000 | xargs kill -9`

### Docker 컨테이너 빌드 실패

**해결 방법**:
```bash
# 캐시 없이 다시 빌드
docker-compose build --no-cache

# 이전 이미지 정리
docker system prune -a
```

## 라이선스

ISC

## 기여

이슈나 Pull Request는 언제든지 환영합니다!

## 문의

프로젝트 관련 문의사항은 이슈를 등록해주세요.
