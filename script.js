// -*- coding: utf-8 -*-
document.addEventListener('DOMContentLoaded', function() {
    const content = document.getElementById('content');
    const links = document.querySelectorAll('nav a');
    const contentCache = {};
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    // 简繁体转换字典
    const simplifiedToTraditionalMap = {
        '简': '簡', '体': '體', '电': '電', '脑': '腦', '软': '軟', '件': '件',
        '发': '發', '开': '開', '无': '無', '时': '時', '从': '從', '这': '這',
        '业': '業', '计': '計', '划': '劃', '为': '為', '产': '產', '动': '動',
        // ... 添加更多映射
    };

    function simplifiedToTraditional(text) {
        return text.split('').map(char => simplifiedToTraditionalMap[char] || char).join('');
    }

    function stripHtml(html) {
        let tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }

    function generatePageTitle(page) {
        switch(page) {
            case 'home': return '首頁';
            case 'news': return '新消息';
            case 'events': return '活動計劃';
            case 'school-affairs': return '校内事務';
            case 'welfare': return '學生福利';
            case 'members': return '學生會名單';
            case 'contact': return '聯絡我們';
            default: return page;
        }
    }

    function search() {
        console.log("开始执行搜索");
        const searchTerm = searchInput.value.trim();
        console.log("搜索词:", searchTerm);
        
        if (searchTerm.length < 2) {
            alert('請輸入至少兩個字符進行搜索。');
            return;
        }

        const traditionalSearchTerm = simplifiedToTraditional(searchTerm.toLowerCase());
        const searchWords = jieba.cut(traditionalSearchTerm);

        let results = [];
        for (let page in contentCache) {
            const pageContent = stripHtml(contentCache[page]);
            const traditionalPageContent = simplifiedToTraditional(pageContent.toLowerCase());
            
            let score = 0;
            for (let word of searchWords) {
                if (traditionalPageContent.includes(word)) {
                    score += 1;
                }
            }

            if (score > 0) {
                const pageTitle = generatePageTitle(page);
                const snippet = generateSnippet(pageContent, searchWords);
                results.push({ page, pageTitle, snippet, score });
            }
        }

        results.sort((a, b) => b.score - a.score);
        console.log('搜索结果:', results);
        displaySearchResults(results, searchTerm);
        console.log('搜索完成');
    }

    function generateSnippet(content, searchWords) {
        const traditionalContent = simplifiedToTraditional(content.toLowerCase());
        let bestIndex = 0;
        let maxScore = 0;

        for (let i = 0; i < traditionalContent.length; i++) {
            let score = 0;
            for (let word of searchWords) {
                if (traditionalContent.slice(i).startsWith(word)) {
                    score += word.length;
                }
            }
            if (score > maxScore) {
                maxScore = score;
                bestIndex = i;
            }
        }

        const start = Math.max(0, bestIndex - 50);
        const end = Math.min(content.length, bestIndex + 100);
        return '...' + content.slice(start, end) + '...';
    }

    function highlightSearchTerm(text, searchTerm) {
        const traditionalText = simplifiedToTraditional(text.toLowerCase());
        const searchWords = jieba.cut(simplifiedToTraditional(searchTerm.toLowerCase()));
        let result = text;

        for (let word of searchWords) {
            const regex = new RegExp(word, 'gi');
            result = result.replace(regex, match => `<mark>${match}</mark>`);
        }

        return result;
    }

    function displaySearchResults(results, searchTerm) {
        if (results.length === 0) {
            content.innerHTML = `<h2>搜索結果</h2><p>未找到與 "${searchTerm}" 相關的結果。</p>`;
            return;
        }

        let resultsHtml = `<h2>搜索結果</h2><p>找到 ${results.length} 個與 "${searchTerm}" 相關的結果：</p>`;
        results.forEach(result => {
            resultsHtml += `
                <div class="search-result">
                    <h3><a href="#${result.page}" onclick="loadContentAndUpdateURL('${result.page}'); return false;">${result.pageTitle}</a></h3>
                    <p>${highlightSearchTerm(result.snippet, searchTerm)}</p>
                </div>
            `;
        });
        content.innerHTML = resultsHtml;
    }

    // 预加载所有内容
    function preloadContent() {
        links.forEach(link => {
            const page = link.getAttribute('href').substr(1);
            contentCache[page] = generateContent(page);
        });
    }

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.closest('a').getAttribute('href').substr(1);
            loadContentAndUpdateURL(page);
        });
    });

    function setActiveLink(activeLink) {
        links.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    }

    function loadContent(page) {
        content.classList.add('fade-out');
        setTimeout(() => {
            content.innerHTML = contentCache[page] || generateContent(page);
            content.classList.remove('fade-out');
            content.classList.add('fade-in');
            
            // 添加新的动画效果
            const elements = content.querySelectorAll('h2, h3, p, .event-card, .member-card');
            elements.forEach((el, index) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    el.style.transition = 'opacity 0.5s, transform 0.5s';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, index * 100);
            });

            setTimeout(() => {
                content.classList.remove('fade-in');
            }, 300);

            if (page === 'home') {
                setupImageCarousel();
            }
        }, 150);
    }

    function loadContentAndUpdateURL(page) {
        loadContent(page);
        const activeLink = document.querySelector('nav a[href="#' + page + '"]');
        if (activeLink) {
            setActiveLink(activeLink);
        }
        history.pushState(null, '', '#' + page);
    }

    function generateContent(page) {
        switch(page) {
            case 'home':
                return `
                <h2>歡迎來到 Champions！候選內閣</h2>
                <p>我們是一群充滿熱情和理想的學生，致力於為全體同學提供優質的服務，促進校園文化建設，豐富學生生活。</p>
                <p class="slogan"><strong>我們的競選口號是：</strong></p>
                <p class="slogan-highlight">「探索Champions，成為Champions，超越Champions」</p>
                </div>
                
                <h3 class="section-title">競選目標</h3>
                <p>Champions學生會的核心競選目標是實現"娛樂與學術兼並"，為我校學生創造一個充滿活力、創新與支持的校園環境。我們相信，學術與娛樂並非對立，而是可以相輔相成，讓學生在輕鬆愉快的氛圍中，提升學習效果和品質。</p>
                <h4 class="blue-text">1. 增強學術資源與支持</h4>
                <p>我們將積極擴大學術資源，為同學們提供更豐富、更靈活的學習機會，包括與其他學校交換模擬卷、設立"圖書館補習員"計劃，並引入"數學小鎮"活動，為常見學術問題提供實時解答，幫助同學們應對學習中的各種挑戰。</p>
                <h4 class="blue-text">2. 促進娛樂與學術的結合</h4>
                <p>我們將策劃一系列創新活動，讓同學們在娛樂中找到學術的樂趣。我們將舉辦學科比賽、校內外聯合文化活動，以及創意學習工作坊，讓學生們在參與中激發創造力，同時加強對學科知識的理解和應用。</p>
                <h4 class="blue-text">3. 加強對外聯繫與合作</h4>
                <p>Champions學生會將打破僅側重校內事務的傳統，積極促進對外交流與合作。我們將組織與其他學校的學術和文化交流活動，為同學們提供拓展視野、增強社會實踐能力的機會。同時，我們會與外部機構合作，引入更多升學和職業規劃指導，幫助同學們更好地為未來做準備</p>
                <h4 class="blue-text">4. 提升校園歸屬感與學生權益</h4>
                <p>我們將不斷改善校園設施，在校園內推動多關於學生權益的活動，使每一位同學都能感受到被重視和尊重。我們還將開展定期調查，傾聽同學們的需求與建議，確保學生會的每一項工作都切實服務於同學的利益。</p>
                <p><strong>Champions學生會以<span class="blue-text">「探索Champions，成為Champions，超越Champions」</span>的精神，致力於在學術與娛樂中促進每位同學的成長，激發他們探索潛能、實現夢想並突破自我。</strong></p>
                `;
            case 'news':
                return '<h2><i class="fas fa-newspaper"></i> 最新消息</h2>' +
                    '<ul class="news-list">' +
                    '<li><h3>Champions！候選內閣宣傳活動即將開始</h3>' +
                    '<p><i class="far fa-calendar-alt"></i> 日期：2024年9月27日</p>' +
                    '<p>我們誠摯邀請所有同學參與 Champions！候選內閣的首次宣傳活動。屆時我們將介紹我們的理念、目標和計劃。讓我們一起探索如何為學校帶來積極的改變！</p></li>' +
                    '<li><h3>學生會選舉即將開始</h3>' +
                    '<p><i class="far fa-calendar-alt"></i> 日期：2024年10月16日</p>' +
                    '<p>學生會選舉將於10月16正式開始。我們鼓勵所有學積極參與，為自己心目中的最佳候選內閣投下寶貴的一票。讓我們一起塑造學的未來！</p></li>' +
                    '</ul>';
            case 'events':
                return `
                <h2 style="margin-bottom: 1.5em;"><i class="fas fa-calendar-alt"></i> 活動計劃</h2>
                <div class="event-list">
                    <div class="event-card">
                        <h3>9月27號 – 宣傳期第一天</h3>
                        <p><strong>活動主題：</strong>「探尋Champions!」 （Champions! Discovery Day）</p>
                        <p><strong>時間安排：</strong></p>
                        <ul>
                            <li>上課前：宣傳、派發宣傳物資、廣播介紹午息活動。</li>
                            <li>午息：進行「Champions!免費影即有體驗」、張貼海報。</li>
                            <li>放學後：在學校門口宣傳，follow IG，發放宣傳物品（糖）。</li>
                        </ul>
                        <p class="countdown-container">
                            <span class="countdown-label">倒計時：</span>
                            <span class="countdown" data-target="2024-09-27">${calculateCountdown('2024-09-27')}</span>
                        </p>
                    </div>
                    <div class="event-card">
                        <h3>9月28號 – 宣傳期第二天</h3>
                        <p><strong>活動主題：</strong>「Champions!傳奇揭幕」 （Champions! Legend Unveiled）</p>
                        <p><strong>時間安排：</strong></p>
                        <ul>
                            <li>上課前：宣傳、派發宣傳資、廣播介紹午息活動。</li>
                            <li>放學後：在校門口宣傳，follow IG，發放宣傳物品（糖、紙巾）。</li>
                        </ul>
                        <p class="countdown-container">
                            <span class="countdown-label">倒計時：</span>
                            <span class="countdown" data-target="2024-09-28">${calculateCountdown('2024-09-28')}</span>
                        </p>
                    </div>
                    <div class="event-card">
                        <h3>10月2號 – 宣傳期第三天</h3>
                        <p><strong>活動主題：</strong>「Champions!之路：啟程，成就，超越」（Champions!:Embark,Achieve,Surpass）</p>
                        <p><strong>時間安排：</strong></p>
                        <ul>
                            <li>上課前：禮堂播宣傳片、宣傳活。</li>
                            <li>午息：進行「三分戰神」挑戰，先在IG私信報名，挑戰成功的同學可以獲得Champions!紀念品和雪糕，並且進行合照，同時在SAC可以獲得「Champions!免費即影即有體驗」、張貼海報。</li>
                        </ul>
                        <p class="countdown-container">
                            <span class="countdown-label">倒計時：</span>
                            <span class="countdown" data-target="2024-10-02">${calculateCountdown('2024-10-02')}</span>
                        </p>
                    </div>
                    <div class="event-card">
                        <h3>10月3日 – 宣傳期第四天</h3>
                        <p><strong>活動主題：</strong>「Champions!運動日」（Champions! Sports Day）</p>
                        <p><strong>時間安排：</strong></p>
                        <ul>
                            <li>上課前：學生會成員穿著運動裝，進行簡單的運動宣傳，派發宣傳單張和糖果，介紹午息的趣味活動。</li>
                            <li>午息：舉辦「健康知識快問快，同答與運動或健康相關的小問題，答對的可獲得專屬筆或糖果。同時在SAC進行即影即有拍攝，並發放糖果和紙巾。</li>
                            <li>放學後：門口宣傳，follow IG，發放宣傳物品（糖果和紙巾），鼓勵大家參與接下來的活動。</li>
                        </ul>
                        <p class="countdown-container">
                            <span class="countdown-label">倒計時：</span>
                            <span class="countdown" data-target="2024-10-03">${calculateCountdown('2024-10-03')}</span>
                        </p>
                    </div>
                    <div class="event-card">
                        <h3>10月4號 – 宣傳期第五天</h3>
                        <p><strong>活動主題：</strong>「Champions!之路：追求，创造，征服」（Champions!:Pursue, Create, Conquer）</p>
                        <p><strong>時間安排：</strong></p>
                        <ul>
                            <li>上課前：宣傳、派發宣傳物資、廣播介紹午息活動。</li>
                            <li>午息：舉辦午間旋律」，可以邀請老師或者同學，可以點歌亦可以坐着聽歌、聊天。如果有同學有興趣可以上去唱歌，一起帶動氣氛。同時進行random dance隨機舞蹈。在SAC可以獲得「Champions!免費即影即有體驗」、派發宣傳品、發布寶遊戲的線索與點信息。</li>
                            <li>放學後：在學校門口宣傳，follow IG，發放宣傳物品（糖）。</li>
                        </ul>
                        <p class="countdown-container">
                            <span class="countdown-label">倒計時：</span>
                            <span class="countdown" data-target="2024-10-04">${calculateCountdown('2024-10-04')}</span>
                        </p>
                    </div>
                    <div class="event-card">
                        <h3>10月7號 – 宣傳期第六天</h3>
                        <p><strong>動主題：</strong>「Champions!尋寶遊戲」（Champions! Treasure Hunt）</p>
                        <p><strong>時間安排：</strong></p>
                        <ul>
                            <li>上課前：宣傳��派發宣傳物資、重申尋寶遊戲的線索與起點信息（全校學生可以自由參與</li>
                            <li>小息：繼續尋寶遊戲，並引導參與者在校園內不同地尋找線索，解答問題。</li>
                            <li>午息：在操場進行random dance隨機舞蹈，邀請舞社的同學前來表演。</li>
                            <li>放學後：在學校門口宣傳，follow IG，發放宣傳物品（糖）。</li>
                        </ul>
                        <p class="countdown-container">
                            <span class="countdown-label">倒計時：</span>
                            <span class="countdown" data-target="2024-10-07">${calculateCountdown('2024-10-07')}</span>
                        </p>
                    </div>
                    <div class="event-card">
                        <h3>10月8日 宣傳期第七天</h3>
                        <p><strong>活動主題：</strong>「Champions!創意日」（Champions! Creativity Day）</p>
                        <p><strong>時間安排：</strong></p>
                        <ul>
                            <li>上課前：發筆和宣傳單張，介紹午息的創意活動。</li>
                            <li>午息：進行「趣味猜詞比賽」，學生會成員選擇一些與學生會、學校或流行文化相關的詞語，讓參與者進行猜詞遊戲。答對的同學可獲得筆或糖果。</li>
                            <li>放學後：門口宣傳，follow IG，發放筆、糖果和紙巾</li>
                        </ul>
                        <p class="countdown-container">
                            <span class="countdown-label">倒計時：</span>
                            <span class="countdown" data-target="2024-10-08">${calculateCountdown('2024-10-08')}</span>
                        </p>
                    </div>
                    <div class="event-card">
                        <h3>10月9日  宣傳期第八天</h3>
                        <p><strong>活動主題：</strong>「Champions!決戰」（Champions! Showdown Day）</p>
                        <p><strong>時間安排：</strong></p>
                        <ul>
                            <li>上課前：派發投票指南和筆，介紹午息的學術對決活動。</li>
                            <li>放學後：門口宣傳，follow IG，發放糖果和紙巾，提醒同學積極參與接下來的投票。</li>
                        </ul>
                        <p class="countdown-container">
                            <span class="countdown-label">倒計時：</span>
                            <span class="countdown" data-target="2024-10-09">${calculateCountdown('2024-10-09')}</span>
                        </p>
                    </div>
                    <div class="event-card">
                        <h3>10月10號 – 宣傳期第九天</h3>
                        <p><strong>活動主題：</strong>最終拉票（Final Campaign）</p>
                        <p><strong>時間安排：</strong></p>
                        <ul>
                            <li>上課前：最終宣傳、派發宣傳物資。</li>
                            <li>午息：在禮堂設置「Champions!攤位活動」，設置數學題目、中文詩詞、估歌仔變成攤位，例如搭幾張枱凳，開中央咪宣傳。參與的同學可以獲得「Champions!免費即影即有體驗」</li>
                            <li>放學後：在學校門口宣傳，follow IG，發放宣傳物品（糖）。</li>
                        </ul>
                        <p class="countdown-container">
                            <span class="countdown-label">倒計時：</span>
                            <span class="countdown" data-target="2024-10-10">${calculateCountdown('2024-10-10')}</span>
                        </p>
                    </div>
                </div>
                `;
            case 'school-affairs':
                const schoolAffairsStyle = document.createElement('style');
                schoolAffairsStyle.textContent = `
                    .school-affairs-container {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 20px;
                        padding: 20px;
                    }
                    .activity-card {
                        background-color: #ffffff;
                        border-radius: 10px;
                        padding: 15px;
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                        transition: all 0.3s ease;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }
                    .activity-card:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                    }
                    .activity-icon {
                        font-size: 2em;
                        margin-bottom: 10px;
                        color: #007bff;
                    }
                    .activity-title {
                        font-size: 1.1em;
                        font-weight: bold;
                        margin-bottom: 5px;
                        text-align: center;
                    }
                    .activity-description {
                        font-size: 0.9em;
                        text-align: center;
                        color: #666;
                    }
                    .activity-section {
                        margin-bottom: 30px;
                    }
                    .activity-section-title {
                        font-size: 1.3em;
                        color: #007bff;
                        margin-bottom: 15px;
                        border-bottom: 2px solid #007bff;
                        padding-bottom: 5px;
                    }
                `;
                document.head.appendChild(schoolAffairsStyle);

                return `
                    <h2><i class="fas fa-school"></i> 校內事務</h2>
                    <p>同學們應關心本校事務，學生會不僅是學生的代表，也應積極參與學校事務。Champions抱持開放態度，不僅為學生發聲，還鼓勵大家親自參與。</p>
                    
                    <div class="activity-section">
                        <h3 class="activity-section-title">多元活動、動靜皆宜</h3>
                        <div class="school-affairs-container">
                            <div class="activity-card">
                                <i class="fas fa-feather-alt activity-icon"></i>
                                <div class="activity-title">羽毛球比賽</div>
                                <div class="activity-description">展現你的球技，與同學切磋</div>
                            </div>
                            <div class="activity-card">
                                <i class="fas fa-basketball-ball activity-icon"></i>
                                <div class="activity-title">三人籃球</div>
                                <div class="activity-description">組隊參加，享受籃球的樂趣</div>
                            </div>
                            <div class="activity-card">
                                <i class="fas fa-volleyball-ball activity-icon"></i>
                                <div class="activity-title">排球比賽</div>
                                <div class="activity-description">團隊合作，共創佳績</div>
                            </div>
                            <div class="activity-card">
                                <i class="fas fa-ghost activity-icon"></i>
                                <div class="activity-title">萬聖節 trick or treat</div>
                                <div class="activity-description">體驗西方節日文化</div>
                            </div>
                            <div class="activity-card">
                                <i class="fas fa-gifts activity-icon"></i>
                                <div class="activity-title">聖誕聯歡</div>
                                <div class="activity-description">共度歡樂聖誕時光</div>
                            </div>
                            <div class="activity-card">
                                <i class="fas fa-search-dollar activity-icon"></i>
                                <div class="activity-title">尋找利是</div>
                                <div class="activity-description">新年活動，樂趣無窮</div>
                            </div>
                            <div class="activity-card">
                                <i class="fas fa-music activity-icon"></i>
                                <div class="activity-title">Random dance</div>
                                <div class="activity-description">隨機舞蹈，展現你的舞姿</div>
                            </div>
                            <div class="activity-card">
                                <i class="fas fa-egg activity-icon"></i>
                                <div class="activity-title">Easter尋蛋</div>
                                <div class="activity-description">復活節尋蛋活動</div>
                            </div>
                            <div class="activity-card">
                                <i class="fas fa-gamepad activity-icon"></i>
                                <div class="activity-title">電競比賽</div>
                                <div class="activity-description">展現你的遊戲技巧</div>
                            </div>
                            <div class="activity-card">
                                <i class="fas fa-user-friends activity-icon"></i>
                                <div class="activity-title">迎新活動</div>
                                <div class="activity-description">歡迎新同學加入我們的大家庭</div>
                            </div>
                            <div class="activity-card">
                                <i class="fas fa-microphone activity-icon"></i>
                                <div class="activity-title">歌唱賽</div>
                                <div class="activity-description">展現你的歌喉，成為校園歌手</div>
                            </div>
                        </div>
                    </div>

                    <div class="activity-section">
                        <h3 class="activity-section-title">學術發展、開發潛能</h3>
                        <div class="school-affairs-container">
                            <div class="activity-card">
                                <i class="fas fa-comments activity-icon"></i>
                                <div class="activity-title">聯校oral</div>
                                <div class="activity-description">提升口語能力，與他校交流</div>
                            </div>
                            <div class="activity-card">
                                <i class="fas fa-exchange-alt activity-icon"></i>
                                <div class="activity-title">交換mock卷</div>
                                <div class="activity-description">與他校交換模擬試卷，擴展視野</div>
                            </div>
                            <div class="activity-card">
                                <i class="fas fa-brain activity-icon"></i>
                                <div class="activity-title">尖子策略交流會</div>
                                <div class="activity-description">與優秀同學交流學習心得</div>
                            </div>
                        </div>
                    </div>

                    <div class="activity-section">
                        <h3 class="activity-section-title">師生同樂、樂也融融</h3>
                        <div class="school-affairs-container">
                            <div class="activity-card">
                                <i class="fas fa-apple-alt activity-icon"></i>
                                <div class="activity-title">敬師週</div>
                                <div class="activity-description">向老師表達感謝之情</div>
                            </div>
                            <div class="activity-card">
                                <i class="fas fa-futbol activity-icon"></i>
                                <div class="activity-title">師生比賽</div>
                                <div class="activity-description">籃球、足球等師生同樂活動</div>
                            </div>
                            <div class="activity-card">
                                <i class="fas fa-utensils activity-icon"></i>
                                <div class="activity-title">師生烹飪大賽</div>
                                <div class="activity-description">與老師組隊，展現廚藝</div>
                            </div>
                            <div class="activity-card">
                                <i class="fas fa-user-tie activity-icon"></i>
                                <div class="activity-title">校長面對面</div>
                                <div class="activity-description">與校長直接交流，表達意見</div>
                            </div>
                        </div>
                    </div>
                `;
            case 'welfare':
                // 创建样式标签
                const style = document.createElement('style');
                style.textContent = `
                    .welfare-title {
                        font-size: 2em;
                        color: #007bff;
                        margin-bottom: 20px;
                        display: flex;
                        align-items: center;
                    }
                    .welfare-title i {
                        font-size: 1.2em;
                        margin-right: 10px;
                    }
                    .welfare-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                        gap: 30px;
                        margin-top: 30px;
                    }
                    .welfare-item {
                        background-color: #f8f9fa;
                        border-radius: 10px;
                        padding: 20px;
                        text-align: center;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100px;
                    }
                    .welfare-item:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 6px 12px rgba(0,0,0,0.15);
                        background-color: #e3f2fd;
                    }
                    .welfare-item i {
                        font-size: 2em;
                        margin-bottom: 10px;
                        color: #007bff;
                    }
                    .welfare-item span {
                        font-size: 1.1em;
                        font-weight: bold;
                    }
                    .welfare-description {
                        font-size: 1.1em;
                        margin-bottom: 20px;
                        color: #555;
                    }
                    .welfare-note {
                        font-style: italic;
                        color: #666;
                        margin-top: 30px;
                    }
                    .welfare-continuation {
                        grid-column: 1 / -1;
                        background-color: #e3f2fd;
                        font-weight: bold;
                    }
                    .welfare-item a {
                        text-decoration: none;
                        color: inherit;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        height: 100%;
                    }
                `;
                // 将样式标签插入到文档头部
                document.head.appendChild(style);

                return `
                    <h2 class="welfare-title"><i class="fas fa-heart"></i> 學生福利</h2>
                    <p class="welfare-description">以下是我們致力於提供的多样化福利服务，讓您在校園生活中更感舒適便利：</p>
                    <div class="welfare-grid">
                        <div class="welfare-item"><i class="fas fa-utensils"></i><span>叮飯</span></div>
                        <div class="welfare-item">
                            <a href="#borrow-umbrella" onclick="loadContent('borrow-umbrella'); return false;">
                                <i class="fas fa-umbrella"></i>
                                <span>借用雨傘</span>
                            </a>
                        </div>
                        <div class="welfare-item"><i class="fas fa-wind"></i><span>借用風筒</span></div>
                        <div class="welfare-item"><i class="fas fa-battery-full"></i><span>借用充電寶</span></div>
                        <div class="welfare-item"><i class="fas fa-ribbon"></i><span>借用髮圈髮夾</span></div>
                        <div class="welfare-item">
                            <a href="https://forms.gle/is9hC9CvUqXnPsVX6" target="_blank" rel="noopener noreferrer">
                                <i class="fas fa-comment-alt"></i>
                                <span>意見收集</span>
                            </a>
                        </div>
                        <div class="welfare-item"><i class="fas fa-camera"></i><span>拍立得"即影即有"</span></div>
                        <div class="welfare-item"><i class="fas fa-toilet"></i><span>改善洗手間</span></div>
                        <div class="welfare-item"><i class="fas fa-pencil-alt"></i><span>文具售賣</span></div>
                        <div class="welfare-item"><i class="fas fa-thermometer-half"></i><span>暖包售賣</span></div>
                        <div class="welfare-item"><i class="fas fa-female"></i><span>女性用品售賣</span></div>
                        <div class="welfare-item"><i class="fas fa-tint"></i><span>爭取改善飲水機水質</span></div>
                        <div class="welfare-item welfare-continuation"><span>上一屆所有學生會的福利繼續延續！</span></div>
                    </div>
                    <p class="welfare-note">我們承诺，所有福利均免費提供，無任何隱藏利潤。</p>
                `;

            case 'borrow-umbrella':
                const umbrellaStyle = document.createElement('style');
                umbrellaStyle.textContent = `
                    .umbrella-service {
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f8f9fa;
                        border-radius: 10px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }
                    .umbrella-title {
                        color: #007bff;
                        text-align: center;
                        font-size: 2em;
                        margin-bottom: 20px;
                    }
                    .umbrella-description {
                        background-color: #e3f2fd;
                        padding: 15px;
                        border-radius: 5px;
                        margin-bottom: 20px;
                    }
                    .umbrella-steps {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 30px;
                    }
                    .step {
                        flex: 1;
                        text-align: center;
                        padding: 15px;
                        background-color: #f1f3f5;
                        border-radius: 5px;
                        margin: 0 10px;
                    }
                    .step i {
                        font-size: 2em;
                        color: #007bff;
                        margin-bottom: 10px;
                    }
                    .step p {
                        text-align: center;
                        margin: 0;
                    }
                    .step p span {
                        display: block;
                        text-align: left;
                        margin-left: 50%; /* 将文本左边界移到中心 */
                        transform: translateX(-50%); /* 将文本向左移动自身宽度的一半，实现居中 */
                    }
                `;
                document.head.appendChild(umbrellaStyle);

                return `
                    <div class="umbrella-service">
                        <h2 class="umbrella-title">借用雨傘服務</h2>
                        <div class="umbrella-description">
                            <p>為了方便同學們在雨天緊急使用，我們學生會提供「借用雨傘」服務。每次借用需繳納 80港幣押金，並且需要在 SU（即小食部旁邊） 登記。借用的雨傘必須在 次日歸還，否則將扣除押金，並影響後續借用資格。</p>
                        </div>
                        <h3>借用流程：</h3>
                        <div class="umbrella-steps">
                            <div class="step">
                                <i class="fas fa-clipboard-list"></i>
                                <p>1. 前往 SU（即小食部旁邊）登記</p>
                            </div>
                            <div class="step">
                                <i class="fas fa-dollar-sign"></i>
                                <p>2. 繳納 80港幣押金</p>
                            </div>
                            <div class="step">
                                <i class="fas fa-umbrella"></i>
                                <p>3. 借用雨傘</p>
                            </div>
                            <div class="step">
                                <i class="fas fa-undo"></i>
                                <p>4. 次日歸還並領取押金</p>
                            </div>
                        </div>
                    </div>
                `;

            case 'members':
                return `
                    <h2><i class="fas fa-list"></i> 學生會名單</h2>
                    <div class="members-grid">
                        <div class="member-card">
                            <div class="member-position"><i class="fas fa-crown"></i> 主席</div>
                            <div class="member-name">5B 18 冼星朗</div>
                        </div>
                        <div class="member-card">
                            <div class="member-position"><i class="fas fa-user-tie"></i> 內務副主席</div>
                            <div class="member-name">5B 19 施鈿熙</div>
                        </div>
                        <div class="member-card">
                            <div class="member-position"><i class="fas fa-handshake"></i> 外務副主席</div>
                            <div class="member-name">4A 24 吳煒樺</div>
                        </div>
                        <div class="member-card">
                            <div class="member-position"><i class="fas fa-gamepad"></i> 康樂（規劃）</div>
                            <div class="member-name">5A 19 李詩凡<br>5B 26 吳慧珍</div>
                        </div>
                        <div class="member-card">
                            <div class="member-position"><i class="fas fa-pen"></i> 文書</div>
                            <div class="member-name">5B 14 廖梓鍵</div>
                        </div>
                        <div class="member-card">
                            <div class="member-position"><i class="fas fa-bullhorn"></i> 宣傳</div>
                            <div class="member-name">2A 17 林建希<br>2D 29 王雯雯<br>5A 17 林禮輝<br>5B 23 屈子强</div>
                        </div>
                        <div class="member-card">
                            <div class="member-position"><i class="fas fa-heart"></i> 福利</div>
                            <div class="member-name">2D 32 周芷缘<br>5C 15 李家宏</div>
                        </div>
                        <div class="member-card">
                            <div class="member-position"><i class="fas fa-coins"></i> 財政</div>
                            <div class="member-name">5B 34 鍾咏琳</div>
                        </div>
                        <div class="member-card">
                            <div class="member-position"><i class="fas fa-users"></i> 四社聯繫</div>
                            <div class="member-name">5B 3 陳蔓涵</div>
                        </div>
                        <div class="member-card">
                            <div class="member-position"><i class="fas fa-laptop-code"></i> 資訊與科技幹事</div>
                            <div class="member-name">4B 18 吳澤璟</div>
                        </div>
                        <div class="member-card">
                            <div class="member-position"><i class="fas fa-running"></i> 體育幹事</div>
                            <div class="member-name">5B 25 胡俊賢</div>
                        </div>
                    </div>
                `;
            case 'contact':
                return '<h2><i class="fas fa-envelope"></i> 聯絡我們</h2>' +
                    '<p>我們非常重視您的意見和建議。如果您有任何問題或想法，請隨時與我們聯繫。</p>' +
                    '<div class="contact-info">' +
                    '<p>Email：' +
                    '<a href="mailto:randyxian08@gmail.com" class="email-link">randyxian08@gmail.com</a>, ' +
                    '<a href="mailto:yutangtang6@gmail.com" class="email-link">yutangtang6@gmail.com</a>' +
                    '</p>' +
                    '<p>' +
                    '<a href="https://www.instagram.com/klss_champions" target="_blank" rel="noopener noreferrer"><i class="fab fa-instagram" style="font-size: 16px;"></i> Instagram：@klss_champions</a>' +
                    '</p>' +
                    '<p>' +
                    '<a href="https://www.klss.edu.hk/" target="_blank" rel="noopener noreferrer"><img src="images/schoollogo.png" alt="School Logo" style="width: 16px; height: 16px; vertical-align: middle;"> 學校官網</a>' +
                    '</p>' +
                    '<p>辦公室地址：高雷中學學生活動中心 SU</p>' +
                    '</div>';
            default:
                return '<h2>404 Not Found</h2><p>抱歉，您要查看的頁面不存在。</p>';
        }
    }

    // 搜索功能
    if (searchButton) {
        searchButton.addEventListener('click', search);
    } else {
        console.error('搜索按钮未找到');
    }
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            search();
        }
    });

    // 初始化
    preloadContent();
    var initialPage = window.location.hash.substr(1) || 'home';
    loadContent(initialPage);
    setActiveLink(document.querySelector('nav a[href="#' + initialPage + '"]'));

    // 确保 loadContentAndUpdateURL 函数在全局范围内可用
    window.loadContentAndUpdateURL = loadContentAndUpdateURL;

    // 处理浏览器的后退和前进按钮
    window.addEventListener('popstate', function(event) {
        var page = window.location.hash.substr(1) || 'home';
        loadContent(page);
        setActiveLink(document.querySelector('nav a[href="#' + page + '"]'));
    });

    console.log('页面加载完成');
    console.log('搜索按钮:', searchButton);
    console.log('搜索输入框:', searchInput);

    // 手动初始化 jieba
    if (typeof jieba === 'undefined') {
        console.log('正在手动初始化 jieba');
        window.jieba = {
            cut: function(text) {
                // 简单的分词实现，按空格分割
                return text.split(/\s+/);
            }
        };
    }

    console.log('jieba 状态:', typeof jieba !== 'undefined' ? '已加载' : '未加载');

    // 图片轮播
    function setupImageCarousel() {
        const carousel = document.querySelector('.image-carousel');
        const images = carousel.querySelectorAll('img');
        const leftArrow = carousel.querySelector('.carousel-arrow.left');
        const rightArrow = carousel.querySelector('.carousel-arrow.right');
        let currentImage = 0;

        function showImage(index) {
            images[currentImage].classList.remove('active');
            images[index].classList.add('active');
            currentImage = index;
        }

        function nextImage() {
            showImage((currentImage + 1) % images.length);
        }

        function prevImage() {
            showImage((currentImage - 1 + images.length) % images.length);
        }

        leftArrow.addEventListener('click', prevImage);
        rightArrow.addEventListener('click', nextImage);

        // 自动轮播
        setInterval(nextImage, 5000);
    }

    // 在 loadContent 函数中调用 setupImageCarousel
    function loadContent(page) {
        content.classList.add('fade-out');
        setTimeout(() => {
            content.innerHTML = contentCache[page] || generateContent(page);
            content.classList.remove('fade-out');
            content.classList.add('fade-in');
            
            // 添加新的动画效果
            const elements = content.querySelectorAll('h2, h3, p, .event-card, .member-card');
            elements.forEach((el, index) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    el.style.transition = 'opacity 0.5s, transform 0.5s';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, index * 100);
            });

            setTimeout(() => {
                content.classList.remove('fade-in');
            }, 300);

            if (page === 'home') {
                setupImageCarousel();
            }
        }, 150);
    }

    function calculateCountdown(targetDate) {
        const now = new Date();
        const target = new Date(targetDate);
        const timeDiff = target - now;

        if (timeDiff <= 0) {
            return "該活動已結束！請期待接下來的活動！";
        }

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

        return `距離開始還有${days}天${hours}時${minutes}分`;
    }

    // 添加一个函来更新所有倒计时
    function updateAllCountdowns() {
        const countdowns = document.querySelectorAll('.countdown');
        countdowns.forEach(countdown => {
            const targetDate = countdown.getAttribute('data-target');
            countdown.innerHTML = calculateCountdown(targetDate);
        });
    }

    // 每秒更新一次倒计时
    setInterval(updateAllCountdowns, 1000);

    // 预加载所有内容
    preloadContent();
    var initialPage = window.location.hash.substr(1) || 'home';
    loadContent(initialPage);
    setActiveLink(document.querySelector('nav a[href="#' + initialPage + '"]'));

    // 确保 loadContentAndUpdateURL 函数在全局范围内可用
    window.loadContentAndUpdateURL = loadContentAndUpdateURL;

    // 处理浏览器的后退和前进按钮
    window.addEventListener('popstate', function(event) {
        var page = window.location.hash.substr(1) || 'home';
        loadContent(page);
        setActiveLink(document.querySelector('nav a[href="#' + page + '"]'));
    });

    console.log('页面加载完成');
    console.log('搜索按钮:', searchButton);
    console.log('搜索输入框:', searchInput);

    // 手动初始化 jieba
    if (typeof jieba === 'undefined') {
        console.log('正在手动初始化 jieba');
        window.jieba = {
            cut: function(text) {
                // 简单的分词实现，按空格分割
                return text.split(/\s+/);
            }
        };
    }

    console.log('jieba 状态:', typeof jieba !== 'undefined' ? '已加载' : '未加载');
});
