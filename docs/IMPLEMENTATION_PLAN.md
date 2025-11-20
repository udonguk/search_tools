# n8n HTTP API 구현 플랜

## 프로젝트 개요
현재 CLI 기반 검색 도구를 n8n에서 HTTP 요청으로 사용할 수 있는 REST API 서버로 변환합니다.

## 목표
- Express.js를 사용한 HTTP 서버 구축
- RESTful API 엔드포인트 제공
- n8n HTTP Request 노드와의 통합
- Docker 환경에서 안정적인 실행

## 기술 스택
- **웹 프레임워크**: Express.js
- **런타임**: Node.js 18
- **컨테이너**: Docker & Docker Compose
- **API 형식**: REST API (JSON)

## 구현 단계

### 1단계: 프로젝트 구조 재설계
- [x] `src/` 디렉토리 생성
- [x] 기존 `index.js`를 `src/search.js`로 분리 (검색 로직)
- [x] `src/server.js` 생성 (Express 서버)
- [x] `src/routes/` 디렉토리 생성 (라우트 관리)

**예상 구조:**
```
search_tools/
├── src/
│   ├── server.js          # Express 서버 메인
│   ├── search.js          # 검색 로직 모듈
│   └── routes/
│       └── search.js      # 검색 API 라우트
├── index.js               # 서버 진입점
├── package.json
├── Dockerfile
└── docker-compose.yml
```

### 2단계: Express 서버 구축
- [x] Express.js 및 필요한 미들웨어 설치
  - `express`
  - `cors` (CORS 처리)
  - `helmet` (보안)
  - `morgan` (로깅)
- [x] 기본 Express 서버 설정
- [x] 헬스체크 엔드포인트 구현 (`GET /health`)
- [x] 에러 핸들링 미들웨어 구현

### 3단계: 검색 API 엔드포인트 구현
- [x] `POST /api/search` 엔드포인트 구현
  - **요청 본문:**
    ```json
    {
      "query": "검색어",
      "options": {
        "enableNaverBlog": true,
        "enableNaverNews": true,
        "enableGoogle": true
      }
    }
    ```
  - **응답 형식:**
    ```json
    {
      "success": true,
      "query": "검색어",
      "timestamp": "2025-11-19T...",
      "totalResults": 15,
      "results": [...]
    }
    ```
- [x] 입력 유효성 검사 (query 필수, options 선택)
- [x] 에러 응답 처리

### 4단계: 추가 API 엔드포인트
- [x] `GET /api/search?q=검색어` 엔드포인트 (간단한 GET 요청)
- [x] `GET /api/sources` 엔드포인트 (사용 가능한 검색 소스 목록)
- [x] API 문서 엔드포인트 (`GET /api/docs` 또는 `GET /`)

### 5단계: Docker 설정 업데이트
- [x] `Dockerfile` 수정
  - 포트 노출 (예: 3000)
  - 서버 실행 명령어로 변경
  - 헬스체크 설정 추가
- [x] `docker-compose.yml` 업데이트
  - 포트 매핑 추가 (3000:3000)
  - 환경 변수 설정
  - 헬스체크 설정
  - restart 정책 추가
- [x] `.dockerignore` 파일 생성
- [x] 개발 모드를 위한 볼륨 마운트 설정

### 6단계: 환경 변수 및 설정 관리
- [x] 포트 번호를 환경 변수로 관리
- [x] `.env.example` 파일 생성
- [x] 환경 변수 검증 로직 추가 (서버 시작 시 자동 검증)

### 7단계: 로깅 및 모니터링
- [x] Morgan을 사용한 HTTP 요청 로깅
- [x] 검색 요청/응답 로깅 (검색 시작, 완료, 소요시간)
- [x] 에러 로깅 개선 (소요시간 포함)

### 8단계: 테스트 및 검증
- [x] 로컬 환경에서 서버 실행 테스트
- [x] Docker 환경에서 서버 실행 테스트
- [x] 각 API 엔드포인트 테스트
  - curl을 사용한 테스트 완료
  - Jest/Supertest를 사용한 자동화 테스트 완료
- [ ] n8n HTTP Request 노드에서 연동 테스트 (사용자 환경에서 테스트 필요)

### 9단계: 문서화
- [x] `README.md` 생성
  - API 엔드포인트 문서 완료
  - 요청/응답 예시 완료
  - n8n 연동 방법 완료
  - curl 사용 예시 추가
  - 문제 해결 가이드 추가
- [x] API 사용 예시 추가
- [x] `CLAUDE.md` 업데이트

### 10단계: 선택적 개선사항
- [ ] Rate limiting 추가 (요청 제한)
- [ ] API 키 인증 추가 (선택)
- [ ] 캐싱 메커니즘 추가
- [ ] 검색 결과를 파일로 저장하는 옵션 API 추가

## API 명세 (초안)

### 1. 통합 검색
**Endpoint:** `POST /api/search`

**요청:**
```json
{
  "query": "LangChain",
  "options": {
    "enableNaverBlog": true,
    "enableNaverNews": true,
    "enableGoogle": true
  }
}
```

**응답 (성공):**
```json
{
  "success": true,
  "query": "LangChain",
  "timestamp": "2025-11-19T10:30:45.123Z",
  "totalResults": 15,
  "results": [
    {
      "source": "Naver Blog",
      "title": "LangChain 시작하기",
      "link": "https://...",
      "description": "..."
    }
  ]
}
```

**응답 (에러):**
```json
{
  "success": false,
  "error": "검색어가 필요합니다",
  "timestamp": "2025-11-19T10:30:45.123Z"
}
```

### 2. 간단한 검색 (GET)
**Endpoint:** `GET /api/search?q=LangChain`

**응답:** POST와 동일 (모든 소스 활성화)

### 3. 헬스체크
**Endpoint:** `GET /health`

**응답:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-19T10:30:45.123Z"
}
```

### 4. 사용 가능한 소스 목록
**Endpoint:** `GET /api/sources`

**응답:**
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

## n8n 연동 방법 (예상)

### HTTP Request 노드 설정
1. **Method**: POST
2. **URL**: `http://localhost:3000/api/search`
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

## 환경 변수

```env
# 서버 설정
PORT=3000
NODE_ENV=production

# 네이버 API
NAVER_CLIENT_ID=your_client_id
NAVER_CLIENT_SECRET=your_client_secret

# 구글 API
GOOGLE_API_KEY=your_api_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
```

## 보안 고려사항
- [ ] CORS 설정 (n8n 도메인 허용)
- [ ] Helmet.js로 기본 보안 헤더 설정
- [ ] Rate limiting (선택)
- [ ] API 키 인증 (선택)
- [ ] 환경 변수 검증

## 성능 고려사항
- [ ] 동시 검색 요청 처리 (Promise.all 유지)
- [ ] 타임아웃 설정
- [ ] 에러 재시도 로직 (선택)

## 테스트 체크리스트
- [ ] 각 검색 소스 개별 테스트
- [ ] 모든 소스 통합 검색 테스트
- [ ] 잘못된 요청 처리 테스트
- [ ] 환경 변수 누락 시 동작 테스트
- [ ] Docker 컨테이너 실행 테스트
- [ ] n8n 연동 테스트

## 예상 소요 시간
- 1-3단계: 기본 서버 구축 (1-2시간)
- 4-5단계: API 및 Docker 설정 (1시간)
- 6-7단계: 설정 및 로깅 (30분)
- 8-9단계: 테스트 및 문서화 (1시간)

**총 예상 시간: 3-4시간**

## 참고 자료
- Express.js 공식 문서: https://expressjs.com/
- n8n HTTP Request 노드: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/
- Docker Compose 문서: https://docs.docker.com/compose/
