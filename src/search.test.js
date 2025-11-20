const axios = require('axios');
const { search, searchNaverBlog, searchNaverNews, searchGoogle } = require('./search');

// axios 모킹
jest.mock('axios');

describe('검색 기능 테스트', () => {
    beforeEach(() => {
        // 각 테스트 전에 모든 mock을 초기화
        jest.clearAllMocks();
        // console.error 모킹 (테스트 출력을 깔끔하게 유지)
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        // console.error mock 복원
        console.error.mockRestore();
    });

    describe('searchNaverBlog', () => {
        it('네이버 블로그 검색이 정상적으로 동작해야 함', async () => {
            const mockResponse = {
                data: {
                    items: [
                        {
                            title: '<b>LangChain</b> 시작하기',
                            link: 'https://blog.naver.com/test',
                            description: '<b>LangChain</b>은 강력한 프레임워크입니다.'
                        }
                    ]
                }
            };

            axios.get.mockResolvedValue(mockResponse);

            const results = await searchNaverBlog('LangChain');

            expect(results).toHaveLength(1);
            expect(results[0]).toEqual({
                source: 'Naver Blog',
                title: 'LangChain 시작하기',
                link: 'https://blog.naver.com/test',
                description: 'LangChain은 강력한 프레임워크입니다.'
            });
        });

        it('API 에러 발생 시 빈 배열을 반환해야 함', async () => {
            axios.get.mockRejectedValue(new Error('API Error'));

            const results = await searchNaverBlog('test');

            expect(results).toEqual([]);
        });
    });

    describe('searchNaverNews', () => {
        it('네이버 뉴스 검색이 정상적으로 동작해야 함', async () => {
            const mockResponse = {
                data: {
                    items: [
                        {
                            title: '<b>LangChain</b> 최신 뉴스',
                            link: 'https://news.naver.com/proxy',
                            originallink: 'https://originalnews.com/article',
                            description: '최신 <b>LangChain</b> 소식'
                        }
                    ]
                }
            };

            axios.get.mockResolvedValue(mockResponse);

            const results = await searchNaverNews('LangChain');

            expect(results).toHaveLength(1);
            expect(results[0]).toEqual({
                source: 'Naver News',
                title: 'LangChain 최신 뉴스',
                link: 'https://originalnews.com/article',
                description: '최신 LangChain 소식'
            });
        });

        it('originallink가 없으면 link를 사용해야 함', async () => {
            const mockResponse = {
                data: {
                    items: [
                        {
                            title: '뉴스 제목',
                            link: 'https://news.naver.com/article',
                            description: '뉴스 설명'
                        }
                    ]
                }
            };

            axios.get.mockResolvedValue(mockResponse);

            const results = await searchNaverNews('test');

            expect(results[0].link).toBe('https://news.naver.com/article');
        });
    });

    describe('searchGoogle', () => {
        it('구글 검색이 정상적으로 동작해야 함', async () => {
            const mockResponse = {
                data: {
                    items: [
                        {
                            title: 'LangChain Documentation',
                            link: 'https://langchain.com',
                            snippet: 'LangChain official documentation'
                        }
                    ]
                }
            };

            axios.get.mockResolvedValue(mockResponse);

            const results = await searchGoogle('LangChain');

            expect(results).toHaveLength(1);
            expect(results[0]).toEqual({
                source: 'Google Search',
                title: 'LangChain Documentation',
                link: 'https://langchain.com',
                description: 'LangChain official documentation'
            });
        });

        it('검색 결과가 없으면 빈 배열을 반환해야 함', async () => {
            const mockResponse = {
                data: {}
            };

            axios.get.mockResolvedValue(mockResponse);

            const results = await searchGoogle('test');

            expect(results).toEqual([]);
        });
    });

    describe('search (통합 검색)', () => {
        it('모든 소스가 활성화된 경우 모든 결과를 반환해야 함', async () => {
            const mockNaverBlogResponse = {
                data: { items: [{ title: 'Blog', link: 'http://blog', description: 'blog desc' }] }
            };
            const mockNaverNewsResponse = {
                data: { items: [{ title: 'News', link: 'http://news', description: 'news desc' }] }
            };
            const mockGoogleResponse = {
                data: { items: [{ title: 'Google', link: 'http://google', snippet: 'google desc' }] }
            };

            axios.get
                .mockResolvedValueOnce(mockNaverBlogResponse)
                .mockResolvedValueOnce(mockNaverNewsResponse)
                .mockResolvedValueOnce(mockGoogleResponse);

            const results = await search('test');

            expect(results).toHaveLength(3);
            expect(results[0].source).toBe('Naver Blog');
            expect(results[1].source).toBe('Naver News');
            expect(results[2].source).toBe('Google Search');
        });

        it('특정 소스만 활성화된 경우 해당 소스의 결과만 반환해야 함', async () => {
            const mockGoogleResponse = {
                data: { items: [{ title: 'Google', link: 'http://google', snippet: 'google desc' }] }
            };

            axios.get.mockResolvedValue(mockGoogleResponse);

            const results = await search('test', {
                enableNaverBlog: false,
                enableNaverNews: false,
                enableGoogle: true
            });

            expect(results).toHaveLength(1);
            expect(results[0].source).toBe('Google Search');
        });

        it('일부 소스에서 에러가 발생해도 다른 소스의 결과는 반환해야 함', async () => {
            const mockGoogleResponse = {
                data: { items: [{ title: 'Google', link: 'http://google', snippet: 'google desc' }] }
            };

            axios.get
                .mockRejectedValueOnce(new Error('Naver Blog Error'))
                .mockRejectedValueOnce(new Error('Naver News Error'))
                .mockResolvedValueOnce(mockGoogleResponse);

            const results = await search('test');

            expect(results).toHaveLength(1);
            expect(results[0].source).toBe('Google Search');
        });
    });
});
