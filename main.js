'use strict'

/* =====================
   페이지 진입 시 항상 맨 위로 이동
   새로고침해도 스크롤 위치 초기화
   ===================== */
window.scrollTo(0, 0)
// 페이지 로드 즉시 영상 음소거 상태로 재생 준비
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('video').forEach(v => {
    v.muted = true
    v.play().catch(() => {})
  })
})
history.scrollRestoration = 'manual'
document.body.classList.remove('entered')

let clicked = false
let animationReady = false

/* =====================
   로딩화면 등장 애니메이션
   LEE YUNA → 서브텍스트 → click hint 순서로 등장
   animationReady = true 가 되어야 클릭 가능
   ===================== */
const tl = gsap.timeline({
  onComplete: function () {
    animationReady = true
  }
})

tl
  .to('.center-name', { opacity: 1, duration: 1.5, ease: 'power2.out' })
  .to('.sub-text', { opacity: 1, duration: 0.8 })
  .to('.click-hint', { opacity: 1, duration: 0.8 })

/* =====================
   로딩화면 클릭 이벤트
   클릭하면 LEE YUNA 아래로 이동 후 메인화면 등장
   animationReady 체크로 애니메이션 끝나기 전 클릭 방지
   ===================== */
document.querySelector('.loader').addEventListener('click', function () {
  if (clicked || !animationReady) return
  clicked = true

  const tl2 = gsap.timeline()

  tl2
    .to(['.sub-text', '.click-hint'], { opacity: 0, duration: 0.3 })
    .to('.grid-video', { opacity: 0, duration: 0.8 }, '-=0.2')
    // LEE YUNA 글씨 아래로 이동
    // getBoundingClientRect()로 현재 위치를 계산해서 화면 맨 아래로 이동
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

        // LEE YUNA 글씨를 loader에서 hero로 옮겨서 하단에 고정
        const el = document.querySelector('.center-name')
        document.querySelector('.hero').appendChild(el)
        el.style.position = 'absolute'
        el.style.bottom = '10px'
        el.style.top = 'auto'
        el.style.left = '50%'
        el.style.transform = 'translateX(-50%)'
        el.style.zIndex = '10'

        // click-hint 완전히 숨기기 (pulse 애니메이션이 opacity를 덮어써서 display:none 처리)
        const hint = document.querySelector('.click-hint')
        hint.style.animation = 'none'
        hint.style.opacity = '0'
        hint.style.display = 'none'


         document.querySelectorAll('video').forEach(v => {
           v.muted = true
           v.play().catch(() => {})
         })

        gsap.to('.main-video', { opacity: 0.6, duration: 1.5, ease: 'power2.out' })
        gsap.to('.sub-text-main', { opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.1 })
        gsap.to('.navbar', { top: 0, opacity: 1, duration: 1, ease: 'power2.out', delay: 0.3 })
        gsap.to('#stars', { opacity: 1, duration: 1, delay: 0.5 })

        // 영상 강제 재생
        document.querySelectorAll('video').forEach(v => {
          v.play().catch(() => {})
        })
        initStars()
        initTechTags()
        loadGithubProjects()
      }
    })
})

/* =====================
   별 반짝이는 캔버스 효과
   Canvas API로 보라색 별들이 랜덤하게 반짝임

   동작 방식:
   1. canvas 크기를 화면 전체로 설정
   2. 300개의 별을 랜덤 위치에 생성
   3. 각 별마다 alpha(투명도)가 speed만큼 변하며 반짝임
   4. alpha가 0 또는 1을 넘으면 speed를 반전 (왔다갔다)
   ===================== */
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

/* =====================
   스크롤 파티클 효과
   About 섹션 안에서만 보라색 가루가 떨어짐
   aboutBottom을 기준으로 섹션 벗어나면 파티클 생성 안 함
   ===================== */
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

/* =====================
   파티클 생성 함수
   스크롤 방향에 따라 위/아래에서 생성되어 사라짐

   scrollDiff > 0 = 아래로 스크롤 → 화면 위쪽에서 생성
   scrollDiff < 0 = 위로 스크롤 → 화면 아래쪽에서 생성
   ===================== */
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

/* =====================
   Skills 섹션 스크롤 애니메이션
   SVG 선이 스크롤에 따라 그어지고
   스킬 항목들이 하나씩 등장하며
   마지막에 달 이미지와 핵심 문장 등장

   동작 방식:
   - strokeDasharray = 선 전체 길이 (점선 간격 설정)
   - strokeDashoffset = 숨길 길이 (0이면 전부 보임, 전체길이면 전부 숨김)
   - 스크롤 progress에 따라 offset을 줄이면 선이 점점 나타남
   ===================== */
const skillPath = document.getElementById('skillPath')
const skillItems = document.querySelectorAll('.skill-item')
const skillsSection = document.querySelector('.skills-section')

function sparkAt(item) {
  const title = item.querySelector('.skill-title')
  if (!title) return

  const star = document.createElement('span')
  star.classList.add('spark')
  star.textContent = '✦'
  title.appendChild(star)

  // 계속 반짝이는 애니메이션
  gsap.fromTo(star,
    { opacity: 0, scale: 0.5 },
    { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out',
      onComplete: () => {
        gsap.to(star, {
          opacity: 0.2,
          scale: 0.8,
          duration: 1,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
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
    const pos = parseInt(item.dataset.position)
    item.style.top = pos + '%'
  })

  window.addEventListener('scroll', function () {
    const sectionTop = skillsSection.getBoundingClientRect().top
    const sectionHeight = skillsSection.offsetHeight
    const windowHeight = window.innerHeight

    const rawProgress = Math.max(0, Math.min(1,
      (-sectionTop) / (sectionHeight - windowHeight)
    ))

    const progress = Math.min(rawProgress * 0.9, 1)

    const lineProgress = rawProgress < 0.75
      ? rawProgress * 0.9
      : 0.675 + ((rawProgress - 0.75) / 0.25) * 0.325

    skillPath.style.strokeDashoffset = pathLength * (1 - Math.min(lineProgress, 1))

    skillItems.forEach(item => {
      const itemProgress = parseInt(item.dataset.position) / 100 * 0.7

      if (progress >= itemProgress) {
        // 선이 도달했을 때 - 별 등장
        if (item.dataset.sparked !== 'true') {
          item.dataset.sparked = 'true'
          gsap.to(item, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out'
          })
          sparkAt(item)
        }
      } else {
        // 선이 아직 안 왔거나 위로 올라갔을 때 - 별 + 텍스트 사라짐
        if (item.dataset.sparked === 'true') {
          item.dataset.sparked = 'false'
          const star = item.querySelector('.spark')
          if (star) {
            gsap.killTweensOf(star)
            gsap.to(star, {
              opacity: 0,
              scale: 0.3,
              duration: 0.3,
              onComplete: () => star.remove()
            })
          }
          gsap.to(item, { opacity: 0, y: 20, duration: 0.3 })
        }
      }
    })

    if (progress >= 0.85) {
      gsap.to('.skills-ending', {
        opacity: 1,
        duration: 1,
        ease: 'power2.out'
      })
    }

    if (clicked) {
      const skillsTop = document.querySelector('#skills').offsetTop
      const fadeStart = skillsTop + window.innerHeight
      const fadeEnd = skillsTop + window.innerHeight * 3
      const currentScrollY = window.scrollY
      const starsOpacity = Math.max(0, 1 - (currentScrollY - fadeStart) / (fadeEnd - fadeStart))
      document.getElementById('stars').style.opacity = starsOpacity
    }
  })
}

/* =====================
   GitHub API 연동 - Projects 섹션 핵심 기능

   [MVC 구조 설명]
   Model      = GitHub API에서 받아온 JSON 데이터 (레포지토리 목록)
   View       = 카드 HTML (renderProjectCards 함수가 만들어냄)
   Controller = loadGithubProjects 함수 (데이터 받아서 View에 전달)

   [동작 방식]
   1. fetch()로 GitHub API 주소에 요청을 보냄
   2. GitHub이 JSON 형태로 레포지토리 목록을 돌려줌
   3. 받은 데이터를 카드 HTML로 변환해서 화면에 표시
   4. 레포가 없거나 API 오류 시 더미 데이터로 대체
   ===================== */
const GITHUB_USERNAME = 'una7620'

const DUMMY_PROJECTS = [
  {
    name: 'web-security-study',
    description: '웹 보안 취약점 분석 및 방어 기법 연구 프로젝트. SQL Injection, XSS 등 주요 공격 유형 학습.',
    html_url: 'https://github.com/una7620',
    topics: ['security', 'web', 'java'],
    updated_at: '2025-05-20T00:00:00Z'
  },
  {
    name: 'cryptography-practice',
    description: '암호학 알고리즘 구현 실습. AES, RSA 등 대칭/비대칭 암호화 알고리즘을 Java로 직접 구현.',
    html_url: 'https://github.com/una7620',
    topics: ['cryptography', 'java', 'algorithm'],
    updated_at: '2025-04-15T00:00:00Z'
  },
  {
    name: 'portfolio-website',
    description: '개인 포트폴리오 웹사이트. HTML, CSS, JavaScript로 제작. GitHub API 연동으로 프로젝트 자동 갱신.',
    html_url: 'https://github.com/una7620',
    topics: ['html', 'css', 'javascript'],
    updated_at: '2025-06-01T00:00:00Z'
  }
]

/* =====================
   GitHub API 호출 함수 (Controller 역할)

   fetch()는 JavaScript가 외부 서버에 데이터를 요청하는 방법
   await는 데이터가 올 때까지 기다린다는 뜻
   async/await 없으면 데이터 오기 전에 화면을 그리려고 해서 오류남
   try/catch로 오류 발생 시 더미 데이터로 안전하게 대체
   ===================== */
async function loadGithubProjects() {
  const loadingEl = document.getElementById('projectsLoading')

  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=9`)

    if (!response.ok) throw new Error('API 요청 실패')

    const repos = await response.json()
    loadingEl.style.display = 'none'

    if (repos.length === 0) {
      renderProjectCards(DUMMY_PROJECTS, true)
    } else {
      renderProjectCards(repos, false)
    }

  } catch (error) {
    console.log('GitHub API 오류, 더미 데이터 사용:', error)
    loadingEl.style.display = 'none'
    renderProjectCards(DUMMY_PROJECTS, true)
  }
}

/* =====================
   프로젝트 슬라이더 렌더링
   카드 1개씩, 좌우 화살표로 전환
   ===================== */
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

  // 카드 1개씩 슬라이드 생성
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

    // 점 네비게이션
    const dot = document.createElement('button')
    dot.classList.add('slider-dot')
    if (idx === 0) dot.classList.add('active')
    dot.addEventListener('click', () => goTo(idx))
    dotsEl.appendChild(dot)
  })

  // 첫 카드 등장
  animateSlide(0)
  updateArrows()

  function goTo(page) {
    currentPage = page
    gsap.to(trackEl, {
      x: (-currentPage * 100) + '%',
      duration: 0.55,
      ease: 'power2.inOut'
    })
    document.querySelectorAll('.slider-dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentPage)
    })
    updateArrows()
    animateSlide(currentPage)
  }

  function animateSlide(page) {
    const card = trackEl.children[page]?.querySelector('.project-card')
    if (!card) return
    gsap.fromTo(card,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
    )
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

/* =====================
   로딩 전 스크롤 막기
   클릭 전까지 휠/터치 스크롤 방지
   passive: false 로 설정해야 preventDefault() 가 작동함
   ===================== */
window.addEventListener('wheel', function (e) {
  if (!clicked) e.preventDefault()
}, { passive: false })

window.addEventListener('touchmove', function (e) {
  if (!clicked) e.preventDefault()
}, { passive: false })

// 기술 태그 floating 효과
// 기술 태그 floating 효과 - 메인화면 진입 후에만 등장
function initTechTags() {
  const techTags = ['#Java', '#JavaScript', '#HTML', '#CSS', '#C', '#Linux', '#자료구조', '#C++', '#Python', '#Git', '#SQL', '#정보처리기사', '#WhiteHat']
  const hero = document.querySelector('.hero')

  // 균형잡힌 위치 고정 배치
  const positions = [
    { x: 30, y: 15 },
    { x: 58, y: 10 },
    { x: 20, y: 38 },
    { x: 68, y: 32 },
    { x: 25, y: 60 },
    { x: 63, y: 58 },
    { x: 45, y: 22 },
    { x: 42, y: 45 },
    { x: 32, y: 28 },
    { x: 62, y: 18 },
    { x: 48, y: 70 },
    { x: 35, y: 72 },
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

    // 메인화면 등장 후 서서히 나타남
    gsap.to(el, { opacity: 1, duration: 1, delay: 1.5 + i * 0.15, ease: 'power2.out' })

    // 둥둥 떠다니는 애니메이션
    gsap.to(el, {
      y: (Math.random() - 0.5) * 30,
      x: (Math.random() - 0.5) * 15,
      duration: 2.5 + Math.random() * 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: Math.random() * 2
    })
  })
}
