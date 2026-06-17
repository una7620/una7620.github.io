'use strict' // 엄격 모드 - 문법 오류를 더 꼼꼼하게 잡아줌

// =====================================================================
// [페이지 초기화]
// =====================================================================
window.scrollTo(0, 0) // 페이지 열면 항상 맨 위에서 시작
history.scrollRestoration = 'manual' // 브라우저가 스크롤 위치 자동복원 못하게 막음
document.body.classList.remove('entered') // CSS에서 스크롤 허용하는 클래스 제거 → 처음엔 스크롤 막음

let clicked = false // 로딩화면을 클릭했는지 여부 (false = 아직 안 클릭)
let animationReady = false // 로딩 애니메이션이 끝났는지 여부 (false = 아직 안 끝남)

// =====================================================================
// [로딩화면 등장 애니메이션]
// GSAP의 timeline = 여러 애니메이션을 순서대로 실행하는 도구
// =====================================================================
const tl = gsap.timeline({
  onComplete: function () { // 모든 애니메이션이 끝나면 실행
    animationReady = true // 이제 클릭 가능 상태로 전환
  }
})

tl
  .to('.center-name', { opacity: 1, duration: 1.5, ease: 'power2.out' }) // HTML의 .center-name(LEE YUNA 글씨) 1.5초에 걸쳐 나타남
  .to('.sub-text', { opacity: 1, duration: 0.8 }) // 그 다음 서브텍스트(수원대학교...) 나타남
  .to('.click-hint', { opacity: 1, duration: 0.8 }) // 마지막으로 "click anywhere" 나타남

// =====================================================================
// [로딩화면 클릭 이벤트]
// HTML의 .loader 요소를 클릭하면 메인화면으로 전환
// =====================================================================
document.querySelector('.loader').addEventListener('click', function () {
  if (clicked || !animationReady) return // 이미 클릭했거나 애니메이션 안 끝났으면 무시
  clicked = true // 클릭 상태로 변경 (중복 클릭 방지)

  const tl2 = gsap.timeline() // 클릭 후 실행할 애니메이션 순서 목록

  tl2
    .to(['.sub-text', '.click-hint'], { opacity: 0, duration: 0.3 }) // 서브텍스트, click hint 사라짐
    .to('.grid-video', { opacity: 0, duration: 0.8 }, '-=0.2') // 로딩 배경 영상 사라짐 (0.2초 앞당겨서 동시 진행)
    .to('.center-name', { // LEE YUNA 글씨를 화면 맨 아래로 이동
      y: () => { // y = 세로 이동 거리를 계산하는 함수
        const el = document.querySelector('.center-name')
        const rect = el.getBoundingClientRect() // 현재 화면상의 위치 정보를 가져옴
        return window.innerHeight - rect.bottom - 10 // 화면 높이 - 글씨 하단 위치 = 이동해야 할 거리
      },
      duration: 1.2,
      ease: 'power2.inOut'
    }, '-=0.4')
    .to('.loader', {
      duration: 0, // 시간 0 = 즉시 실행
      onComplete: function () { // 위 애니메이션 끝나면 실행
        document.querySelector('.loader').style.background = 'transparent' // 로더 배경 투명하게
        document.querySelector('.loader').style.pointerEvents = 'none' // 로더 클릭 이벤트 비활성화
        document.querySelector('.main-content').style.opacity = '1' // 상단 텍스트 보이게

        document.body.classList.add('entered') // body에 entered 클래스 추가 → CSS에서 스크롤 허용
        window.scrollTo(0, 0) // 스크롤 맨 위로

        // LEE YUNA 글씨를 loader에서 hero 섹션으로 이동 → 메인화면 하단에 고정
        const el = document.querySelector('.center-name')
        document.querySelector('.hero').appendChild(el) // hero 섹션의 자식으로 이동
        el.style.position = 'absolute' // 절대 위치로 설정
        el.style.bottom = '10px' // 하단에서 10px 위
        el.style.top = 'auto'
        el.style.left = '50%' // 가운데 정렬
        el.style.transform = 'translateX(-50%)' // 정확한 가운데 정렬
        el.style.zIndex = '10' // 다른 요소 위에 표시

        // click-hint 완전히 숨기기
        // CSS animation이 계속 opacity를 바꾸기 때문에 animation 자체를 제거해야 함
        const hint = document.querySelector('.click-hint')
        hint.style.animation = 'none' // CSS 애니메이션 중단
        hint.style.opacity = '0'
        hint.style.display = 'none' // 완전히 숨김

        gsap.to('.main-video', { opacity: 0.6, duration: 1.5, ease: 'power2.out' }) // 메인 배경 영상 서서히 나타남
        gsap.to('.sub-text-main', { opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.1 }) // 상단 텍스트 나타남
        gsap.to('.navbar', { top: 0, opacity: 1, duration: 1, ease: 'power2.out', delay: 0.3 }) // 네비게이션 바 위에서 내려옴
        gsap.to('#stars', { opacity: 1, duration: 1, delay: 0.5 }) // 별 캔버스 나타남

        // 영상 강제 재생 (GitHub Pages 자동재생 정책 우회)
        document.querySelectorAll('video').forEach(v => {
          v.play().catch(() => {}) // 재생 실패해도 오류 무시
        })

        initStars() // 별 반짝임 시작
        initTechTags() // 기술 태그 floating 시작
        loadGithubProjects() // GitHub API 호출 시작
      }
    })
})

// =====================================================================
// [별 반짝이는 캔버스 효과]
// Canvas API = 자바스크립트로 직접 그림을 그리는 HTML 요소
// =====================================================================
function initStars() {
  const canvas = document.getElementById('stars') // HTML의 <canvas id="stars"> 요소
  const ctx = canvas.getContext('2d') // 2D 그리기 도구 가져오기
  canvas.width = window.innerWidth // 캔버스 크기를 화면 전체로 설정
  canvas.height = window.innerHeight

  const stars = [] // 별 정보를 담을 배열
  for (let i = 0; i < 300; i++) { // 별 300개 생성
    stars.push({
      x: Math.random() * canvas.width, // 랜덤 x 위치
      y: Math.random() * canvas.height, // 랜덤 y 위치
      r: Math.random() * 1.5 + 0.5, // 반지름 0.5~2px 랜덤
      alpha: Math.random(), // 초기 투명도 랜덤
      speed: Math.random() * 0.02 + 0.005 // 반짝임 속도 랜덤
    })
  }

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height) // 캔버스 전체 지우기 (매 프레임마다)
    stars.forEach(star => {
      star.alpha += star.speed // 투명도를 speed만큼 증가
      if (star.alpha > 1 || star.alpha < 0) star.speed *= -1 // 0~1 범위 벗어나면 방향 반전 → 반짝임
      ctx.beginPath() // 새 도형 그리기 시작
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2) // 원 그리기 (x, y, 반지름, 시작각도, 끝각도)
      ctx.fillStyle = `rgba(212, 187, 239, ${star.alpha})` // 보라색으로 채우기
      ctx.fill()
    })
    requestAnimationFrame(drawStars) // 다음 프레임에 다시 호출 (60fps로 반복)
  }

  drawStars() // 첫 실행
}

// =====================================================================
// [스크롤 파티클 효과]
// About 섹션 안에서만 스크롤할 때 보라색 가루 파티클 생성
// =====================================================================
let lastScrollY = window.scrollY // 이전 스크롤 위치 저장

window.addEventListener('scroll', function () {
  const currentScrollY = window.scrollY // 현재 스크롤 위치
  const scrollDiff = currentScrollY - lastScrollY // 이전과 현재 스크롤 차이 = 스크롤 방향/속도
  lastScrollY = currentScrollY // 현재 위치를 이전 위치로 업데이트

  // HTML의 #about 섹션 하단 위치 계산
  const aboutBottom = document.querySelector('#about').offsetTop + document.querySelector('#about').offsetHeight

  if (currentScrollY + window.innerHeight < aboutBottom) { // 화면이 About 섹션 안에 있을 때만
    for (let i = 0; i < 15; i++) { // 파티클 15개 생성
      createParticle(scrollDiff)
    }
  }
})

// =====================================================================
// [파티클 생성 함수]
// 스크롤 방향에 따라 화면 위/아래에서 파티클 생성
// =====================================================================
function createParticle(scrollDiff) {
  const particle = document.createElement('div') // div 태그 동적 생성
  particle.classList.add('particle') // CSS의 .particle 스타일 적용
  document.body.appendChild(particle) // body에 붙이기

  const x = Math.random() * window.innerWidth // 랜덤 가로 위치
  const y = scrollDiff > 0 // 아래로 스크롤이면
    ? Math.random() * window.innerHeight * 0.3 // 화면 위쪽 30%에서 생성
    : Math.random() * window.innerHeight * 0.7 + window.innerHeight * 0.3 // 위로 스크롤이면 아래쪽 70%에서 생성

  particle.style.left = x + 'px'
  particle.style.top = y + 'px'

  const size = Math.random() * 4 + 2 // 크기 2~6px 랜덤
  particle.style.width = size + 'px'
  particle.style.height = size + 'px'

  const colors = [ // 보라색 계열 색상 4가지
    'rgba(180, 100, 255, 0.8)',
    'rgba(212, 187, 239, 0.8)',
    'rgba(140, 60, 255, 0.6)',
    'rgba(200, 150, 255, 0.7)'
  ]
  particle.style.background = colors[Math.floor(Math.random() * colors.length)] // 랜덤 색상 선택

  const fallDirection = scrollDiff > 0 ? window.innerHeight : -window.innerHeight * 0.5 // 아래로 스크롤이면 아래로, 위로 스크롤이면 위로 이동

  gsap.to(particle, {
    y: fallDirection * (Math.random() * 0.5 + 0.5), // 이동 거리
    x: (Math.random() - 0.5) * 100, // 좌우로 약간 흔들림
    opacity: 0, // 사라지며
    duration: Math.random() * 1.5 + 0.5,
    ease: 'power1.out',
    onComplete: function () { particle.remove() } // 애니메이션 끝나면 DOM에서 제거 (메모리 관리)
  })
}

// =====================================================================
// [Skills 섹션 SVG 선 드로잉]
// HTML의 #skillPath SVG 요소를 스크롤에 따라 그어나가는 효과
//
// 핵심 원리:
// strokeDasharray = 선 전체 길이를 점선 간격으로 설정
// strokeDashoffset = 선을 밀어서 숨기는 값
// 스크롤 내릴수록 offset을 줄이면 선이 점점 나타남
// =====================================================================
const skillPath = document.getElementById('skillPath') // HTML의 SVG path 요소
const skillItems = document.querySelectorAll('.skill-item') // HTML의 모든 .skill-item 요소들
const skillsSection = document.querySelector('.skills-section') // HTML의 .skills-section 요소

// [스킬 타이틀 옆 별 반짝임]
// SVG 선이 스킬 항목에 도달하면 ✦ 별이 나타나 반짝임
function sparkAt(item) {
  const title = item.querySelector('.skill-title') // 스킬 항목 안의 제목 찾기
  if (!title) return // 제목 없으면 종료

  const star = document.createElement('span') // span 태그 생성
  star.classList.add('spark') // CSS의 .spark 스타일 적용
  star.textContent = '✦' // 별 문자
  title.appendChild(star) // 제목 뒤에 별 붙이기

  gsap.fromTo(star,
    { opacity: 0, scale: 0.5 }, // 시작: 투명하고 작게
    { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out',
      onComplete: () => { // 등장 애니메이션 끝나면
        gsap.to(star, {
          opacity: 0.2,
          scale: 0.8,
          duration: 1,
          repeat: -1, // 무한 반복
          yoyo: true, // 왔다갔다 (1→0.2→1→0.2...)
          ease: 'sine.inOut'
        })
      }
    }
  )
}

if (skillPath && skillsSection) { // skillPath와 skillsSection이 존재할 때만 실행
  const pathLength = skillPath.getTotalLength() // SVG 선의 전체 길이 계산
  skillPath.style.strokeDasharray = pathLength // 전체 길이로 점선 간격 설정
  skillPath.style.strokeDashoffset = pathLength // 전체 길이만큼 밀어서 완전히 숨김

  skillItems.forEach(item => { // 각 스킬 항목의 위치를 data-position 값으로 설정
    const pos = parseInt(item.dataset.position) // HTML의 data-position 속성값 읽기
    item.style.top = pos + '%' // CSS top 위치 설정
  })

  window.addEventListener('scroll', function () {
    const sectionTop = skillsSection.getBoundingClientRect().top // 섹션 상단이 화면 어디에 있는지
    const sectionHeight = skillsSection.offsetHeight // 섹션 전체 높이
    const windowHeight = window.innerHeight // 화면 높이

    // 스크롤 진행도 계산 (0 = 섹션 시작, 1 = 섹션 끝)
    const rawProgress = Math.max(0, Math.min(1,
      (-sectionTop) / (sectionHeight - windowHeight)
    ))

    const progress = Math.min(rawProgress * 0.9, 1) // 스킬 항목 등장용 진행도

    // 선 전용 진행도 (초반 느리게, 후반 끝까지 따라잡기)
    const lineProgress = rawProgress < 0.75
      ? rawProgress * 0.9
      : 0.675 + ((rawProgress - 0.75) / 0.25) * 0.325

    skillPath.style.strokeDashoffset = pathLength * (1 - Math.min(lineProgress, 1)) // offset 줄일수록 선이 나타남

    skillItems.forEach(item => {
      const itemProgress = parseInt(item.dataset.position) / 100 * 0.7 // 이 항목이 등장해야 하는 progress 값

      if (progress >= itemProgress) { // 선이 이 항목에 도달했으면
        if (item.dataset.sparked !== 'true') { // 아직 등장 안 했으면
          item.dataset.sparked = 'true' // 등장 완료 표시
          gsap.to(item, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }) // 항목 나타남
          sparkAt(item) // 별 반짝임 시작
        }
      } else { // 선이 위로 올라갔으면
        if (item.dataset.sparked === 'true') { // 등장했던 항목이면
          item.dataset.sparked = 'false' // 등장 표시 초기화
          const star = item.querySelector('.spark') // 별 요소 찾기
          if (star) {
            gsap.killTweensOf(star) // 별 애니메이션 중단
            gsap.to(star, { opacity: 0, scale: 0.3, duration: 0.3, onComplete: () => star.remove() }) // 별 사라지며 제거
          }
          gsap.to(item, { opacity: 0, y: 20, duration: 0.3 }) // 항목 사라짐
        }
      }
    })

    if (progress >= 0.85) { // 스크롤 85% 이상이면
      gsap.to('.skills-ending', { opacity: 1, duration: 1, ease: 'power2.out' }) // 달 + 핵심 문장 나타남
    }

    if (clicked) { // 메인화면 진입 후에만
      const skillsTop = document.querySelector('#skills').offsetTop
      const fadeStart = skillsTop + window.innerHeight
      const fadeEnd = skillsTop + window.innerHeight * 3
      const currentScrollY = window.scrollY
      const starsOpacity = Math.max(0, 1 - (currentScrollY - fadeStart) / (fadeEnd - fadeStart))
      document.getElementById('stars').style.opacity = starsOpacity // Skills 섹션 진행에 따라 별 서서히 사라짐
    }
  })
}

// =====================================================================
// [GitHub API 연동 - MVC 구조]
//
// Model = GitHub API에서 받아온 JSON 데이터
// View = renderProjectCards()가 카드 HTML 생성
// Controller = loadGithubProjects()가 데이터 받아서 View에 전달
//
// fetch() = 외부 서버에 HTTP 요청을 보내는 JS 내장 함수
// async/await = 비동기 처리 (데이터 올 때까지 기다렸다가 실행)
// try/catch = 오류 발생 시 더미 데이터로 안전하게 대체
// =====================================================================
const GITHUB_USERNAME = 'una7620' // GitHub 사용자 이름

const DUMMY_PROJECTS = [ // API 오류 시 대신 표시할 더미 데이터
  {
    name: 'web-security-study',
    description: '웹 보안 취약점 분석 및 방어 기법 연구 프로젝트.',
    html_url: 'https://github.com/una7620',
    topics: ['security', 'web', 'java'],
    updated_at: '2025-05-20T00:00:00Z'
  },
  {
    name: 'cryptography-practice',
    description: '암호학 알고리즘 구현 실습.',
    html_url: 'https://github.com/una7620',
    topics: ['cryptography', 'java', 'algorithm'],
    updated_at: '2025-04-15T00:00:00Z'
  },
  {
    name: 'portfolio-website',
    description: '개인 포트폴리오 웹사이트.',
    html_url: 'https://github.com/una7620',
    topics: ['html', 'css', 'javascript'],
    updated_at: '2025-06-01T00:00:00Z'
  }
]

// [GitHub API 호출 함수 - Controller 역할]
async function loadGithubProjects() {
  const loadingEl = document.getElementById('projectsLoading') // HTML의 로딩 중 텍스트 요소

  try { // 오류가 발생할 수 있는 코드를 try 안에 넣음
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=9`)
    // fetch() = GitHub 서버에 "una7620의 레포 목록 줘" 요청
    // await = 응답 올 때까지 기다려

    if (!response.ok) throw new Error('API 요청 실패') // 응답이 실패면 오류 발생시킴

    const repos = await response.json() // 받아온 데이터를 JS 객체로 변환
    loadingEl.style.display = 'none' // 로딩 텍스트 숨김

    if (repos.length === 0) { // 레포가 없으면
      renderProjectCards(DUMMY_PROJECTS, true) // 더미 데이터로 카드 생성
    } else {
      renderProjectCards(repos, false) // 실제 데이터로 카드 생성
    }

  } catch (error) { // try에서 오류 발생하면 여기서 처리
    console.log('GitHub API 오류, 더미 데이터 사용:', error)
    loadingEl.style.display = 'none'
    renderProjectCards(DUMMY_PROJECTS, true) // 오류나도 더미 데이터로 대체
  }
}

// [프로젝트 카드 생성 함수 - View 역할]
function renderProjectCards(projects, isDummy) {
  const trackEl = document.getElementById('projectsTrack') // HTML의 슬라이드 트랙 요소
  const dotsEl = document.getElementById('sliderDots') // HTML의 점 네비게이션 요소
  const prevBtn = document.getElementById('sliderPrev') // HTML의 이전 화살표 버튼
  const nextBtn = document.getElementById('sliderNext') // HTML의 다음 화살표 버튼

  if (isDummy) { // 더미 데이터면 안내 문구 표시
    const notice = document.createElement('p')
    notice.classList.add('projects-notice')
    document.getElementById('projectsSlider').before(notice)
    notice.textContent = '* GitHub 레포지토리 등록 후 자동으로 업데이트됩니다.'
  }

  let currentPage = 0 // 현재 보여주는 슬라이드 번호
  const total = projects.length // 전체 레포 개수

  projects.forEach(function (repo, idx) { // 레포 목록을 하나씩 순서대로 처리
    const date = new Date(repo.updated_at) // 날짜 객체 생성
    const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}` // YYYY.MM.DD 형식으로 변환
    const topics = repo.topics && repo.topics.length > 0 ? repo.topics : ['no-topic'] // 토픽 없으면 no-topic
    const topicTags = topics.map(t => `<span class="project-topic">${t}</span>`).join('') // 토픽마다 span 태그 생성

    const slide = document.createElement('div') // 슬라이드 div 동적 생성
    slide.classList.add('projects-slide') // CSS의 .projects-slide 스타일 적용
    slide.innerHTML = ` 
      <div class="project-card">
        <div class="card-top"><span class="card-date">${formattedDate}</span></div>
        <h3 class="card-title">${repo.name}</h3>
        <p class="card-desc">${repo.description || '프로젝트 설명이 등록되지 않았습니다.'}</p>
        <div class="project-topics">${topicTags}</div>
        <div class="card-footer">
          <a class="card-link" href="${repo.html_url}" target="_blank">View on GitHub →</a>
        </div>
      </div>
    ` // 카드 HTML을 문자열로 만들어서 슬라이드 안에 넣음
    trackEl.appendChild(slide) // 트랙에 슬라이드 추가

    const dot = document.createElement('button') // 점 버튼 동적 생성
    dot.classList.add('slider-dot')
    if (idx === 0) dot.classList.add('active') // 첫 번째 점 활성화
    dot.addEventListener('click', () => goTo(idx)) // 점 클릭하면 해당 페이지로 이동
    dotsEl.appendChild(dot) // 점 네비게이션에 추가
  })

  animateSlide(0) // 첫 카드 등장 애니메이션
  updateArrows() // 화살표 상태 업데이트

  function goTo(page) { // 특정 페이지로 이동하는 함수
    currentPage = page
    gsap.to(trackEl, { // 트랙을 X축으로 이동 (100%씩 슬라이드)
      x: (-currentPage * 100) + '%',
      duration: 0.55,
      ease: 'power2.inOut'
    })
    document.querySelectorAll('.slider-dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentPage) // 현재 페이지 점만 활성화
    })
    updateArrows()
    animateSlide(currentPage)
  }

  function animateSlide(page) { // 카드 등장 애니메이션
    const card = trackEl.children[page]?.querySelector('.project-card') // 해당 페이지의 카드 찾기
    if (!card) return
    gsap.fromTo(card,
      { opacity: 0, y: 24 }, // 시작: 투명하고 아래에 있음
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' } // 끝: 보이고 제자리
    )
  }

  function updateArrows() { // 화살표 활성/비활성 업데이트
    prevBtn.style.opacity = currentPage === 0 ? '0.2' : '1' // 첫 페이지면 이전 화살표 흐리게
    prevBtn.style.pointerEvents = currentPage === 0 ? 'none' : 'auto' // 첫 페이지면 클릭 비활성화
    nextBtn.style.opacity = currentPage === total - 1 ? '0.2' : '1' // 마지막 페이지면 다음 화살표 흐리게
    nextBtn.style.pointerEvents = currentPage === total - 1 ? 'none' : 'auto'
  }

  prevBtn.addEventListener('click', () => { if (currentPage > 0) goTo(currentPage - 1) }) // 이전 버튼
  nextBtn.addEventListener('click', () => { if (currentPage < total - 1) goTo(currentPage + 1) }) // 다음 버튼
}

// =====================================================================
// [로딩 전 스크롤 방지]
// 로딩화면 클릭 전까지 스크롤 완전 차단
// passive: false = preventDefault()가 작동하려면 반드시 필요
// =====================================================================
window.addEventListener('wheel', function (e) {
  if (!clicked) e.preventDefault() // 클릭 전이면 스크롤 막음
}, { passive: false })

window.addEventListener('touchmove', function (e) {
  if (!clicked) e.preventDefault() // 터치 스크롤도 막음
}, { passive: false })

// =====================================================================
// [기술 태그 floating 효과]
// 메인화면 진입 후 hero 섹션에 기술 태그들을 동적으로 생성하고
// 각각 다른 위치에서 둥둥 떠다니게 함
// =====================================================================
function initTechTags() {
  const techTags = ['#Java', '#JavaScript', '#HTML', '#CSS', '#C', '#Linux', '#자료구조', '#C++', '#Python', '#Git', '#SQL', '#정보처리기사', '#WhiteHat'] // 표시할 기술 태그 목록
  const hero = document.querySelector('.hero') // HTML의 .hero 섹션

  const positions = [ // 각 태그의 위치 (% 단위, x=가로, y=세로)
    { x: 30, y: 15 }, { x: 58, y: 10 }, { x: 20, y: 38 },
    { x: 68, y: 32 }, { x: 25, y: 60 }, { x: 63, y: 58 },
    { x: 45, y: 22 }, { x: 42, y: 45 }, { x: 32, y: 28 },
    { x: 62, y: 18 }, { x: 48, y: 70 }, { x: 35, y: 72 },
    { x: 65, y: 48 },
  ]

  techTags.forEach(function(tag, i) { // 태그 13개를 하나씩 처리
    const el = document.createElement('div') // div 태그 동적 생성
    el.classList.add('tech-tag') // CSS의 .tech-tag 스타일 적용
    el.textContent = tag // 태그 텍스트 설정
    el.style.left = positions[i].x + '%' // 가로 위치
    el.style.top = positions[i].y + '%' // 세로 위치
    el.style.opacity = '0' // 처음엔 투명하게
    hero.appendChild(el) // hero 섹션에 추가

    gsap.to(el, { opacity: 1, duration: 1, delay: 1.5 + i * 0.15, ease: 'power2.out' })
    // 순서대로 서서히 나타남 (i * 0.15초 간격으로 하나씩)

    gsap.to(el, { // 둥둥 떠다니는 반복 애니메이션
      y: (Math.random() - 0.5) * 30, // 랜덤 세로 이동
      x: (Math.random() - 0.5) * 15, // 랜덤 가로 이동
      duration: 2.5 + Math.random() * 2, // 2.5~4.5초 랜덤 속도
      repeat: -1, // 무한 반복
      yoyo: true, // 왔다갔다
      ease: 'sine.inOut',
      delay: Math.random() * 2 // 랜덤 딜레이로 제각각 움직임
    })
  })
}
