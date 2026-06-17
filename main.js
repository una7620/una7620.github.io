'use strict'

/* =====================================================================
   [전역 설정]
   페이지 진입 시 항상 맨 위로 이동
   history.scrollRestoration = 'manual' → 브라우저가 스크롤 위치를 
   자동 복원하지 않도록 막음 (새로고침해도 항상 맨 위에서 시작)
   ===================================================================== */
window.scrollTo(0, 0)
history.scrollRestoration = 'manual'
document.body.classList.remove('entered')

// clicked: 로딩화면 클릭 여부 / animationReady: 로딩 애니메이션 완료 여부
let clicked = false
let animationReady = false

/* =====================================================================
   [YouTube 배경 영상 설정]
   video 태그 대신 YouTube IFrame API를 사용해 배경 영상을 재생
   
   왜 YouTube를 쓰나?
   → GitHub Pages는 큰 영상 파일의 자동재생을 막는 경우가 있어서
     YouTube에 영상을 올리고 IFrame으로 불러오는 방식을 사용함
   
   YT.Player: YouTube가 제공하는 영상 플레이어 객체
   videoId: YouTube 영상 URL에서 추출한 ID값
   playerVars: 영상 재생 옵션 설정
   ===================================================================== */

// YouTube IFrame API 스크립트를 동적으로 불러오기
const ytScript = document.createElement('script')
ytScript.src = 'https://www.youtube.com/iframe_api'
document.head.appendChild(ytScript)

// grid 영상 플레이어 (로딩화면 배경)
let gridPlayer = null
// main 영상 플레이어 (메인화면 배경)
let mainPlayer = null

/* =====================================================================
   [YouTube IFrame API 준비 완료 콜백]
   YouTube 스크립트 로드가 완료되면 자동으로 호출되는 함수
   이 함수 이름은 YouTube API가 정해둔 것이라 반드시 이 이름을 써야 함
   ===================================================================== */
window.onYouTubeIframeAPIReady = function () {

  // grid 영상 플레이어 생성 (로딩화면 배경)
  gridPlayer = new YT.Player('grid-player', {
    videoId: 'yGGLIxQK9ks',
    playerVars: {
      autoplay: 1,
      mute: 1,
      loop: 1,
      controls: 0,
      showinfo: 0,
      rel: 0,
      playlist: 'yGGLIxQK9ks'
    },
    events: {
      onReady: function (e) { e.target.playVideo() }
    }
  })

  // main 영상 플레이어 생성 (메인화면 배경)
  mainPlayer = new YT.Player('main-player', {
    videoId: 'X-GTxXn-pXc',
    playerVars: {
      autoplay: 1,
      mute: 1,
      loop: 1,
      controls: 0,
      showinfo: 0,
      rel: 0,
      playlist: 'X-GTxXn-pXc'
    },
    events: {
      onReady: function (e) { e.target.playVideo() }
    }
  })
}

/* =====================================================================
   [로딩화면 등장 애니메이션]
   GSAP timeline으로 LEE YUNA → 서브텍스트 → click hint 순서로 등장
   timeline: 여러 애니메이션을 순서대로 실행하는 GSAP 기능
   onComplete: 모든 애니메이션이 끝나면 호출되는 콜백
   ===================================================================== */
const tl = gsap.timeline({
  onComplete: function () {
    animationReady = true
  }
})

tl
  .to('.center-name', { opacity: 1, duration: 1.5, ease: 'power2.out' })
  .to('.sub-text', { opacity: 1, duration: 0.8 })
  .to('.click-hint', { opacity: 1, duration: 0.8 })

/* =====================================================================
   [로딩화면 클릭 이벤트]
   클릭하면 LEE YUNA 글씨가 아래로 이동하고 메인화면이 등장
   ===================================================================== */
document.querySelector('.loader').addEventListener('click', function () {
  if (clicked || !animationReady) return
  clicked = true

  const tl2 = gsap.timeline()

  tl2
    .to(['.sub-text', '.click-hint'], { opacity: 0, duration: 0.3 })
    .to('.grid-video', { opacity: 0, duration: 0.8 }, '-=0.2')
    .to('.center-name', {
      y: () => {
        const el = document.querySelector('.center-name')
        const rect = el.getBoundingClientRect()
        return window.innerHeight - rect.bottom - 10
      },
      duration: 1.2,
      ease: 'power2.inOut'
    }, '-=0.4')
    .to('.loader', {
      duration: 0,
      onComplete: function () {
        document.querySelector('.loader').style.background = 'transparent'
        document.querySelector('.loader').style.pointerEvents = 'none'
        document.querySelector('.main-content').style.opacity = '1'

        document.body.classList.add('entered')
        window.scrollTo(0, 0)

        const el = document.querySelector('.center-name')
        document.querySelector('.hero').appendChild(el)
        el.style.position = 'absolute'
        el.style.bottom = '10px'
        el.style.top = 'auto'
        el.style.left = '50%'
        el.style.transform = 'translateX(-50%)'
        el.style.zIndex = '10'

        const hint = document.querySelector('.click-hint')
        hint.style.animation = 'none'
        hint.style.opacity = '0'
        hint.style.display = 'none'

        gsap.to('.main-video', { opacity: 0.6, duration: 1.5, ease: 'power2.out' })
        gsap.to('.sub-text-main', { opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.1 })
        gsap.to('.navbar', { top: 0, opacity: 1, duration: 1, ease: 'power2.out', delay: 0.3 })
        gsap.to('#stars', { opacity: 1, duration: 1, delay: 0.5 })

        // YouTube main 영상 재생 (클릭 이후 → 자동재생 정책 우회)
        if (mainPlayer && mainPlayer.playVideo) {
          mainPlayer.playVideo()
        }

        initStars()
        initTechTags()
        loadGithubProjects()
      }
    })
})

/* =====================================================================
   [별 반짝이는 캔버스 효과]
   Canvas API로 보라색 별 300개를 랜덤 위치에 그리고 반짝이게 함
   requestAnimationFrame으로 60fps로 계속 다시 그림
   ===================================================================== */
function initStars() {
  const canvas = document.getElementById('stars')
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const stars = []
  for (let i = 0; i < 300; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.005
    })
  }

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    stars.forEach(star => {
      star.alpha += star.speed
      if (star.alpha > 1 || star.alpha < 0) star.speed *= -1
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(212, 187, 239, ${star.alpha})`
      ctx.fill()
    })
    requestAnimationFrame(drawStars)
  }

  drawStars()
}

/* =====================================================================
   [스크롤 파티클 효과]
   About 섹션 안에서 스크롤할 때만 보라색 가루 파티클 생성
   ===================================================================== */
let lastScrollY = window.scrollY

window.addEventListener('scroll', function () {
  const currentScrollY = window.scrollY
  const scrollDiff = currentScrollY - lastScrollY
  lastScrollY = currentScrollY

  const aboutBottom = document.querySelector('#about').offsetTop + document.querySelector('#about').offsetHeight

  if (currentScrollY + window.innerHeight < aboutBottom) {
    for (let i = 0; i < 15; i++) {
      createParticle(scrollDiff)
    }
  }
})

/* =====================================================================
   [파티클 생성 함수]
   scrollDiff > 0: 아래로 스크롤 → 화면 위쪽에서 아래로 떨어짐
   scrollDiff < 0: 위로 스크롤 → 화면 아래쪽에서 위로 올라감
   ===================================================================== */
function createParticle(scrollDiff) {
  const particle = document.createElement('div')
  particle.classList.add('particle')
  document.body.appendChild(particle)

  const x = Math.random() * window.innerWidth
  const y = scrollDiff > 0
    ? Math.random() * window.innerHeight * 0.3
    : Math.random() * window.innerHeight * 0.7 + window.innerHeight * 0.3

  particle.style.left = x + 'px'
  particle.style.top = y + 'px'

  const size = Math.random() * 4 + 2
  particle.style.width = size + 'px'
  particle.style.height = size + 'px'

  const colors = [
    'rgba(180, 100, 255, 0.8)',
    'rgba(212, 187, 239, 0.8)',
    'rgba(140, 60, 255, 0.6)',
    'rgba(200, 150, 255, 0.7)'
  ]
  particle.style.background = colors[Math.floor(Math.random() * colors.length)]

  const fallDirection = scrollDiff > 0 ? window.innerHeight : -window.innerHeight * 0.5

  gsap.to(particle, {
    y: fallDirection * (Math.random() * 0.5 + 0.5),
    x: (Math.random() - 0.5) * 100,
    opacity: 0,
    duration: Math.random() * 1.5 + 0.5,
    ease: 'power1.out',
    onComplete: function () { particle.remove() }
  })
}

/* =====================================================================
   [Skills 섹션 SVG 선 드로잉 + 스킬 항목 등장]
   strokeDashoffset을 스크롤 progress에 따라 줄여서 선이 그어지는 효과
   선이 각 스킬 항목에 도달하면 제목과 별이 등장
   ===================================================================== */
const skillPath = document.getElementById('skillPath')
const skillItems = document.querySelectorAll('.skill-item')
const skillsSection = document.querySelector('.skills-section')

// 스킬 타이틀 옆에 ✦ 별을 붙이고 반짝이게 하는 함수
function sparkAt(item) {
  const title = item.querySelector('.skill-title')
  if (!title) return

  const star = document.createElement('span')
  star.classList.add('spark')
  star.textContent = '✦'
  title.appendChild(star)

  gsap.fromTo(star,
    { opacity: 0, scale: 0.5 },
    { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out',
      onComplete: () => {
        gsap.to(star, {
          opacity: 0.2, scale: 0.8, duration: 1,
          repeat: -1, yoyo: true, ease: 'sine.inOut'
        })
      }
    }
  )
}

if (skillPath && skillsSection) {
  const pathLength = skillPath.getTotalLength()
  skillPath.style.strokeDasharray = pathLength
  skillPath.style.strokeDashoffset = pathLength

  skillItems.forEach(item => {
    item.style.top = parseInt(item.dataset.position) + '%'
  })

  window.addEventListener('scroll', function () {
    const sectionTop = skillsSection.getBoundingClientRect().top
    const sectionHeight = skillsSection.offsetHeight
    const windowHeight = window.innerHeight

    const rawProgress = Math.max(0, Math.min(1, (-sectionTop) / (sectionHeight - windowHeight)))
    const progress = Math.min(rawProgress * 0.9, 1)
    const lineProgress = rawProgress < 0.75
      ? rawProgress * 0.9
      : 0.675 + ((rawProgress - 0.75) / 0.25) * 0.325

    skillPath.style.strokeDashoffset = pathLength * (1 - Math.min(lineProgress, 1))

    skillItems.forEach(item => {
      const itemProgress = parseInt(item.dataset.position) / 100 * 0.7

      if (progress >= itemProgress) {
        if (item.dataset.sparked !== 'true') {
          item.dataset.sparked = 'true'
          gsap.to(item, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
          sparkAt(item)
        }
      } else {
        if (item.dataset.sparked === 'true') {
          item.dataset.sparked = 'false'
          const star = item.querySelector('.spark')
          if (star) {
            gsap.killTweensOf(star)
            gsap.to(star, { opacity: 0, scale: 0.3, duration: 0.3, onComplete: () => star.remove() })
          }
          gsap.to(item, { opacity: 0, y: 20, duration: 0.3 })
        }
      }
    })

    if (progress >= 0.85) {
      gsap.to('.skills-ending', { opacity: 1, duration: 1, ease: 'power2.out' })
    }

    if (clicked) {
      const skillsTop = document.querySelector('#skills').offsetTop
      const fadeStart = skillsTop + window.innerHeight
      const fadeEnd = skillsTop + window.innerHeight * 3
      const starsOpacity = Math.max(0, 1 - (window.scrollY - fadeStart) / (fadeEnd - fadeStart))
      document.getElementById('stars').style.opacity = starsOpacity
    }
  })
}

/* =====================================================================
   [GitHub API 연동 - MVC 구조]
   Model: GitHub API JSON 데이터
   View: renderProjectCards()가 카드 HTML 생성
   Controller: loadGithubProjects()가 데이터를 받아 View에 전달
   ===================================================================== */
const GITHUB_USERNAME = 'una7620'

const DUMMY_PROJECTS = [
  { name: 'web-security-study', description: '웹 보안 취약점 분석 및 방어 기법 연구 프로젝트.', html_url: 'https://github.com/una7620', topics: ['security', 'web', 'java'], updated_at: '2025-05-20T00:00:00Z' },
  { name: 'cryptography-practice', description: '암호학 알고리즘 구현 실습. AES, RSA 등 구현.', html_url: 'https://github.com/una7620', topics: ['cryptography', 'java', 'algorithm'], updated_at: '2025-04-15T00:00:00Z' },
  { name: 'portfolio-website', description: '개인 포트폴리오 웹사이트. GitHub API 연동.', html_url: 'https://github.com/una7620', topics: ['html', 'css', 'javascript'], updated_at: '2025-06-01T00:00:00Z' }
]

async function loadGithubProjects() {
  const loadingEl = document.getElementById('projectsLoading')
  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=9`)
    if (!response.ok) throw new Error('API 요청 실패')
    const repos = await response.json()
    loadingEl.style.display = 'none'
    renderProjectCards(repos.length === 0 ? DUMMY_PROJECTS : repos, repos.length === 0)
  } catch (error) {
    console.log('GitHub API 오류, 더미 데이터 사용:', error)
    loadingEl.style.display = 'none'
    renderProjectCards(DUMMY_PROJECTS, true)
  }
}

/* =====================================================================
   [프로젝트 슬라이더 렌더링 - View 역할]
   카드 1개씩 슬라이드로 생성, 좌우 화살표와 점으로 페이지 전환
   ===================================================================== */
function renderProjectCards(projects, isDummy) {
  const trackEl = document.getElementById('projectsTrack')
  const dotsEl = document.getElementById('sliderDots')
  const prevBtn = document.getElementById('sliderPrev')
  const nextBtn = document.getElementById('sliderNext')

  if (isDummy) {
    const notice = document.createElement('p')
    notice.classList.add('projects-notice')
    document.getElementById('projectsSlider').before(notice)
    notice.textContent = '* GitHub 레포지토리 등록 후 자동으로 업데이트됩니다.'
  }

  let currentPage = 0
  const total = projects.length

  projects.forEach(function (repo, idx) {
    const date = new Date(repo.updated_at)
    const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
    const topics = repo.topics && repo.topics.length > 0 ? repo.topics : ['no-topic']
    const topicTags = topics.map(t => `<span class="project-topic">${t}</span>`).join('')

    const slide = document.createElement('div')
    slide.classList.add('projects-slide')
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
    `
    trackEl.appendChild(slide)

    const dot = document.createElement('button')
    dot.classList.add('slider-dot')
    if (idx === 0) dot.classList.add('active')
    dot.addEventListener('click', () => goTo(idx))
    dotsEl.appendChild(dot)
  })

  animateSlide(0)
  updateArrows()

  function goTo(page) {
    currentPage = page
    gsap.to(trackEl, { x: (-currentPage * 100) + '%', duration: 0.55, ease: 'power2.inOut' })
    document.querySelectorAll('.slider-dot').forEach((d, i) => d.classList.toggle('active', i === currentPage))
    updateArrows()
    animateSlide(currentPage)
  }

  function animateSlide(page) {
    const card = trackEl.children[page]?.querySelector('.project-card')
    if (!card) return
    gsap.fromTo(card, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' })
  }

  function updateArrows() {
    prevBtn.style.opacity = currentPage === 0 ? '0.2' : '1'
    prevBtn.style.pointerEvents = currentPage === 0 ? 'none' : 'auto'
    nextBtn.style.opacity = currentPage === total - 1 ? '0.2' : '1'
    nextBtn.style.pointerEvents = currentPage === total - 1 ? 'none' : 'auto'
  }

  prevBtn.addEventListener('click', () => { if (currentPage > 0) goTo(currentPage - 1) })
  nextBtn.addEventListener('click', () => { if (currentPage < total - 1) goTo(currentPage + 1) })
}

/* =====================================================================
   [로딩 전 스크롤 방지]
   클릭 전까지 휠/터치 스크롤을 막음
   passive: false 로 설정해야 preventDefault()가 작동함
   ===================================================================== */
window.addEventListener('wheel', function (e) { if (!clicked) e.preventDefault() }, { passive: false })
window.addEventListener('touchmove', function (e) { if (!clicked) e.preventDefault() }, { passive: false })

/* =====================================================================
   [기술 태그 floating 효과]
   메인화면 진입 후 hero 섹션에 기술 태그들이 고정 위치에서 둥둥 떠다님
   순서대로 서서히 나타나고 (딜레이 0.15초씩) GSAP으로 랜덤 움직임 적용
   ===================================================================== */
function initTechTags() {
  const techTags = ['#Java', '#JavaScript', '#HTML', '#CSS', '#C', '#Linux', '#자료구조', '#C++', '#Python', '#Git', '#SQL', '#정보처리기사', '#WhiteHat']
  const hero = document.querySelector('.hero')

  const positions = [
    { x: 30, y: 15 }, { x: 58, y: 10 }, { x: 20, y: 38 },
    { x: 68, y: 32 }, { x: 25, y: 60 }, { x: 63, y: 58 },
    { x: 45, y: 22 }, { x: 42, y: 45 }, { x: 32, y: 28 },
    { x: 62, y: 18 }, { x: 48, y: 70 }, { x: 35, y: 72 },
    { x: 65, y: 48 },
  ]

  techTags.forEach(function(tag, i) {
    const el = document.createElement('div')
    el.classList.add('tech-tag')
    el.textContent = tag
    el.style.left = positions[i].x + '%'
    el.style.top = positions[i].y + '%'
    el.style.opacity = '0'
    hero.appendChild(el)

    gsap.to(el, { opacity: 1, duration: 1, delay: 1.5 + i * 0.15, ease: 'power2.out' })
    gsap.to(el, {
      y: (Math.random() - 0.5) * 30,
      x: (Math.random() - 0.5) * 15,
      duration: 2.5 + Math.random() * 2,
      repeat: -1, yoyo: true, ease: 'sine.inOut',
      delay: Math.random() * 2
    })
  })
}
