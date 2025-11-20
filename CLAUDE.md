# CLAUDE.md

이 파일은 이 저장소의 코드로 작업할 때 Claude Code(claude.ai/code)에 대한 지침을 제공합니다.

## 언어 설정 (Language Settings)
- **주 언어**: 한국어 (Korean)
- 모든 응답, 문서(Markdown 포함), 주석은 한글로 작성합니다.

## 프로젝트 개요

네이버 블로그, 네이버 뉴스, 구글 검색을 통합하여 제공하는 REST API 서버입니다. n8n HTTP Request 노드와의 연동을 위해 설계되었으며, Express.js 기반의 RESTful API를 제공합니다.

## 개발 명령어

### 로컬 개발
```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 API 키를 입력하세요

# 서버 실행
npm run server

# 개발 모드 (nodemon 사용 시)
npm run dev

# 테스트 실행
npm test

# 테스트 watch 모드
npm run test:watch

# 커버리지 확인
npm run test:coverage
```

### Docker 개발
```bash
# Docker Compose로 빌드 및 실행
docker-compose up --build

# 백그라운드 실행
docker-compose up -d

# 컨테이너 중지
docker-compose down

# 로그 확인
docker-compose logs -f
```

## 아키텍처

### 프로젝트 구조
```
search_tools/
├── src/
│   ├── server.js           # Express 서버 메인 (환경 변수 검증 포함)
│   ├── search.js           # 검색 로직 모듈
│   ├── search.test.js      # 검색 기능 테스트
│   ├── server.test.js      # 서버 테스트
│   └── routes/
│       ├── search.js       # 검색 API 라우트 (로깅 포함)
│       └── search.test.js  # 라우트 테스트
├── docs/
│   └── IMPLEMENTATION_PLAN.md  # 구현 계획 문서
├── package.json
├── Dockerfile              # 포트 3000, 헬스체크 포함
├── docker-compose.yml      # 포트 매핑, 환경 변수, 헬스체크 설정
├── .env                    # 환경 변수 (git ignored)
├── .env.example            # 환경 변수 예시
├── .dockerignore
├── README.md               # 프로젝트 문서
└── CLAUDE.md               # Claude Code 지침 (이 파일)
```

### 기술 스택
- **웹 프레임워크**: Express.js 5.x
- **런타임**: Node.js 18
- **컨테이너**: Docker & Docker Compose
- **테스트**: Jest, Supertest
- **보안**: Helmet, CORS
- **로깅**: Morgan (HTTP 요청) + Custom (검색 로그)

### API 엔드포인트
- `GET /health` - 헬스체크
- `GET /` - API 정보
- `POST /api/search` - 통합 검색 (옵션 지정 가능)
- `GET /api/search?q=검색어` - 간단한 검색 (모든 소스 활성화)
- `GET /api/sources` - 검색 소스 목록

## 환경 변수

필수 환경 변수는 `.env` 파일에 설정해야 합니다:

```env
# 서버 설정
PORT=3000
NODE_ENV=development

# 네이버 API
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret

# 구글 API
GOOGLE_API_KEY=your_google_api_key
GOOGLE_SEARCH_ENGINE_ID=your_google_search_engine_id
```

서버 시작 시 환경 변수가 누락된 경우 경고 메시지를 출력합니다.

## 테스트

- **단위 테스트**: `src/search.test.js` - 검색 로직 테스트
- **통합 테스트**: `src/routes/search.test.js` - API 엔드포인트 테스트
- **서버 테스트**: `src/server.test.js` - Express 서버 테스트

모든 테스트는 Jest와 Supertest를 사용하여 작성되었으며, 총 28개의 테스트가 있습니다.

## 로깅

### HTTP 요청 로깅 (Morgan)
모든 HTTP 요청은 자동으로 로깅됩니다:
```
GET /api/search?q=test 200 880.123 ms - 7441
POST /api/search 200 46.791 ms - 2280
```

### 검색 로깅
검색 시작, 완료, 에러가 로깅됩니다:
```
[검색 시작] 검색어: "test", 옵션: { enableNaverBlog: true, ... }
[검색 완료] 검색어: "test", 결과: 20개, 소요시간: 880ms
[검색 에러] 소요시간: 100ms, 에러: Network timeout
```

## 보안

- **Helmet.js**: 보안 헤더 자동 설정
- **CORS**: Cross-Origin Resource Sharing 지원
- **환경 변수**: API 키를 환경 변수로 관리
- **입력 검증**: 모든 API 엔드포인트에서 입력 유효성 검사

## n8n 연동

이 API는 n8n HTTP Request 노드와 연동하여 사용할 수 있습니다:

1. Method: POST
2. URL: `http://localhost:3000/api/search`
3. Body: JSON
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

자세한 내용은 `README.md`의 "n8n 연동 가이드" 섹션을 참조하세요.

## 문서

- **README.md**: 사용자를 위한 전체 프로젝트 문서
- **docs/IMPLEMENTATION_PLAN.md**: 구현 계획 및 단계별 진행 상황
- **CLAUDE.md** (이 파일): Claude Code를 위한 개발 지침
